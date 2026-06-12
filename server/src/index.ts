import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import collegesRouter from './routes/colleges'
import membersRouter from './routes/members'
import categoriesRouter from './routes/categories'
import ratingsRouter from './routes/ratings'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/colleges', collegesRouter)
app.use('/api/members', membersRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/ratings', ratingsRouter)

const port = process.env.PORT ?? 3001
app.listen(Number(port), () => console.log(`Server running on port ${port}`))
