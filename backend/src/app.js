import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
dotenv.config()

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, async () => {
  await connectDB();
  console.log(`Example app listening on port ${port}`)
})
