import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: r } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    const { data: r2 } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "moniteur" });
    if (!r && !r2) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setStudents(data ?? []);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Espace admin / moniteur</h1>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardHeader><CardTitle className="text-lg">Élèves ({students.length})</CardTitle></CardHeader>
            <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-emerald-50 ${selected?.id === s.id ? "bg-emerald-100" : ""}`}
                >
                  <div className="font-medium">{s.full_name || "Sans nom"}</div>
                  <div className="text-xs text-slate-500">{s.phone || "—"} · {s.category || "?"}</div>
                </button>
              ))}
              {students.length === 0 && <p className="text-sm text-slate-500">Aucun élève inscrit.</p>}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            {selected ? <StudentDetail student={selected} onUpdated={loadStudents} /> : (
              <Card><CardContent className="p-8 text-center text-slate-500">Sélectionnez un élève à gauche.</CardContent></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentDetail({ student, onUpdated }: { student: any; onUpdated: () => void }) {
  const [hours, setHours] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => { load(); }, [student.id]);

  const load = async () => {
    const [h, p] = await Promise.all([
      supabase.from("driving_hours").select("*").eq("user_id", student.id).order("session_date", { ascending: false }),
      supabase.from("payment_installments").select("*").eq("user_id", student.id).order("created_at"),
    ]);
    setHours(h.data ?? []);
    setPayments(p.data ?? []);
  };

  // Add hours
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [skills, setSkills] = useState("");
  const addHours = async (e: React.FormEvent) => {
    e.preventDefault();
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
    const { error } = await supabase.from("payment_installments").insert({
      user_id: student.id,
      label: payLabel,
      amount_fcfa: payAmount,
    });
    if (error) return toast.error(error.message);
    toast.success("Tranche ajoutée");
    setPayLabel(""); setPayAmount(0);
    load();
  };

  const togglePaid = async (p: any) => {
    const { error } = await supabase.from("payment_installments")
      .update({ paid: !p.paid, paid_at: !p.paid ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.full_name || "Élève"}</CardTitle>
        <CardDescription>{student.phone || "—"} · Catégorie {student.category || "?"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="hours">
          <TabsList>
            <TabsTrigger value="hours">Conduite</TabsTrigger>
            <TabsTrigger value="pay">Paiements</TabsTrigger>
          </TabsList>

          <TabsContent value="hours" className="space-y-4 mt-4">
            <form onSubmit={addHours} className="grid grid-cols-2 gap-2 border p-3 rounded bg-slate-50">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
              <div><Label>Durée (min)</Label><Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} required /></div>
              <div className="col-span-2"><Label>Compétences (séparées par virgule)</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="démarrage, créneau, autoroute" /></div>
              <Button type="submit" className="col-span-2">Ajouter la séance</Button>
            </form>
            <div className="space-y-1 text-sm">
              {hours.map((h) => (
                <div key={h.id} className="flex justify-between border-b py-2">
                  <div>
                    <div>{new Date(h.session_date).toLocaleDateString("fr-FR")}</div>
                    <div className="text-xs text-slate-500">{h.skills?.join(", ")}</div>
                  </div>
                  <Badge variant="outline">{h.duration_minutes} min</Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pay" className="space-y-4 mt-4">
            <form onSubmit={addPayment} className="grid grid-cols-3 gap-2 border p-3 rounded bg-slate-50">
              <div className="col-span-2"><Label>Libellé</Label><Input value={payLabel} onChange={(e) => setPayLabel(e.target.value)} placeholder="Acompte, Solde, etc." required /></div>
              <div><Label>Montant FCFA</Label><Input type="number" value={payAmount} onChange={(e) => setPayAmount(+e.target.value)} required /></div>
              <Button type="submit" className="col-span-3">Ajouter la tranche</Button>
            </form>
            <div className="space-y-1 text-sm">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-slate-500">{p.amount_fcfa.toLocaleString("fr-FR")} FCFA</div>
                  </div>
                  <Button size="sm" variant={p.paid ? "default" : "outline"} onClick={() => togglePaid(p)} className={p.paid ? "bg-emerald-600" : ""}>
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
