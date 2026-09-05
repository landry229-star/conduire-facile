import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X, Check } from "lucide-react";
import { ensureStaffAccess } from "@/lib/access-control";

type Category = Database["public"]["Tables"]["exam_categories"]["Row"];
type Skill = Database["public"]["Tables"]["exam_skills"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/categories")({
    beforeLoad: async ({ location }) => {
        await ensureStaffAccess(location.pathname);
    },
    component: CategoriesPage,
});

function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selected, setSelected] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const [c, s] = await Promise.all([
            supabase.from("exam_categories").select("*").order("code"),
            supabase.from("exam_skills").select("*").order("position"),
        ]);
        setCategories(c.data ?? []);
        setSkills(s.data ?? []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (!selected && categories.length > 0) setSelected(categories[0]);
        if (selected) {
            const fresh = categories.find((c) => c.id === selected.id);
            if (fresh && fresh !== selected) setSelected(fresh);
        }
    }, [categories, selected]);

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold">Catégories d'examen</h1>
                    <p className="text-sm text-slate-500">
                        Créez et modifiez les catégories de permis et la grille de compétences
                        évaluées.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-3">
                        <CategoryCreate onCreated={load} />
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Catégories ({categories.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 max-h-[60vh] overflow-y-auto">
                                {loading && <p className="text-sm text-slate-500">Chargement…</p>}
                                {!loading && categories.length === 0 && (
                                    <p className="text-sm text-slate-500">Aucune catégorie.</p>
                                )}
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelected(c)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-emerald-50 flex items-center justify-between ${
                                            selected?.id === c.id ? "bg-emerald-100" : ""
                                        }`}
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {c.code} — {c.label}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">
                                                {c.description || "—"}
                                            </div>
                                        </div>
                                        {!c.active && <Badge variant="outline">Inactif</Badge>}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        {selected ? (
                            <CategoryDetail
                                key={selected.id}
                                category={selected}
                                skills={skills.filter((s) => s.category_id === selected.id)}
                                onChanged={load}
                            />
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-slate-500">
                                    Sélectionnez ou créez une catégorie.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryCreate({ onCreated }: { onCreated: () => void }) {
    const [code, setCode] = useState("");
    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("exam_categories").insert({
            code: code.trim().toUpperCase(),
            label: label.trim(),
            description: description.trim() || null,
        });
        if (error) return toast.error(error.message);
        toast.success("Catégorie créée");
        setCode("");
        setLabel("");
        setDescription("");
        onCreated();
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Nouvelle catégorie</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                            <Label className="text-xs">Code</Label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="B"
                                required
                                maxLength={8}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label className="text-xs">Libellé</Label>
                            <Input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Voitures"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optionnel"
                        />
                    </div>
                    <Button type="submit" className="w-full" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Créer
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function CategoryDetail({
    category,
    skills,
    onChanged,
}: {
    category: Category;
    skills: Skill[];
    onChanged: () => void;
}) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        code: category.code,
        label: category.label,
        description: category.description ?? "",
        active: category.active,
    });

    useEffect(() => {
        setForm({
            code: category.code,
            label: category.label,
            description: category.description ?? "",
            active: category.active,
        });
        setEditing(false);
    }, [category.id]);

    const save = async () => {
        const { error } = await supabase
            .from("exam_categories")
            .update({
                code: form.code.trim().toUpperCase(),
                label: form.label.trim(),
                description: form.description.trim() || null,
                active: form.active,
            })
            .eq("id", category.id);
        if (error) return toast.error(error.message);
        toast.success("Catégorie mise à jour");
        setEditing(false);
        onChanged();
    };

    const remove = async () => {
        if (!confirm(`Supprimer la catégorie ${category.code} et ses compétences ?`)) return;
        const { error } = await supabase.from("exam_categories").delete().eq("id", category.id);
        if (error) return toast.error(error.message);
        toast.success("Catégorie supprimée");
        onChanged();
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            {!editing ? (
                                <>
                                    <CardTitle>
                                        {category.code} — {category.label}
                                    </CardTitle>
                                    <CardDescription>
                                        {category.description || "Aucune description"}
                                    </CardDescription>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="col-span-1">
                                            <Label className="text-xs">Code</Label>
                                            <Input
                                                value={form.code}
                                                onChange={(e) =>
                                                    setForm({ ...form, code: e.target.value })
                                                }
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="text-xs">Libellé</Label>
                                            <Input
                                                value={form.label}
                                                onChange={(e) =>
                                                    setForm({ ...form, label: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Description</Label>
                                        <Textarea
                                            value={form.description}
                                            onChange={(e) =>
                                                setForm({ ...form, description: e.target.value })
                                            }
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={form.active}
                                            onCheckedChange={(v) => setForm({ ...form, active: v })}
                                        />
                                        <span className="text-sm">Active</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {!editing ? (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditing(true)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={remove}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button size="sm" onClick={save}>
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditing(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <SkillsPanel category={category} skills={skills} onChanged={onChanged} />
        </div>
    );
}

function SkillsPanel({
    category,
    skills,
    onChanged,
}: {
    category: Category;
    skills: Skill[];
    onChanged: () => void;
}) {
    const [code, setCode] = useState("");
    const [label, setLabel] = useState("");

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextPos = (skills[skills.length - 1]?.position ?? 0) + 1;
        const { error } = await supabase.from("exam_skills").insert({
            category_id: category.id,
            code: code.trim().toLowerCase().replace(/\s+/g, "_"),
            label: label.trim(),
            position: nextPos,
        });
        if (error) return toast.error(error.message);
        toast.success("Compétence ajoutée");
        setCode("");
        setLabel("");
        onChanged();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Compétences ({skills.length})</CardTitle>
                <CardDescription>
                    Grille utilisée pour noter l'examen dans cette catégorie.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <form
                    onSubmit={add}
                    className="grid grid-cols-5 gap-2 border p-3 rounded bg-slate-50"
                >
                    <div className="col-span-2">
                        <Label className="text-xs">Code</Label>
                        <Input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="panneaux"
                            required
                        />
                    </div>
                    <div className="col-span-3">
                        <Label className="text-xs">Libellé</Label>
                        <Input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Panneaux et signalisation"
                            required
                        />
                    </div>
                    <Button type="submit" className="col-span-5" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Ajouter la compétence
                    </Button>
                </form>

                <div className="space-y-1">
                    {skills.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Aucune compétence configurée.
                        </p>
                    )}
                    {skills.map((s) => (
                        <SkillRow key={s.id} skill={s} onChanged={onChanged} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function SkillRow({ skill, onChanged }: { skill: Skill; onChanged: () => void }) {
    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(skill.label);
    const [code, setCode] = useState(skill.code);
    const [position, setPosition] = useState(skill.position);

    const save = async () => {
        const { error } = await supabase
            .from("exam_skills")
            .update({
                code: code.trim().toLowerCase(),
                label: label.trim(),
                position,
            })
            .eq("id", skill.id);
        if (error) return toast.error(error.message);
        toast.success("Compétence mise à jour");
        setEditing(false);
        onChanged();
    };

    const remove = async () => {
        if (!confirm(`Supprimer la compétence "${skill.label}" ?`)) return;
        const { error } = await supabase.from("exam_skills").delete().eq("id", skill.id);
        if (error) return toast.error(error.message);
        toast.success("Compétence supprimée");
        onChanged();
    };

    if (editing) {
        return (
            <div className="grid grid-cols-6 gap-2 items-end border rounded p-2 bg-slate-50">
                <div className="col-span-1">
                    <Label className="text-xs">#</Label>
                    <Input
                        type="number"
                        value={position}
                        onChange={(e) => setPosition(+e.target.value)}
                    />
                </div>
                <div className="col-span-2">
                    <Label className="text-xs">Code</Label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="col-span-3">
                    <Label className="text-xs">Libellé</Label>
                    <div className="flex gap-1">
                        <Input value={label} onChange={(e) => setLabel(e.target.value)} />
                        <Button size="sm" onClick={save}>
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between border-b py-2 text-sm">
            <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 justify-center">
                    {skill.position}
                </Badge>
                <div>
                    <div className="font-medium">{skill.label}</div>
                    <div className="text-xs text-slate-500">{skill.code}</div>
                </div>
            </div>
            <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={remove}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
            </div>
        </div>
    );
}
