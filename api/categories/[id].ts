import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') { res.status(405).json({ error: 'Method not allowed' }); return }
  const { id } = req.query as { id: string }
  const { error } = await supabase.from('rating_categories').delete().eq('id', id)
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json({ success: true })
}
