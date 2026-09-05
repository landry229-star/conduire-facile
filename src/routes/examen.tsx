import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ArrowLeft,
    Check,
    X,
    ChevronRight,
    Clock,
    Award,
    Printer,
    RotateCcw,
    ShieldAlert,
} from "lucide-react";
import { ensureExamAccess } from "@/lib/access-control";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/examen")({
    ssr: false,
    beforeLoad: async ({ location }) => {
        await ensureExamAccess(location.pathname);
    },
    head: () => ({
        meta: [
            { title: "Session d'examen blanc — L'Excellence Auto-École" },
            {
                name: "description",
                content:
                    "Passez un examen blanc chronométré du code de la route et obtenez une attestation de réussite (non officielle).",
            },
            {
                property: "og:title",
                content: "Examen blanc — L'Excellence Auto-École",
            },
            {
                property: "og:description",
                content:
                    "Évaluez votre niveau avec un examen blanc chronométré et recevez une attestation à imprimer.",
            },
        ],
    }),
    component: ExamenPage,
});

export const CATEGORIES = [
    { code: "AM", label: "AM — Cyclomoteur" },
    { code: "A1", label: "A1 — Moto légère" },
    { code: "A", label: "A — Moto" },
    { code: "B", label: "B — Voiture" },
    { code: "BE", label: "BE — Voiture + remorque" },
    { code: "C", label: "C — Poids lourd" },
    { code: "D", label: "D — Transport en commun" },
    { code: "T", label: "T — Agricole" },
] as const;

export type CategoryCode = (typeof CATEGORIES)[number]["code"];

type Question = {
    id?: string;
    prompt: string;
    options: string[];
};

const EXAM_SIZE = 20;
const DURATION_SECONDS = 25 * 60;

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function buildDeck(cat: CategoryCode): Promise<Question[]> {
    const [questionsResponse, categoriesResponse, linksResponse] = await Promise.all([
        supabase.from("exam_questions_safe").select("id,prompt,choices,active").eq("active", true),
        supabase.from("exam_categories").select("id,code"),
        supabase.from("exam_question_categories").select("question_id,category_id"),
    ]);
    const responseError =
        questionsResponse.error ?? categoriesResponse.error ?? linksResponse.error;
    if (responseError) throw responseError;

    const categoryId = categoriesResponse.data?.find((item) => item.code === cat)?.id;
    const questionCategoryMap = new Map<string, string[]>();
    for (const link of linksResponse.data ?? []) {
        const values = questionCategoryMap.get(link.question_id) ?? [];
        values.push(link.category_id);
        questionCategoryMap.set(link.question_id, values);
    }
    const eligible = (questionsResponse.data ?? []).filter((question) => {
        const categories = questionCategoryMap.get(question.id) ?? [];
        return Boolean(categoryId && categories.includes(categoryId));
    });

    return shuffle(eligible)
        .slice(0, Math.min(EXAM_SIZE, eligible.length))
        .map((question) => ({
            id: question.id,
            prompt: question.prompt,
            options: Array.isArray(question.choices)
                ? question.choices.filter((choice): choice is string => typeof choice === "string")
                : [],
        }));
}

function genCertificateCode() {
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    const y = new Date().getFullYear();
    return `EX-${y}-${r}`;
}

function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

type Phase = "intro" | "exam" | "result" | "certificate";

