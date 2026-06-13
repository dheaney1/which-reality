import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') { res.status(405).json({ error: 'Method not allowed' }); return }
  const { collegeId } = req.query as { collegeId: string }
  const allowed = [
    'retention_rate', 'graduation_rate_4yr', 'student_satisfaction_pct',
    'job_placement_rate', 'tuition_in_state', 'tuition_out_of_state', 'dorm_avg_size_sqft',
  ]
  const update: Record<string, unknown> = { college_id: collegeId }
  const body = req.body as Record<string, unknown>
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  const { data, error } = await supabase
    .from('institutional_metrics')
    .upsert(update, { onConflict: 'college_id' })
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
