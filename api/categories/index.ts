import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('rating_categories').select('*').order('sort_order')
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json(data)

  } else if (req.method === 'POST') {
    const { name } = req.body as { name?: string }
    if (!name?.trim()) { res.status(400).json({ error: 'name required' }); return }
    const { data: maxData } = await supabase
      .from('rating_categories').select('sort_order')
      .order('sort_order', { ascending: false }).limit(1)
    const nextOrder = ((maxData?.[0]?.sort_order as number | undefined) ?? 0) + 1
    const { data, error } = await supabase
      .from('rating_categories')
      .insert({ name: name.trim(), is_custom: true, sort_order: nextOrder })
      .select().single()
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json(data)

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
