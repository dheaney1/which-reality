import { Router } from 'express'
import { supabase } from '../lib/supabase'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('family_members').select('*').order('name')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json(data)
})

export default router
