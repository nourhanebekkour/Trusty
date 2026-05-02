require('dotenv').config()

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const pool = require('./db')

const app = express()

app.use(helmet())
app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many attempts, try later" }
})

app.use('/api/login', loginLimiter)


const ACCESS_SECRET = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

app.post('/api/register', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    email = email.toLowerCase().trim()

    if (password.length < 8) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    )

    res.json({ message: "User created" })

  } catch (err) {
    res.status(400).json({ message: "Invalid credentials" })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    email = email.toLowerCase().trim()

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    const fakeHash = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8yFZ8e8u8l8e8u8l8e8u8l8e8u8l8u"

    if (!user) {
      await bcrypt.compare(password, fakeHash)
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const accessToken = jwt.sign(
      { id: user.id },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    const hashedRefresh = await bcrypt.hash(refreshToken, 10)

    await pool.query(
      'UPDATE users SET refresh_token=$1 WHERE id=$2',
      [hashedRefresh, user.id]
    )

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ message: "Login success" })

  } catch {
    res.status(500).json({ message: "Server error" })
  }
})

app.post('/api/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) return res.sendStatus(401)

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET)

    const result = await pool.query(
      'SELECT * FROM users WHERE id=$1',
      [decoded.id]
    )

    const user = result.rows[0]

    if (!user) return res.sendStatus(403)

    const match = await bcrypt.compare(refreshToken, user.refresh_token)

    if (!match) return res.sendStatus(403)

    const newAccessToken = jwt.sign(
      { id: user.id },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    )

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    })

    res.json({ message: "Token refreshed" })

  } catch {
    res.sendStatus(403)
  }
})

function authMiddleware(req, res, next) {
  const token = req.cookies.token

  if (!token) return res.sendStatus(401)

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.sendStatus(403)
  }
}

app.get('/api/profile', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email FROM users WHERE id=$1',
    [req.user.id]
  )

  res.json(result.rows[0])
})

app.post('/api/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
     await pool.query(
  'UPDATE users SET refresh_token=NULL WHERE id=$1',
  [userId]
)
    }

    res.clearCookie('token', { httpOnly: true, sameSite: 'Strict' })
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' })

    res.json({ message: "Logged out" })

  } catch {
    res.status(500).json({ message: "Server error" })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})