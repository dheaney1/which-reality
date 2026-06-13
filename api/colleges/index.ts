import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { data: colleges, error } = await supabase
      .from('colleges').select('*').order('created_at', { ascending: false })
    if (error) { res.status(500).json({ error: error.message }); return }

    const { data: ratings } = await supabase
      .from('ratings').select('college_id, member_id, score')
    const { data: members } = await supabase.from('family_members').select('id')

    const enriched = (colleges ?? []).map((c) => {
      const cRatings = (ratings ?? []).filter((r) => r.college_id === c.id)
      const avgScore = cRatings.length > 0
        ? cRatings.reduce((s: number, r: { score: number }) => s + r.score, 0) / cRatings.length
        : null
      const member_has_rated: Record<string, boolean> = {}
      for (const m of members ?? []) {
        member_has_rated[m.id] = cRatings.some((r) => r.member_id === m.id)
      }
      return { ...c, family_avg_score: avgScore, member_has_rated }
    })
    res.json(enriched)

  } else if (req.method === 'POST') {
    const body = req.body as Record<string, unknown>
    const {
      name, brand_color, logo_url, visit_date, tour_guide_names,
      setting, collegeboard_url, official_website_url, description, scorecard_unit_id,
      acceptance_rate, avg_sat, avg_act,
      tuition_in_state, tuition_out_of_state, graduation_rate_4yr, retention_rate, job_placement_rate,
    } = body

    const { data: college, error } = await supabase
      .from('colleges')
      .insert({ name, brand_color, logo_url, visit_date, tour_guide_names, setting, collegeboard_url, official_website_url, description, scorecard_unit_id })
      .select().single()
    if (error || !college) { res.status(500).json({ error: error?.message ?? 'Insert failed' }); return }

    if (acceptance_rate != null || avg_sat != null || avg_act != null) {
      await supabase.from('admissions_data').insert({ college_id: college.id, acceptance_rate, avg_sat, avg_act })
    }
    if (tuition_in_state != null || graduation_rate_4yr != null || retention_rate != null) {
      await supabase.from('institutional_metrics').insert({
        college_id: college.id, tuition_in_state, tuition_out_of_state,
        graduation_rate_4yr, retention_rate, job_placement_rate,
      })
    }
    res.json(college)

  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
