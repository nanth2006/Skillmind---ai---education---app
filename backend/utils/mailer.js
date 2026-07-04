import nodemailer from "nodemailer"

// SMTP is optional. If env vars aren't set, sendMail() simply
// returns { sent: false } and the caller can fall back to returning
// the reset link directly in the API response (useful in dev / before
// you've set up an email provider).
const isConfigured = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS

let transporter = null

const getTransporter = () => {
  if (!isConfigured()) return null
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

export const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter()

  if (!t) {
    console.log("✉️  SMTP not configured — skipping real email send.")
    return { sent: false }
  }

  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  })

  return { sent: true }
}
