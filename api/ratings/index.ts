import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') { res.status(405).json({ error: 'Method not allowed' }); return }
  const { college_id, member_id, category_id, score } = req.body as {
    college_id: string; member_id: string; category_id: string; score: number
  }
  if (score < 0 || score > 10) { res.status(400).json({ error: 'score must be 0-10' }); return }
  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { college_id, member_id, category_id, score, updated_at: new Date().toISOString() },
      { onConflict: 'college_id,member_id,category_id' }
    )
    .select().single()
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
