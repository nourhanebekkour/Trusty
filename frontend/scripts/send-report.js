import dotenv from 'dotenv'
import { createTransport } from 'nodemailer'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

dotenv.config({ path: resolve(root, '.env.ci') })

const {
  SMTP_USER, SMTP_PASS, SMTP_TO,
  JIRA_BASE_URL, JIRA_PROJECT_KEY, JIRA_USER_EMAIL, JIRA_API_TOKEN,
} = process.env

const html   = readFileSync(resolve(root, 'test-report.html'), 'utf-8')
const results = JSON.parse(readFileSync(resolve(root, 'test-results.json'), 'utf-8'))
const { numTotalTests = 0, numPassedTests = 0, numFailedTests = 0, startTime } = results

const passRate  = numTotalTests > 0 ? Math.round((numPassedTests / numTotalTests) * 100) : 0
const statusLabel = numFailedTests === 0 ? 'SUCCÈS ✅' : 'ÉCHEC ❌'
const priority    = numFailedTests > 0  ? 'High'      : 'Low'
const date = new Date(startTime || Date.now()).toLocaleString('fr-FR')

// ── EMAIL ──────────────────────────────────────────────────────────────────────
async function sendEmail() {
  if (!SMTP_USER || !SMTP_PASS || !SMTP_TO) {
    console.warn('⚠️  Variables SMTP manquantes — email ignoré.')
    return
  }
  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { rejectUnauthorized: false },
  })

  await transporter.sendMail({
    from: `"Trusty CI" <${SMTP_USER}>`,
    to: SMTP_TO,
    subject: `[Trusty Frontend] Rapport de tests – ${statusLabel} – ${date}`,
    html,
    attachments: [{ filename: 'test-report.html', content: html, contentType: 'text/html' }],
  })
  console.log(`✅  Email envoyé à ${SMTP_TO}`)
}

// ── JIRA ───────────────────────────────────────────────────────────────────────
async function createJiraTicket() {
  if (!JIRA_BASE_URL || !JIRA_API_TOKEN || !JIRA_USER_EMAIL || !JIRA_PROJECT_KEY) {
    console.warn('⚠️  Variables Jira manquantes — ticket ignoré.')
    return
  }
  const token = Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')

  const payload = {
    fields: {
      project: { key: JIRA_PROJECT_KEY },
      summary: `[Frontend CI] Rapport de tests – ${statusLabel} – ${date}`,
      description: {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: `Rapport automatique généré le ${date}.` }],
          },
          {
            type: 'bulletList',
            content: [
              li(`Total : ${numTotalTests} tests`),
              li(`Réussis : ${numPassedTests}`),
              li(`Échoués : ${numFailedTests}`),
              li(`Taux de réussite : ${passRate}%`),
            ],
          },
        ],
      },
      issuetype: { name: 'Task' },
      priority:  { name: priority },
    },
  }

  const res = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Jira ${res.status}: ${err}`)
  }

  const data = await res.json()
  console.log(`✅  Ticket Jira créé : ${data.key}`)
  console.log(`    ${JIRA_BASE_URL}/browse/${data.key}`)
}

function li(text) {
  return { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] }
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
const [emailResult, jiraResult] = await Promise.allSettled([sendEmail(), createJiraTicket()])

if (emailResult.status === 'rejected') console.error('❌  Email :', emailResult.reason.message)
if (jiraResult.status  === 'rejected') console.error('❌  Jira  :', jiraResult.reason.message)
