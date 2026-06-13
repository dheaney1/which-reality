import type { VercelRequest, VercelResponse } from '@vercel/node'
import { searchColleges } from '../_services/scorecard'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q as string
  if (!q?.trim()) { res.status(400).json({ error: 'q required' }); return }
  try {
    const results = await searchColleges(q)
    res.json(results)
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
}
