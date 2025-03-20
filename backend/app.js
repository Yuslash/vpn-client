import express from 'express'
import session from 'express-session'
import passport from 'passport'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import sessionMongoStore from 'connect-mongo'
import { check } from 'express-validator'
import User from './models/user.js'
import Configuration from './models/wireguard_config.js'
import loginUser from './authentication/login.js'
import isAuthenticated from './authentication/authenticated.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const SESSION_SECRET = process.env.JWT_SECRET
const MONGO_URI = process.env.DB_URI

// Security & middlewares
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms'))

app.use(
  cors({
    origin: ['http://192.168.237.18:8000', 'http://127.0.0.1'],
    credentials: true
  })
)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
)

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionMongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 36000000,
      httpOnly: true,
      sameSite: 'Lax',
      secure: false
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB connection error:', error))

// Store email & username globally
let storedEmail = null
let storedUsername = null

// Middleware to update storedEmail and storedUsername
app.use(async (req, res, next) => {
  if (req.session?.user?.id) {
    storedEmail = req.session.user.email

    const user = await User.findOne({ email: storedEmail }).select('username')
    if (user) storedUsername = user.username
  }
  next()
})

// Login route
app.post('/auth/login', [
  check('email').isEmail().withMessage('Please enter a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters long')
], loginUser)

// Get WireGuard Config
app.get('/get-wg-config', async (req, res) => {
  try {
    // if (!storedEmail) return res.status(401).json({ error: 'User not authenticated' })

    // const user = await User.findOne({ email: storedEmail }).select('username')
    // if (!user) return res.status(404).json({ error: 'User not found' })

    const config = await Configuration.findOne({ playerName: 'sibikrishna' })
    if (!config) return res.status(404).json({ error: 'No config found for the player' })

    res.json({
      playerName: config.playerName,
      wireguardConfig: config.wireguardConfig
    })
  } catch (error) {
    console.error('❌ Error fetching WireGuard config:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.get('/get-wg-ip', async (req, res) => {
  try {
    if (!storedEmail) return res.status(401).json({ error: 'User not authenticated' })

    const user = await User.findOne({ email: storedEmail }).select('username')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const config = await Configuration.findOne({ playerName: storedUsername }).select('wireguardConfig.address')
    if (!config) return res.status(404).json({ error: 'No config found for the player' })

    res.json({ address: config.wireguardConfig.address })
  } catch (error) {
    console.error('❌ Error fetching WireGuard IP address:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})


app.get('/auth/checkAuth', isAuthenticated)

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`)
})
