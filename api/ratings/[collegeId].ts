import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return }
  const { collegeId } = req.query as { collegeId: string }
  const { data, error } = await supabase
    .from('ratings').select('*').eq('college_id', collegeId)
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
