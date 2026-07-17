import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";

const db = supabase as any;

type Category = { id: string; code: string; label: string; active: boolean };
type Skill = { id: string; category_id: string; code: string; label: string; position: number };
type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correct_index: number;
  explanation: string | null;
  skill_id: string | null;
  difficulty: string;
  active: boolean;
};

const emptyDraft = {
  prompt: "",
  choices: ["", "", "", ""],
  correct_index: 0,
  explanation: "",
  skill_id: null as string | null,
  difficulty: "moyen",
  active: true,
  categoryIds: [] as string[],
};

export const Route = createFileRoute("/_authenticated/admin/questions")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const [{ data: a }, { data: m }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: u.user.id, _role: "moniteur" }),
    ]);
    if (!a && !m) throw redirect({ to: "/dashboard" });
  },
  component: QuestionsPage,
});

function QuestionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qCats, setQCats] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<Question | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, s, q, l] = await Promise.all([
      db.from("exam_categories").select("*").order("code"),
      db.from("exam_skills").select("*").order("position"),
      db.from("exam_questions").select("*").order("created_at", { ascending: false }),
      db.from("exam_question_categories").select("*"),
    ]);
    setCategories(c.data ?? []);
    setSkills(s.data ?? []);
    setQuestions(q.data ?? []);
    const map: Record<string, string[]> = {};
    (l.data ?? []).forEach((r: any) => {
      (map[r.question_id] ||= []).push(r.category_id);
    });
    setQCats(map);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterSkill !== "all" && q.skill_id !== filterSkill) return false;
      if (filterCat !== "all" && !(qCats[q.id] || []).includes(filterCat)) return false;
      if (search && !q.prompt.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [questions, qCats, filterCat, filterSkill, search]);

  const catById = (id: string) => categories.find((c) => c.id === id);
  const skillById = (id: string | null) => (id ? skills.find((s) => s.id === id) : null);

  const remove = async (q: Question) => {
    if (!confirm("Supprimer cette question ?")) return;
    const { error } = await db.from("exam_questions").delete().eq("id", q.id);
    if (error) return toast.error(error.message);
    toast.success("Question supprimée");
    load();
  };

  const toggleActive = async (q: Question) => {
    const { error } = await db.from("exam_questions").update({ active: !q.active }).eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Banque de questions</h1>
            <p className="text-sm text-slate-500">
              Créez, éditez et rattachez les questions aux catégories et compétences.
            </p>
          </div>
          <Button onClick={() => { setCreating(true); setEditing(null); }}>
            <Plus className="h-4 w-4 mr-1" /> Nouvelle question
          </Button>
        </div>

        <Card>
          <CardContent className="p-3 grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="relative md:col-span-2">
              <Search className="h-4 w-4 absolute left-2 top-3 text-slate-400" />
              <Input
                className="pl-8"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.code} — {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSkill} onValueChange={setFilterSkill}>
              <SelectTrigger><SelectValue placeholder="Compétence" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes compétences</SelectItem>
                {skills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {(creating || editing) && (
          <QuestionForm
            key={editing?.id ?? "new"}
            initial={
              editing
                ? {
                    prompt: editing.prompt,
                    choices: (editing.choices?.length ? editing.choices : ["", "", "", ""]) as string[],
                    correct_index: editing.correct_index,
                    explanation: editing.explanation ?? "",
                    skill_id: editing.skill_id,
                    difficulty: editing.difficulty,
                    active: editing.active,
                    categoryIds: qCats[editing.id] ?? [],
                  }
                : emptyDraft
            }
            editingId={editing?.id ?? null}
            categories={categories}
            skills={skills}
            onCancel={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Questions ({filtered.length}/{questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <p className="text-sm text-slate-500">Chargement…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">Aucune question.</p>
            )}
            {filtered.map((q) => {
              const cats = (qCats[q.id] ?? []).map(catById).filter(Boolean) as Category[];
              const sk = skillById(q.skill_id);
              return (
                <div key={q.id} className="border rounded p-3 space-y-2 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{q.prompt}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Bonne réponse : <span className="text-emerald-700">{q.choices[q.correct_index]}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => toggleActive(q)}>
                        <Switch checked={q.active} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(q); setCreating(false); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => remove(q)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sk && <Badge variant="secondary">{sk.label}</Badge>}
                    <Badge variant="outline">{q.difficulty}</Badge>
                    {!q.active && <Badge variant="outline">Inactif</Badge>}
                    {cats.map((c) => (
                      <Badge key={c.id} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        {c.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuestionForm({
  initial,
  editingId,
  categories,
  skills,
  onCancel,
  onSaved,
}: {
  initial: typeof emptyDraft;
  editingId: string | null;
  categories: Category[];
  skills: Skill[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);

  const availableSkills = draft.categoryIds.length > 0
    ? skills.filter((s) => draft.categoryIds.includes(s.category_id))
    : skills;

  const setChoice = (i: number, v: string) => {
    const c = [...draft.choices];
    c[i] = v;
    setDraft({ ...draft, choices: c });
  };

  const addChoice = () => setDraft({ ...draft, choices: [...draft.choices, ""] });
  const removeChoice = (i: number) => {
    if (draft.choices.length <= 2) return;
    const c = draft.choices.filter((_, idx) => idx !== i);
    setDraft({
      ...draft,
      choices: c,
      correct_index: Math.min(draft.correct_index, c.length - 1),
    });
  };

  const toggleCat = (id: string) => {
    const has = draft.categoryIds.includes(id);
    setDraft({
      ...draft,
      categoryIds: has ? draft.categoryIds.filter((x) => x !== id) : [...draft.categoryIds, id],
    });
  };

  const save = async () => {
    if (!draft.prompt.trim()) return toast.error("Énoncé requis");
    if (draft.choices.some((c) => !c.trim())) return toast.error("Toutes les réponses doivent être remplies");
    setSaving(true);
    const payload = {
      prompt: draft.prompt.trim(),
      choices: draft.choices.map((c) => c.trim()),
      correct_index: draft.correct_index,
      explanation: draft.explanation.trim() || null,
      skill_id: draft.skill_id,
      difficulty: draft.difficulty,
      active: draft.active,
    };

    let questionId = editingId;
    if (editingId) {
      const { error } = await db.from("exam_questions").update(payload).eq("id", editingId);
      if (error) { setSaving(false); return toast.error(error.message); }
    } else {
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await db.from("exam_questions")
        .insert({ ...payload, created_by: u.user?.id })
        .select("id").single();
      if (error) { setSaving(false); return toast.error(error.message); }
      questionId = data.id;
    }

    if (questionId) {
      await db.from("exam_question_categories").delete().eq("question_id", questionId);
      if (draft.categoryIds.length > 0) {
        const rows = draft.categoryIds.map((cid) => ({ question_id: questionId, category_id: cid }));
        const { error } = await db.from("exam_question_categories").insert(rows);
        if (error) { setSaving(false); return toast.error(error.message); }
      }
    }

    setSaving(false);
    toast.success(editingId ? "Question mise à jour" : "Question créée");
    onSaved();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {editingId ? "Modifier la question" : "Nouvelle question"}
            </CardTitle>
            <CardDescription>Rattachez-la à une compétence et une ou plusieurs catégories.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Énoncé</Label>
          <Textarea value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} rows={2} />
        </div>

        <div className="space-y-2">
          <Label>Réponses (cochez la bonne)</Label>
          {draft.choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct"
                checked={draft.correct_index === i}
                onChange={() => setDraft({ ...draft, correct_index: i })}
                className="h-4 w-4 accent-emerald-600"
              />
              <Input value={c} onChange={(e) => setChoice(i, e.target.value)} placeholder={`Réponse ${i + 1}`} />
              <Button size="sm" variant="ghost" onClick={() => removeChoice(i)} disabled={draft.choices.length <= 2}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={addChoice}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter une réponse
          </Button>
        </div>

        <div>
          <Label>Explication (optionnel)</Label>
          <Textarea value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} rows={2} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Difficulté</Label>
            <Select value={draft.difficulty} onValueChange={(v) => setDraft({ ...draft, difficulty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="facile">Facile</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="difficile">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Compétence</Label>
            <Select
              value={draft.skill_id ?? "none"}
              onValueChange={(v) => setDraft({ ...draft, skill_id: v === "none" ? null : v })}
            >
              <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucune —</SelectItem>
                {availableSkills.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Catégories associées</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 border rounded p-2 bg-slate-50">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={draft.categoryIds.includes(c.id)}
                  onCheckedChange={() => toggleCat(c.id)}
                />
                <span>{c.code} — {c.label}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <p className="text-xs text-slate-500 col-span-full">Aucune catégorie configurée.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
          <span className="text-sm">Question active</span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={save} disabled={saving}>
            <Check className="h-4 w-4 mr-1" /> {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
