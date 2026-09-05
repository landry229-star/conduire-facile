import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moniteur" | "eleve";

export async function getUserRoles(userId: string): Promise<AppRole[]> {
    if (!userId) return [];

    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    if (error) {
        console.warn("user_roles lookup failed:", error.message);
        return [];
    }

    return (data?.map((row) => row.role).filter(Boolean) as AppRole[]) ?? [];
}

export async function hasAnyRole(userId: string, roles: AppRole[]): Promise<boolean> {
    const userRoles = await getUserRoles(userId);
    return roles.some((role) => userRoles.includes(role));
}
