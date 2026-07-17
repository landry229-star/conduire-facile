import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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

const trainingItems = [
  { title: "Cours de théorie", url: "/theorie", icon: BookOpen },
  { title: "Quiz code", url: "/quiz", icon: ClipboardCheck },
  { title: "Quiz panneaux", url: "/quiz-panneaux", icon: TrafficCone },
  { title: "Panneaux", url: "/panneaux", icon: Signpost },
  { title: "Examen blanc", url: "/examen", icon: Award },
];

export function AppSidebar({ isStaff }: { isStaff: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const [name, setName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();
      setName(p?.full_name || data.user.email || "");
    });
  }, []);

  const isActive = (path: string) => currentPath === path;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/auth" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="px-2 py-2">
          {!collapsed ? (
            <>
              <div className="text-sm font-bold text-emerald-700 leading-tight">L'Excellence</div>
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
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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
          <SidebarGroupLabel>Formation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trainingItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
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

        {isStaff && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Espace admin">
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Espace admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/categories")} tooltip="Catégories & compétences">
                    <Link to="/admin/categories">
                      <ListChecks className="h-4 w-4" />
                      <span>Catégories</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin/questions")} tooltip="Banque de questions">
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
