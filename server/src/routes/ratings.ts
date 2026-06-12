import { Router } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/:collegeId', async (req, res) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('college_id', req.params.collegeId)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

router.put('/', async (req, res) => {
  const { college_id, member_id, category_id, score } = req.body as {
    college_id: string; member_id: string; category_id: string; score: number
  }
  if (score < 0 || score > 10) {
    res.status(400).json({ error: 'score must be 0-10' })
    return
  }
  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { college_id, member_id, category_id, score, updated_at: new Date().toISOString() },
      { onConflict: 'college_id,member_id,category_id' }
    )
    .select()
    .single()
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

export default router
