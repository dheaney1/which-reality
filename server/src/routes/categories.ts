import { Router } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('rating_categories').select('*').order('sort_order')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

router.post('/', async (req, res) => {
  const { name } = req.body as { name?: string }
  if (!name?.trim()) {
    res.status(400).json({ error: 'name required' })
    return
  }
  const { data: maxData } = await supabase
    .from('rating_categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  const nextOrder = ((maxData?.[0]?.sort_order as number | undefined) ?? 0) + 1
  const { data, error } = await supabase
    .from('rating_categories')
    .insert({ name: name.trim(), is_custom: true, sort_order: nextOrder })
    .select()
    .single()
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('rating_categories').delete().eq('id', req.params.id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ success: true })
})

export default router
