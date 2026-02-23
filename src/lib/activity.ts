import { supabase } from "./supabase";

export const logActivity = async (action: string, entityName: string) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    // Buscamos el nombre del usuario que está actuando
    const { data: user } = await supabase
      .from("users")
      .select("name, tenant_id")
      .eq("id", session.user.id)
      .single();

    if (user) {
      await supabase.from("activity_logs").insert({
        tenant_id: user.tenant_id,
        user_name: user.name,
        action: action,
        entity_name: entityName,
      });
    }
  } catch (error) {
    console.error("Error guardando log:", error);
  }
};
