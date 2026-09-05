import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ensureStaffAccess } from "@/lib/access-control";

type Student = Database["public"]["Tables"]["profiles"]["Row"];

const APPROVAL_OPTIONS = [
    { label: "En attente", value: "pending" },
    { label: "Approuvé", value: "approved" },
    { label: "Refusé", value: "rejected" },
] as const;
type DrivingHour = Database["public"]["Tables"]["driving_hours"]["Row"];
type Payment = Database["public"]["Tables"]["payment_installments"]["Row"];
type QuizAttempt = Database["public"]["Tables"]["quiz_attempts"]["Row"];
type ExamAttempt = Database["public"]["Tables"]["exam_attempts"]["Row"];

export const Route = createFileRoute("/_authenticated/admin")({
    beforeLoad: async ({ location }) => {
        await ensureStaffAccess(location.pathname);
    },
    component: AdminPage,
});

function AdminPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selected, setSelected] = useState<Student | null>(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
        const nextStudents = data ?? [];
        setStudents(nextStudents);
        setSelected((current) => {
            if (!current) return current;
            return nextStudents.find((student) => student.id === current.id) ?? current;
        });
    };

    const pendingCount = students.filter((student) => student.account_status !== "approved").length;

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <h1 className="text-2xl font-bold">Espace admin / moniteur</h1>
                    <Badge variant="outline">{pendingCount} en attente</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Élèves ({students.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
                            {students.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setSelected(s)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-emerald-50 ${selected?.id === s.id ? "bg-emerald-100" : ""}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-medium">
                                            {s.full_name || "Sans nom"}
                                        </div>
                                        <Badge
                                            variant={
                                                s.account_status === "approved"
                                                    ? "default"
                                                    : s.account_status === "rejected"
                                                      ? "destructive"
                                                      : "secondary"
                                            }
                                            className="text-[10px]"
                                        >
                                            {s.account_status || "pending"}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {s.phone || "—"} · {s.category || "?"}
                                    </div>
                                </button>
                            ))}
                            {students.length === 0 && (
                                <p className="text-sm text-slate-500">Aucun élève inscrit.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2">
                        {selected ? (
                            <StudentDetail student={selected} onUpdated={loadStudents} />
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-slate-500">
                                    Sélectionnez un élève à gauche.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StudentDetail({ student, onUpdated }: { student: Student; onUpdated: () => void }) {
    const [hours, setHours] = useState<DrivingHour[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
    const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
    const [completedLessons, setCompletedLessons] = useState(0);
    const [approvalNote, setApprovalNote] = useState(student.approval_notes ?? "");
    const [approvalLoading, setApprovalLoading] = useState(false);

    useEffect(() => {
        load();
    }, [student.id]);

    useEffect(() => {
        setApprovalNote(student.approval_notes ?? "");
    }, [student.id, student.approval_notes]);

    const load = async () => {
        const [h, pay, q, ex, t] = await Promise.all([
            supabase
                .from("driving_hours")
                .select("*")
                .eq("user_id", student.id)
                .order("session_date", { ascending: false }),
            supabase
                .from("payment_installments")
                .select("*")
                .eq("user_id", student.id)
                .order("created_at"),
            supabase
                .from("quiz_attempts")
                .select("*")
                .eq("user_id", student.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("exam_attempts")
                .select("*")
                .eq("user_id", student.id)
                .order("created_at", { ascending: false }),
            supabase
                .from("theorie_progress")
                .select("id", { count: "exact", head: true })
                .eq("user_id", student.id),
        ]);
        setHours(h.data ?? []);
        setPayments(pay.data ?? []);
        setQuizAttempts(q.data ?? []);
        setExamAttempts(ex.data ?? []);
        setCompletedLessons(t.count ?? 0);
    };

    const updateApproval = async (status: (typeof APPROVAL_OPTIONS)[number]["value"]) => {
        setApprovalLoading(true);
        const { error } = await supabase
            .from("profiles")
            .update({
                account_status: status,
                approved_at: status === "approved" ? new Date().toISOString() : null,
                approval_notes: approvalNote.trim() || null,
            })
            .eq("id", student.id);
        setApprovalLoading(false);

        if (error) {
            toast.error(error.message);
            return;
        }

        toast.success(
            status === "approved"
                ? "Compte approuvé"
                : status === "rejected"
                  ? "Compte refusé"
                  : "Compte remis en attente",
        );
        onUpdated();
    };

    // Add hours
    const [duration, setDuration] = useState(60);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [skills, setSkills] = useState("");
    const addHours = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
            toast.error("La durée doit être comprise entre 1 et 480 minutes.");
            return;
        }
        if (!date) {
            toast.error("La date de séance est obligatoire.");
            return;
        }
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase.from("driving_hours").insert({
            user_id: student.id,
            moniteur_id: u.user?.id,
            session_date: date,
            duration_minutes: duration,
            skills: skills ? skills.split(",").map((s) => s.trim()) : null,
        });
        if (error) return toast.error(error.message);
        toast.success("Séance ajoutée");
        setSkills("");
        load();
        onUpdated();
    };

    // Add payment
    const [payLabel, setPayLabel] = useState("");
    const [payAmount, setPayAmount] = useState(0);
    const addPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payLabel.trim()) {
            toast.error("Le libellé du paiement est obligatoire.");
            return;
        }
        if (!Number.isInteger(payAmount) || payAmount <= 0) {
            toast.error("Le montant doit être un nombre entier positif.");
            return;
        }
        const { error } = await supabase.from("payment_installments").insert({
            user_id: student.id,
            label: payLabel.trim(),
            amount_fcfa: payAmount,
        });
        if (error) return toast.error(error.message);
        toast.success("Tranche ajoutée");
        setPayLabel("");
        setPayAmount(0);
        load();
    };

    const togglePaid = async (p: Payment) => {
        const { error } = await supabase
            .from("payment_installments")
            .update({ paid: !p.paid, paid_at: !p.paid ? new Date().toISOString() : null })
            .eq("id", p.id);
        if (error) return toast.error(error.message);
        load();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>{student.full_name || "Élève"}</CardTitle>
                        <CardDescription>
                            {student.phone || "—"} · Catégorie {student.category || "?"}
                        </CardDescription>
                    </div>
                    <Badge
                        variant={
                            student.account_status === "approved"
                                ? "default"
                                : student.account_status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                        }
                    >
                        {student.account_status || "pending"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="rounded border bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Cours</div>
                        <div className="text-lg font-semibold">{completedLessons}/27</div>
                    </div>
                    <div className="rounded border bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Quiz</div>
                        <div className="text-lg font-semibold">{quizAttempts.length}</div>
                    </div>
                    <div className="rounded border bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Examens</div>
                        <div className="text-lg font-semibold">{examAttempts.length}</div>
                    </div>
                    <div className="rounded border bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Examen réussi</div>
                        <div className="text-lg font-semibold">
                            {examAttempts.filter((attempt) => attempt.passed).length}
                        </div>
                    </div>
                </div>
                <div className="rounded border bg-slate-50 p-3">
                    <div className="mb-2 font-medium">Validation du compte</div>
                    <div className="flex flex-wrap gap-2">
                        {APPROVAL_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                size="sm"
                                variant={
                                    student.account_status === option.value ? "default" : "outline"
                                }
                                onClick={() => updateApproval(option.value)}
                                disabled={
                                    approvalLoading || student.account_status === option.value
                                }
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                    <div className="mt-3">
                        <Label htmlFor="approval-note">Note d’admin</Label>
                        <Input
                            id="approval-note"
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Ex: dossier validé, pièces manquantes, refus pour ..."
                        />
                    </div>
                </div>

                <Tabs defaultValue="hours">
                    <TabsList>
                        <TabsTrigger value="hours">Conduite</TabsTrigger>
                        <TabsTrigger value="pay">Paiements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hours" className="space-y-4 mt-4">
                        <form
                            onSubmit={addHours}
                            className="grid grid-cols-2 gap-2 border p-3 rounded bg-slate-50"
                        >
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Durée (min)</Label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(+e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Compétences (séparées par virgule)</Label>
                                <Input
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="démarrage, créneau, autoroute"
                                />
                            </div>
                            <Button type="submit" className="col-span-2">
                                Ajouter la séance
                            </Button>
                        </form>
                        <div className="space-y-1 text-sm">
                            {hours.map((h) => (
                                <div key={h.id} className="flex justify-between border-b py-2">
                                    <div>
                                        <div>
                                            {new Date(h.session_date).toLocaleDateString("fr-FR")}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {h.skills?.join(", ")}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{h.duration_minutes} min</Badge>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="pay" className="space-y-4 mt-4">
                        <form
                            onSubmit={addPayment}
                            className="grid grid-cols-3 gap-2 border p-3 rounded bg-slate-50"
                        >
                            <div className="col-span-2">
                                <Label>Libellé</Label>
                                <Input
                                    value={payLabel}
                                    onChange={(e) => setPayLabel(e.target.value)}
                                    placeholder="Acompte, Solde, etc."
                                    required
                                />
                            </div>
                            <div>
                                <Label>Montant FCFA</Label>
                                <Input
                                    type="number"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(+e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="col-span-3">
                                Ajouter la tranche
                            </Button>
                        </form>
                        <div className="space-y-1 text-sm">
                            {payments.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between items-center border-b py-2"
                                >
                                    <div>
                                        <div className="font-medium">{p.label}</div>
                                        <div className="text-xs text-slate-500">
                                            {p.amount_fcfa.toLocaleString("fr-FR")} FCFA
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={p.paid ? "default" : "outline"}
                                        onClick={() => togglePaid(p)}
                                        className={p.paid ? "bg-emerald-600" : ""}
                                    >
                                        {p.paid ? "Payé ✓" : "Marquer payé"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