function ExamenPage() {
    const [phase, setPhase] = useState<Phase>("intro");
    const [deck, setDeck] = useState<Question[]>([]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [remaining, setRemaining] = useState(DURATION_SECONDS);
    const [name, setName] = useState("");
    const [category, setCategory] = useState<CategoryCode>("B");
    const [code, setCode] = useState("");
    const [issuedAt, setIssuedAt] = useState<string>("");
    const [serverResult, setServerResult] = useState<{
        score: number;
        total: number;
        passed: boolean;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const answersRef = useRef<(number | null)[]>([]);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (!data.user) return;
            const { data: profile } = await supabase
                .from("profiles")
                .select("category,full_name")
                .eq("id", data.user.id)
                .maybeSingle();
            if (profile?.category && CATEGORIES.some((item) => item.code === profile.category)) {
                setCategory(profile.category as CategoryCode);
            }
            if (profile?.full_name) setName(profile.full_name);
        });
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    async function start() {
        setError(null);
        setServerResult(null);
        const d = await buildDeck(category);
        if (d.length < EXAM_SIZE) {
            setError(`Il faut au moins ${EXAM_SIZE} questions actives pour cette catégorie.`);
            return;
        }

        setDeck(d);
        const initialAnswers = Array(d.length).fill(null);
        setAnswers(initialAnswers);
        answersRef.current = initialAnswers;
        setCurrent(0);
        setSelected(null);
        setRemaining(DURATION_SECONDS);
        setPhase("exam");
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    void submitExamAnswers(answersRef.current, d);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
    }

    async function submitAnswer() {
        if (selected === null) return;
        const next = [...answers];
        next[current] = selected;
        setAnswers(next);
        answersRef.current = next;
        if (current === deck.length - 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            await submitExamAnswers(next);
        } else {
            setCurrent((c) => c + 1);
            setSelected(null);
        }
    }

    async function submitExamAnswers(values: (number | null)[], questions: Question[] = deck) {
        setSubmitting(true);
        const payload = Object.fromEntries(
            questions
                .filter((question): question is Question & { id: string } => Boolean(question.id))
                .map((question, index) => [question.id, values[index] ?? -1]),
        );
        const { data, error: submitError } = await supabase.rpc("submit_exam_attempt", {
            p_category: category,
            p_answers: payload,
        });
        setSubmitting(false);
        if (submitError || !data?.[0]) {
            setError(submitError?.message ?? "Impossible de valider l'examen.");
            return;
        }
        setServerResult(data[0]);
        setPhase("result");
    }

    const score = useMemo(() => serverResult?.score ?? 0, [serverResult]);
    const passed = serverResult?.passed ?? false;

    const recordedRef = useRef(false);
    useEffect(() => {
        if (phase === "result") recordedRef.current = true;
        if (phase === "intro") recordedRef.current = false;
    }, [phase]);

    function issueCertificate() {
        if (!name.trim()) return;
        setCode(genCertificateCode());
        setIssuedAt(
            new Date().toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
        );
        setPhase("certificate");
    }

    function resetAll() {
        setPhase("intro");
        setDeck([]);
        setAnswers([]);
        setCurrent(0);
        setSelected(null);
        setName("");
        setCode("");
    }

    const q = deck[current];

    return (
        <div className="min-h-screen bg-ivory text-charcoal">
            <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-charcoal/5 bg-ivory/90 px-5 py-4 backdrop-blur-md print:hidden">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-sm bg-benin-green">
                        <span className="block size-2 rounded-full bg-benin-yellow" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-tight">
                        L'Excellence
                    </span>
                </Link>
                {phase === "exam" ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-benin-red/10 px-3 py-1.5 text-xs font-semibold text-benin-red ring-1 ring-benin-red/30">
                        <Clock className="size-3.5" /> {formatTime(remaining)}
                    </div>
                ) : (
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-charcoal/10 hover:bg-white"
                    >
                        <ArrowLeft className="size-3" /> Tableau de bord
                    </Link>
                )}
            </nav>

            {phase === "intro" && (
                <main className="px-5 py-10 print:hidden">
                    <div className="mx-auto max-w-2xl">
                        <span className="mb-4 inline-block rounded-sm bg-benin-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-benin-green">
                            Examen blanc
                        </span>
                        <h1 className="mb-3 text-balance text-3xl font-semibold leading-tight md:text-4xl">
                            Session d'examen blanc du code
                        </h1>
                        <p className="mb-6 text-pretty text-charcoal/70">
                            Évaluez votre niveau dans des conditions proches de l'épreuve
                            officielle. Si vous réussissez, une attestation imprimable vous est
                            délivrée.
                        </p>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                <p className="text-[11px] uppercase text-charcoal/50">Questions</p>
                                <p className="mt-1 text-2xl font-semibold">{EXAM_SIZE}</p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                <p className="text-[11px] uppercase text-charcoal/50">Durée</p>
                                <p className="mt-1 text-2xl font-semibold">25 min</p>
                            </div>
                            <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
                                <p className="text-[11px] uppercase text-charcoal/50">Réussite</p>
                                <p className="mt-1 text-2xl font-semibold">≥ 80%</p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                                Catégorie de permis évaluée
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as CategoryCode)}
                                disabled
                                className="mt-2 w-full rounded-md bg-white px-3 py-2 text-sm ring-1 ring-charcoal/15 focus:outline-none focus:ring-benin-green"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs text-charcoal/60">
                                Cette catégorie provient de votre profil et adapte les questions de
                                l’examen.
                            </p>
                            <p className="mt-2 text-xs text-charcoal/60">
                                Les questions et l'attestation seront adaptées à cette catégorie.
                            </p>
                        </div>

                        <div className="mt-6 flex items-start gap-3 rounded-xl bg-benin-yellow/15 p-4 text-sm text-charcoal/80 ring-1 ring-benin-yellow/40">
                            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-benin-red" />
                            <p>
                                <strong>Attestation non officielle.</strong> Le certificat délivré
                                n'a aucune valeur légale et ne remplace pas l'examen officiel du
                                permis de conduire. Il atteste uniquement de votre réussite à notre
                                examen d'entraînement.
                            </p>
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={start}
                                className="inline-flex items-center gap-2 rounded-md bg-benin-green px-6 py-3 text-sm font-semibold text-white"
                            >
                                Commencer l'examen
                            </button>
                        </div>
                    </div>
                </main>
            )}

            {phase === "exam" && q && (
                <main className="px-5 py-8 print:hidden">
                    <div className="mx-auto max-w-2xl">
                        <div className="mb-6 flex items-center justify-between text-xs text-charcoal/60">
                            <span>
                                Question {current + 1} / {deck.length}
                            </span>
                            <div className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-charcoal/10">
                                <div
                                    className="h-full bg-benin-green transition-all"
                                    style={{ width: `${((current + 1) / deck.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
                            <p className="mb-5 text-center text-base font-medium">{q.prompt}</p>

                            <div className="space-y-2">
                                {q.options.map((opt, i) => {
                                    const isSelected = selected === i;
                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setSelected(i)}
                                            className={`w-full cursor-pointer rounded-lg px-4 py-3 text-left text-sm ring-1 transition-colors ${
                                                isSelected
                                                    ? "bg-benin-green/5 ring-benin-green"
                                                    : "ring-charcoal/10 hover:bg-zinc-50"
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={submitAnswer}
                                    disabled={selected === null}
                                    className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                                >
                                    {current === deck.length - 1 ? "Terminer" : "Suivant"}
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {phase === "result" && (
                <main className="px-5 py-10 print:hidden">
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-black/5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-benin-green">
                                Résultat
                            </p>
                            <p className="mt-3 text-5xl font-semibold">
                                {score}
                                <span className="text-charcoal/40"> / {deck.length}</span>
                            </p>
                            <p className="mt-2 text-sm text-charcoal/60">
                                Soit {Math.round((score / deck.length) * 100)}% — seuil de réussite
                                : 80%
                            </p>

                            {passed ? (
                                <>
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-benin-green/10 px-4 py-2 text-sm font-semibold text-benin-green ring-1 ring-benin-green/30">
                                        <Award className="size-4" /> Examen réussi
                                    </div>
                                    <div className="mt-6 text-left">
                                        <label className="block text-xs font-medium text-charcoal/70">
                                            Nom complet (sur l'attestation)
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ex. Afiwa KOUASSI"
                                            className="mt-1 w-full rounded-md bg-white px-3 py-2 text-sm ring-1 ring-charcoal/15 focus:outline-none focus:ring-benin-green"
                                        />
                                        <p className="mt-3 text-xs text-charcoal/70">
                                            Catégorie évaluée :{" "}
                                            <span className="font-semibold text-charcoal">
                                                {CATEGORIES.find((c) => c.code === category)
                                                    ?.label ?? category}
                                            </span>
                                        </p>

                                        <button
                                            type="button"
                                            onClick={issueCertificate}
                                            disabled={!name.trim()}
                                            className="mt-4 inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                                        >
                                            <Award className="size-4" /> Générer mon attestation
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-benin-red/10 px-4 py-2 text-sm font-semibold text-benin-red ring-1 ring-benin-red/30">
                                        <X className="size-4" /> Examen non validé
                                    </div>
                                    <p className="mt-4 text-sm text-charcoal/70">
                                        Continuez vos révisions avec les quiz, puis retentez
                                        l'examen.
                                    </p>
                                </>
                            )}

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={start}
                                    className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
                                >
                                    <RotateCcw className="size-4" /> Repasser l'examen
                                </button>
                                <Link
                                    to="/theorie"
                                    className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-medium text-white"
                                >
                                    Réviser la théorie
                                </Link>
                                <Link
                                    to="/quiz"
                                    className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white"
                                >
                                    Quiz code
                                </Link>
                                <Link
                                    to="/quiz-panneaux"
                                    className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-medium text-white"
                                >
                                    Quiz panneaux
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
                                >
                                    Retour au tableau de bord
                                </Link>
                            </div>

                            <div className="mt-10 rounded-lg bg-zinc-50 p-4 text-left text-sm text-charcoal/70">
                                La correction détaillée est conservée côté serveur afin de protéger
                                la banque de réponses. Demandez votre retour à l'administration.
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {phase === "certificate" && (
                <main className="px-5 py-10">
                    <div className="mx-auto max-w-3xl print:max-w-none">
                        <div className="mb-4 flex flex-wrap justify-end gap-3 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 rounded-md bg-benin-green px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                <Printer className="size-4" /> Imprimer / PDF
                            </button>
                            <button
                                type="button"
                                onClick={resetAll}
                                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium ring-1 ring-charcoal/15"
                            >
                                <RotateCcw className="size-4" /> Nouvel examen
                            </button>
                        </div>

                        <article
                            id="certificate"
                            className="relative overflow-hidden rounded-2xl border-[6px] border-double border-benin-green bg-white p-10 shadow-sm print:rounded-none print:shadow-none"
                        >
                            <div className="absolute right-6 top-6 flex gap-1">
                                <span className="h-6 w-3 bg-benin-green" />
                                <span className="h-6 w-3 bg-benin-yellow" />
                                <span className="h-6 w-3 bg-benin-red" />
                            </div>

                            <div className="text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-charcoal/60">
                                    L'Excellence Auto-École · République du Bénin
                                </p>
                                <h2 className="mt-4 text-3xl font-semibold md:text-4xl">
                                    Attestation de réussite
                                </h2>
                                <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/50">
                                    Examen blanc du code de la route
                                </p>

                                <div className="mx-auto mt-8 max-w-xl text-sm text-charcoal/80">
                                    <p>Le présent document atteste que</p>
                                    <p className="mt-3 text-2xl font-semibold text-charcoal">
                                        {name}
                                    </p>
                                    <p className="mt-3">
                                        a passé avec succès la session d'examen blanc du code de la
                                        route, catégorie{" "}
                                        <span className="font-semibold">{category}</span>, avec un
                                        score de{" "}
                                        <span className="font-semibold">
                                            {score} / {deck.length}
                                        </span>{" "}
                                        ({Math.round((score / deck.length) * 100)}%).
                                    </p>
                                </div>

                                <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-6 text-left text-xs text-charcoal/70">
                                    <div>
                                        <p className="uppercase tracking-wider text-charcoal/50">
                                            Délivré le
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-charcoal">
                                            {issuedAt}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="uppercase tracking-wider text-charcoal/50">
                                            N° d'attestation
                                        </p>
                                        <p className="mt-1 font-mono text-sm font-medium text-charcoal">
                                            {code}
                                        </p>
                                    </div>
                                </div>

                                <div className="mx-auto mt-10 flex max-w-xl items-end justify-between">
                                    <div className="text-left">
                                        <div className="h-12 w-40 border-b border-charcoal/40" />
                                        <p className="mt-1 text-[11px] uppercase tracking-wider text-charcoal/50">
                                            Signature de l'élève
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="ml-auto flex h-12 w-40 items-end justify-center border-b border-charcoal/40 font-[cursive] text-base italic text-benin-green">
                                            L'Excellence
                                        </div>
                                        <p className="mt-1 text-[11px] uppercase tracking-wider text-charcoal/50">
                                            Cachet & direction
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-10 border-t border-charcoal/10 pt-4 text-[10px] uppercase tracking-wider text-benin-red">
                                    Document non officiel — sans valeur légale. Ne remplace pas
                                    l'examen officiel du permis de conduire.
                                </p>
                            </div>
                        </article>
                    </div>
                </main>
            )}

            <footer className="border-t border-charcoal/5 bg-zinc-50 px-5 py-10 print:hidden">
                <p className="text-[11px] leading-relaxed text-charcoal/50">
                    © {new Date().getFullYear()} L'Excellence Auto-École.
                </p>
            </footer>
        </div>
    );
}
