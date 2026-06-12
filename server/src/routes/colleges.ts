import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { searchColleges } from '../services/scorecard'

const router = Router()

// /search must be registered before /:id
router.get('/search', async (req, res) => {
  const q = req.query.q as string
  if (!q?.trim()) {
    res.status(400).json({ error: 'q required' })
    return
  }
  try {
    const results = await searchColleges(q)
    res.json(results)
  } catch (e) {
    res.status(502).json({ error: String(e) })
  }
})

router.get('/', async (_req, res) => {
  const { data: colleges, error } = await supabase
    .from('colleges')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  const { data: ratings } = await supabase.from('ratings').select('college_id, member_id, score')
  const { data: members } = await supabase.from('family_members').select('id')
  const enriched = (colleges ?? []).map((c) => {
    const cRatings = (ratings ?? []).filter((r) => r.college_id === c.id)
    const avgScore =
      cRatings.length > 0
        ? cRatings.reduce((s: number, r: { score: number }) => s + r.score, 0) / cRatings.length
        : null
    const member_has_rated: Record<string, boolean> = {}
    for (const m of members ?? []) {
      member_has_rated[m.id] = cRatings.some((r) => r.member_id === m.id)
    }
    return { ...c, family_avg_score: avgScore, member_has_rated }
  })
  res.json(enriched)
})

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('colleges')
    .select('*, institutional_metrics(*), admissions_data(*)')
    .eq('id', req.params.id)
    .single()
  if (error) {
    res.status(404).json({ error: error.message })
    return
  }
  res.json(data)
})

router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const {
    name, brand_color, logo_url, visit_date, tour_guide_names,
    setting, collegeboard_url, official_website_url, description, scorecard_unit_id,
    acceptance_rate, avg_sat, avg_act,
    tuition_in_state, tuition_out_of_state, graduation_rate_4yr, retention_rate, job_placement_rate,
  } = body

  const { data: college, error } = await supabase
    .from('colleges')
    .insert({
      name, brand_color, logo_url, visit_date, tour_guide_names,
      setting, collegeboard_url, official_website_url, description, scorecard_unit_id,
    })
    .select()
    .single()
  if (error || !college) {
    res.status(500).json({ error: error?.message ?? 'Insert failed' })
    return
  }

  if (acceptance_rate != null || avg_sat != null || avg_act != null) {
    await supabase.from('admissions_data').insert({
      college_id: college.id, acceptance_rate, avg_sat, avg_act,
    })
  }
  if (tuition_in_state != null || graduation_rate_4yr != null || retention_rate != null) {
    await supabase.from('institutional_metrics').insert({
      college_id: college.id,
      tuition_in_state, tuition_out_of_state,
      graduation_rate_4yr, retention_rate, job_placement_rate,
    })
  }
  res.json(college)
})

router.patch('/:id', async (req, res) => {
  const allowed = [
    'name', 'brand_color', 'logo_url', 'visit_date', 'tour_guide_names',
    'setting', 'collegeboard_url', 'official_website_url', 'description',
    'pros', 'cons', 'other_notes',
  ]
  const update: Record<string, unknown> = {}
  const body = req.body as Record<string, unknown>
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }
  const { data, error } = await supabase
    .from('colleges').update(update).eq('id', req.params.id).select().single()
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('colleges').delete().eq('id', req.params.id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ success: true })
})

export default router
