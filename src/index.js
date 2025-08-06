import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import { connectDB } from './DB/dbConnection.js'

import { initAuthorCollection } from './DB/Models/author.model.js'
import { initBookCollection } from './DB/Models/book.model.js'
import { initLogCollection } from './DB/Models/log.model.js'

import authorRoutes from './Modules/Authors/author.routes.js'
import bookRoutes from './Modules/Books/book.routes.js'
import logRoutes from './Modules/Logs/log.routes.js'

const app = express()
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
})


await connectDB()

// database schema init
await initBookCollection()
await initAuthorCollection()
await initLogCollection()


app.use(limiter)
app.use('/api/authors', authorRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/logs', logRoutes)

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Router not found'
  })
})

app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({
    message: 'something went wrong'
  })
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`)
})

// factory pattern summarization for readme
// https://chatgpt.com/s/t_688e6f5fd9e08191ab9b54cc631dcc5f
