import { createFileRoute, Link, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Phone, Chrome } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/lib/auth-profile";
import { getProfileApprovalStatus, setStoredApprovalStatus } from "@/lib/access-control";

export const Route = createFileRoute("/auth")({
    beforeLoad: async ({ location }) => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            const approvalStatus = await getProfileApprovalStatus(data.session.user.id);
            if (approvalStatus === "approved") {
                const params = new URLSearchParams(location.search ?? "");
                const target = params.get("redirect");
                throw redirect({
                    to: target && target.startsWith("/") ? target : "/dashboard",
                });
            }
        }
        return {};
    },
    head: () => ({
        meta: [
            { title: "Connexion — L'Excellence Auto-École" },
            {
                name: "description",
                content:
                    "Connectez-vous ou créez votre compte élève pour suivre votre progression.",
            },
        ],
    }),
    component: AuthPage,
});

function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const redirectTarget = useMemo(() => {
        const params = new URLSearchParams(location.search ?? "");
        const redirect = params.get("redirect");
        return redirect && redirect.startsWith("/") ? redirect : "/dashboard";
    }, [location.search]);

    useEffect(() => {
        const syncSessionState = async () => {
            const { data } = await supabase.auth.getSession();
            const user = data.session?.user;
            if (!user) return;

            const approvalStatus = await getProfileApprovalStatus(user.id);
            if (approvalStatus === "approved") {
                navigate({ to: "/dashboard" });
                return;
            }

            toast.info("Votre compte est en attente d'approbation par l'administration.");
        };

        void syncSessionState();
    }, [navigate]);

    // Email / password
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        account_status: "pending",
                        approved: false,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                await ensureUserProfile({
                    id: data.user.id,
                    email,
                    full_name: fullName,
                });
            }

            setStoredApprovalStatus("pending");
            toast.success(
                "Inscription enregistrée. Votre compte est en attente d'acceptation par l'administration.",
            );
            if (data.session) {
                navigate({ to: redirectTarget });
            }
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "L'inscription a échoué. Vérifiez vos informations.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const user = data.user;
            const approvalStatus = user ? await getProfileApprovalStatus(user.id) : "unknown";
            if (approvalStatus === "approved") {
                setStoredApprovalStatus("approved");
                navigate({ to: redirectTarget });
                return;
            }

            setStoredApprovalStatus(approvalStatus === "rejected" ? "rejected" : "pending");
            toast.info("Compte validé mais en attente d'approbation par l'administration.");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "La connexion a échoué. Vérifiez votre email et votre mot de passe.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}${redirectTarget}`,
                },
            });

            if (error) throw error;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "La connexion Google a échoué.";
            toast.error(message);
            setLoading(false);
        }
    };

    // Phone OTP
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    const sendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone,
                options: {
                    data: {
                        full_name: fullName || "Nouvel élève",
                        account_status: "pending",
                    },
                },
            });
            if (error) throw error;
            setOtpSent(true);
            toast.success("Code SMS envoyé. Vérifiez votre téléphone.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "L'envoi du SMS a échoué.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: "sms",
            });
            if (error) throw error;

            if (data.user) {
                await ensureUserProfile({
                    id: data.user.id,
                    phone,
                    full_name: fullName || data.user.email || null,
                    email: data.user.email,
                });
            }

            setStoredApprovalStatus("pending");
            toast.success("Connexion SMS validée. Votre compte est en attente d'approbation.");
            if (data.session) {
                navigate({ to: redirectTarget });
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Le code SMS est invalide ou expiré.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <Link to="/" className="text-sm text-emerald-700 hover:underline">
                        ← Retour au site
                    </Link>
                </div>
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Espace élève</CardTitle>
                        <CardDescription>
                            Connectez-vous pour suivre votre formation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogle}
                            disabled={loading}
                        >
                            <Chrome className="mr-2 h-4 w-4" /> Continuer avec Google
                        </Button>
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">ou</span>
                            </div>
                        </div>

                        <Tabs defaultValue="signin">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="signin">Connexion</TabsTrigger>
                                <TabsTrigger value="signup">Inscription</TabsTrigger>
                                <TabsTrigger value="phone">SMS</TabsTrigger>
                            </TabsList>

                            <TabsContent value="signin">
                                <form onSubmit={handleSignIn} className="space-y-3 mt-4">
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Mot de passe</Label>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Se connecter
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup">
                                <form onSubmit={handleSignUp} className="space-y-3 mt-4">
                                    <div>
                                        <Label>Nom complet</Label>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Mot de passe (min. 6 caractères)</Label>
                                        <Input
                                            type="password"
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Créer mon compte"
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="phone">
                                {!otpSent ? (
                                    <form onSubmit={sendOtp} className="space-y-3 mt-4">
                                        <div>
                                            <Label>Numéro (format international)</Label>
                                            <Input
                                                type="tel"
                                                placeholder="+22997000000"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Recevoir le code
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    <form onSubmit={verifyOtp} className="space-y-3 mt-4">
                                        <div>
                                            <Label>Code reçu par SMS</Label>
                                            <Input
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                "Vérifier"
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full"
                                            onClick={() => setOtpSent(false)}
                                        >
                                            Changer de numéro
                                        </Button>
                                    </form>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
