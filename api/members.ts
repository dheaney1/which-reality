import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from './_lib/supabase'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const { data, error } = await supabase.from('family_members').select('*').order('name')
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
}
