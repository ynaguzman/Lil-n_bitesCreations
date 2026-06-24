import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const app = express()
app.use(cors())
app.use(express.json())

const uploadsDir = path.resolve('uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

app.use('/uploads', express.static(uploadsDir))

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
})

app.post('/api/order', upload.array('files'), async (req, res) => {
  try {
    const { name, email, category, details, total, orderId, dateStr } = req.body

    let filesHtml = ''
    const baseUrl = `${req.protocol}://${req.get('host')}`

    if (req.files?.length) {
      filesHtml = '<p style="margin:16px 0 8px;font-weight:600;color:#333;">📎 Uploaded Files:</p><ul style="margin:0;padding-left:20px;">'
      for (const f of req.files) {
        filesHtml += `<li><a href="${baseUrl}/uploads/${f.filename}" style="color:#e8758a;">${f.originalname}</a></li>`
      }
      filesHtml += '</ul>'
    }

    const emailHtml = `
      <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#fff5f7;border-radius:20px;padding:32px;border:2px solid #ffe0e6;">
        <div style="text-align:center;margin-bottom:20px;">
          <span style="font-size:32px;">🎀</span>
          <h1 style="font-family:Georgia,serif;color:#e8758a;margin:8px 0 0;font-size:22px;">Lil' n Bites Creations</h1>
          <p style="color:#b3868a;font-size:13px;margin:2px 0 0;">New Order Received</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;font-weight:600;color:#d4728a;width:120px;">Order #</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;color:#4a3542;">${orderId}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;font-weight:600;color:#d4728a;">Date</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;color:#4a3542;">${dateStr}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;font-weight:600;color:#d4728a;">Customer</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;color:#4a3542;">${name}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;font-weight:600;color:#d4728a;">Email</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;color:#4a3542;"><a href="mailto:${email}" style="color:#e8758a;">${email}</a></td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;font-weight:600;color:#d4728a;">Category</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;color:#4a3542;">${category}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;font-weight:600;color:#d4728a;">Details</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff5f7;color:#4a3542;">${details || '—'}</td></tr>
          <tr><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;font-weight:600;color:#d4728a;">Remarks</td><td style="padding:10px 12px;border:1px solid #ffe0e6;background:#fff;color:#4a3542;">${req.body.remarks || '—'}</td></tr>
          <tr><td style="padding:14px 12px;border:1px solid #ffe0e6;background:#fff5f7;font-weight:700;color:#e8758a;font-size:18px;">Total</td><td style="padding:14px 12px;border:1px solid #ffe0e6;background:#fff5f7;font-weight:700;color:#e8758a;font-size:20px;">${total}</td></tr>
        </table>
        ${filesHtml}
        <div style="margin-top:20px;padding-top:16px;border-top:2px solid #ffe0e6;text-align:center;font-size:12px;color:#b3868a;">
          🎀 Lil' n Bites Creations
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"Lil' n Bites Creations" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🛎 New Order from ${name} — ${total}`,
      html: emailHtml,
    })

    res.json({ success: true, orderId })
  } catch (err) {
    console.error('Order error:', err)
    res.status(500).json({ error: 'Failed to send order. Please try again.' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🎀 Lil' n Bites server running on http://localhost:${PORT}`)
})
