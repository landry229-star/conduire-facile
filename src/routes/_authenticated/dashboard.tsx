import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ClipboardCheck, Award, Car, CreditCard, User, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const TOTAL_LESSONS = 25;

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [lessonsDone, setLessonsDone] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [hours, setHours] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [p, r, l, q, e, h, pay] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
        supabase.from("theorie_progress").select("lesson_id").eq("user_id", u.user.id),
        supabase.from("quiz_attempts").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("exam_attempts").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("driving_hours").select("*").eq("user_id", u.user.id).order("session_date", { ascending: false }),
        supabase.from("payment_installments").select("*").eq("user_id", u.user.id).order("created_at"),
      ]);
      setProfile(p.data);
      setRoles(r.data?.map((x: any) => x.role) ?? []);
      setLessonsDone(l.data?.length ?? 0);
      setQuizAttempts(q.data ?? []);
      setExamAttempts(e.data ?? []);
      setHours(h.data ?? []);
      setPayments(pay.data ?? []);
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/" });
  };

  const totalMinutes = hours.reduce((s, h) => s + (h.duration_minutes || 0), 0);
  const paidTotal = payments.filter((p) => p.paid).reduce((s, p) => s + p.amount_fcfa, 0);
  const grandTotal = payments.reduce((s, p) => s + p.amount_fcfa, 0);
  const progressPct = Math.round((lessonsDone / TOTAL_LESSONS) * 100);
  const isAdmin = roles.includes("admin");
  const isMoniteur = roles.includes("moniteur");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-emerald-700">L'Excellence Auto-École</Link>
          <div className="flex items-center gap-2">
            {(isAdmin || isMoniteur) && (
              <Button size="sm" variant="outline" asChild>
                <Link to="/admin"><ShieldCheck className="h-4 w-4 mr-1" />Admin</Link>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link to="/profil"><User className="h-4 w-4 mr-1" />Profil</Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Bonjour {profile?.full_name || "élève"} 👋</h1>
          <p className="text-slate-600 text-sm">Voici votre tableau de bord de formation.</p>
          <div className="flex gap-2 mt-2">
            {roles.map((r) => (
              <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>
            ))}
            {profile?.category && <Badge variant="outline">Catégorie {profile.category}</Badge>}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><BookOpen className="h-4 w-4" />Théorie</CardDescription>
              <CardTitle className="text-3xl">{progressPct}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPct} className="h-2" />
              <p className="text-xs mt-1 text-slate-500">{lessonsDone} / {TOTAL_LESSONS} leçons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><ClipboardCheck className="h-4 w-4" />Quiz</CardDescription>
              <CardTitle className="text-3xl">{quizAttempts.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{quizAttempts.length ? `Dernier : ${quizAttempts[0].score}/${quizAttempts[0].total}` : "Aucune tentative"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Award className="h-4 w-4" />Examens</CardDescription>
              <CardTitle className="text-3xl">{examAttempts.filter((e) => e.passed).length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{examAttempts.length} tentatives</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1"><Car className="h-4 w-4" />Conduite</CardDescription>
              <CardTitle className="text-3xl">{Math.floor(totalMinutes / 60)}h{String(totalMinutes % 60).padStart(2, "0")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">{hours.length} séances</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Continuer ma formation</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild><Link to="/theorie">📚 Théorie</Link></Button>
            <Button asChild variant="outline"><Link to="/quiz">🎯 Quiz code</Link></Button>
            <Button asChild variant="outline"><Link to="/quiz-panneaux">🚦 Quiz panneaux</Link></Button>
            <Button asChild variant="outline"><Link to="/examen">🏁 Examen blanc</Link></Button>
            <Button asChild variant="outline"><Link to="/panneaux">Panneaux</Link></Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent attempts */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Historique récent</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[...quizAttempts, ...examAttempts]
                .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
                .slice(0, 6)
                .map((a: any) => (
                  <div key={a.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{a.quiz_type ? `Quiz ${a.quiz_type}` : `Examen ${a.category || "blanc"}`}</div>
                      <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <Badge variant={a.passed === false ? "destructive" : "secondary"}>
                      {a.score}/{a.total}
                    </Badge>
                  </div>
                ))}
              {quizAttempts.length + examAttempts.length === 0 && (
                <p className="text-slate-500">Aucun historique. Commencez par un quiz !</p>
              )}
            </CardContent>
          </Card>

          {/* Paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-4 w-4" />Paiements</CardTitle>
              <CardDescription>
                {paidTotal.toLocaleString("fr-FR")} / {grandTotal.toLocaleString("fr-FR")} FCFA payés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {payments.length === 0 && <p className="text-slate-500">Aucune tranche enregistrée. Voyez avec l'administration.</p>}
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-slate-500">
                      {p.paid ? `Payé le ${new Date(p.paid_at).toLocaleDateString("fr-FR")}${p.method ? " · " + p.method : ""}` : "En attente"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{p.amount_fcfa.toLocaleString("fr-FR")} FCFA</div>
                    <Badge variant={p.paid ? "default" : "outline"} className={p.paid ? "bg-emerald-600" : ""}>
                      {p.paid ? "Payé" : "Dû"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Heures de conduite */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Car className="h-4 w-4" />Heures de conduite</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {hours.length === 0 && <p className="text-slate-500">Aucune séance validée pour l'instant.</p>}
              {hours.slice(0, 8).map((h) => (
                <div key={h.id} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <div className="font-medium">{new Date(h.session_date).toLocaleDateString("fr-FR")}</div>
                    <div className="text-xs text-slate-500">{h.skills?.join(", ") || h.notes || "Séance de conduite"}</div>
                  </div>
                  <Badge variant="outline">{h.duration_minutes} min</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
