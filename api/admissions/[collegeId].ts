import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') { res.status(405).json({ error: 'Method not allowed' }); return }
  const { collegeId } = req.query as { collegeId: string }
  const allowed = ['acceptance_rate', 'avg_hs_gpa', 'avg_sat', 'avg_act']
  const update: Record<string, unknown> = { college_id: collegeId }
  const body = req.body as Record<string, unknown>
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  const { data, error } = await supabase
    .from('admissions_data')
    .upsert(update, { onConflict: 'college_id' })
    .select()
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
