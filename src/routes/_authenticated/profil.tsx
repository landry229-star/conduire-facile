import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profil")({
  component: Profil,
});

const CATEGORIES = ["AM", "A1", "A2", "A", "B1", "B", "BE", "C", "D"];

function Profil() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email || "");
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setCategory(data.category || "");
      }
      setLoading(false);
    })();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: u.user.id, full_name: fullName, phone, category, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profil mis à jour");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <Button asChild variant="ghost" className="mb-4"><Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" />Retour</Link></Button>
        <Card>
          <CardHeader><CardTitle>Mon profil</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              <div>
                <Label>Nom complet</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+22997000000" />
              </div>
              <div>
                <Label>Catégorie de permis visée</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
