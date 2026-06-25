import { supabase } from '@/lib/supabase';
import { AuditLog } from '@/types';

export async function insertAuditLog(params: {
  actorName: string;
  action: string;
  details?: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: user?.id ?? null,
    actor_name: params.actorName,
    action: params.action,
    details: params.details ?? null,
  });
  if (error) throw error;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data as AuditLog[];
}
