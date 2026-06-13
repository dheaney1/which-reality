import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

const ALLOWED_PATCH_FIELDS = [
  'name', 'brand_color', 'logo_url', 'visit_date', 'tour_guide_names',
  'setting', 'collegeboard_url', 'official_website_url', 'description',
  'pros', 'cons', 'other_notes',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('colleges')
      .select('*, institutional_metrics(*), admissions_data(*)')
      .eq('id', id).single()
    if (error) { res.status(404).json({ error: error.message }); return }
    res.json(data)

  } else if (req.method === 'PATCH') {
    const body = req.body as Record<string, unknown>
    const update: Record<string, unknown> = {}
    for (const key of ALLOWED_PATCH_FIELDS) {
      if (key in body) update[key] = body[key]
    }
    const { data, error } = await supabase
      .from('colleges').update(update).eq('id', id).select().single()
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json(data)

  } else if (req.method === 'DELETE') {
    const { error } = await supabase.from('colleges').delete().eq('id', id)
    if (error) { res.status(500).json({ error: error.message }); return }
    res.json({ success: true })

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
