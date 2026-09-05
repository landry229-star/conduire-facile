import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    User,
    BookOpen,
    ClipboardCheck,
    TrafficCone,
    Award,
    ShieldCheck,
    ListChecks,
    HelpCircle,
    LogOut,
    Signpost,
} from "lucide-react";
import { toast } from "sonner";

const learnerItems = [
    { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
    { title: "Mon profil", url: "/profil", icon: User },
];

const courseItems = [
    { title: "Cours de théorie", url: "/theorie", icon: BookOpen },
    { title: "Panneaux", url: "/panneaux", icon: Signpost },
];

const quizItems = [
    { title: "Quiz code", url: "/quiz", icon: ClipboardCheck },
    { title: "Quiz panneaux", url: "/quiz-panneaux", icon: TrafficCone },
    { title: "Examen blanc", url: "/examen", icon: Award },
];

export function AppSidebar({ isStaff }: { isStaff: boolean }) {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const currentPath = useRouterState({ select: (r) => r.location.pathname });
    const [name, setName] = useState<string>("");
    const [examUnlocked, setExamUnlocked] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (!data.user) {
                const cached = window.localStorage.getItem("app:profile-cache");
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached) as { full_name?: string | null };
                        setName(parsed.full_name || "");
                    } catch {
                        setName("");
                    }
                }
                return;
            }

            try {
                const [{ data: p }, { data: gates }] = await Promise.all([
                    supabase
                        .from("profiles")
                        .select("full_name")
                        .eq("id", data.user.id)
                        .maybeSingle(),
                    supabase.rpc("learning_gate_status"),
                ]);
                setName(p?.full_name || data.user.email || "");
                setExamUnlocked(Boolean(gates?.[0]?.exam_unlocked));
            } catch {
                const cached = window.localStorage.getItem("app:profile-cache");
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached) as { full_name?: string | null };
                        setName(parsed.full_name || data.user.email || "");
                    } catch {
                        setName(data.user.email || "");
                    }
                } else {
                    setName(data.user.email || "");
                }
            }
        });
    }, []);

    const isActive = (path: string) => currentPath === path;

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(error.message);
            return;
        }

        window.localStorage.removeItem("app:account-status");
        toast.success("Déconnexion réussie.");
        window.location.assign("/auth");
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b">
                <div className="px-2 py-2">
                    {!collapsed ? (
                        <>
                            <div className="text-sm font-bold text-emerald-700 leading-tight">
                                L'Excellence
                            </div>
                            <div className="text-[11px] text-slate-500">Auto-École</div>
                        </>
                    ) : (
                        <div className="text-lg font-bold text-emerald-700 text-center">L</div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Mon espace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {learnerItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                    >
                                        <Link to={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Cours</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {courseItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                    >
                                        <Link to={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Évaluations</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {quizItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        asChild={item.url !== "/examen" || examUnlocked}
                                        isActive={isActive(item.url)}
                                        tooltip={item.title}
                                        disabled={item.url === "/examen" && !examUnlocked}
                                    >
                                        {item.url === "/examen" && !examUnlocked ? (
                                            <span className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>Examen (verrouillé)</span>
                                            </span>
                                        ) : (
                                            <Link to={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isStaff && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive("/admin")}
                                        tooltip="Espace admin"
                                    >
                                        <Link to="/admin">
                                            <ShieldCheck className="h-4 w-4" />
                                            <span>Espace admin</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive("/admin/categories")}
                                        tooltip="Catégories & compétences"
                                    >
                                        <Link to="/admin/categories">
                                            <ListChecks className="h-4 w-4" />
                                            <span>Catégories</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive("/admin/questions")}
                                        tooltip="Banque de questions"
                                    >
                                        <Link to="/admin/questions">
                                            <HelpCircle className="h-4 w-4" />
                                            <span>Questions</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t">
                {!collapsed && name && (
                    <div className="px-2 py-1 text-xs text-slate-500 truncate">{name}</div>
                )}
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={signOut} tooltip="Se déconnecter">
                            <LogOut className="h-4 w-4" />
                            <span>Se déconnecter</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
