import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const results = JSON.parse(readFileSync(resolve(root, 'test-results.json'), 'utf-8'))
const {
  numTotalTests = 0,
  numPassedTests = 0,
  numFailedTests = 0,
  testResults = [],
  startTime,
} = results

const passRate = numTotalTests > 0 ? Math.round((numPassedTests / numTotalTests) * 100) : 0
const date = new Date(startTime || Date.now()).toLocaleString('fr-FR')
const globalStatus = numFailedTests === 0 ? 'SUCCÈS' : 'ÉCHEC'
const statusColor = numFailedTests === 0 ? '#22c55e' : '#ef4444'

function renderAssertions(assertions = []) {
  return assertions.map(t => {
    const icon = t.status === 'passed' ? '✅' : t.status === 'failed' ? '❌' : '⏭️'
    const rowBg = t.status === 'passed' ? '#f0fdf4' : t.status === 'failed' ? '#fef2f2' : '#fefce8'
    const titleParts = [...(t.ancestorTitles || []), t.title]
    const err = t.failureMessages?.length
      ? `<tr><td colspan="2" style="padding:0 12px 8px;background:#fef2f2"><pre style="margin:0;font-size:11px;color:#b91c1c;white-space:pre-wrap;overflow-wrap:anywhere">${t.failureMessages[0]}</pre></td></tr>`
      : ''
    return `<tr style="background:${rowBg}">
        <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb">${icon} ${titleParts.join(' › ')}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#64748b;white-space:nowrap">${t.duration ?? '–'} ms</td>
      </tr>${err}`
  }).join('')
}

const suitesHtml = testResults.filter(s => s != null).map(suite => {
  const filePath = suite.name ?? suite.testFilePath ?? 'Fichier inconnu'
  const name = filePath.replace(/.*[\\/]/, '')
  const suiteOk = suite.status === 'passed'
  return `
  <div style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06)">
    <div style="background:${suiteOk ? '#f0fdf4' : '#fef2f2'};padding:12px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:700;font-size:14px">${suiteOk ? '✅' : '❌'} ${name}</span>
      <span style="font-size:12px;color:#64748b">${suite.assertionResults?.length ?? 0} test(s)</span>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="background:#f8fafc">
        <th style="padding:6px 12px;text-align:left;font-weight:600;color:#475569;border-bottom:1px solid #e5e7eb">Test</th>
        <th style="padding:6px 12px;text-align:right;font-weight:600;color:#475569;border-bottom:1px solid #e5e7eb">Durée</th>
      </tr>
      ${renderAssertions(suite.assertionResults)}
    </table>
  </div>`
}).join('')

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rapport de tests – Trusty Frontend</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; margin: 0; background: #f1f5f9; color: #1e293b; }
  .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: #fff; padding: 36px 48px; }
  .header h1 { margin: 0 0 6px; font-size: 26px; letter-spacing: -.3px; }
  .header p  { margin: 0; font-size: 14px; opacity: .8; }
  .badge { display:inline-block; padding:5px 18px; border-radius:999px; font-weight:800; font-size:15px; background:#fff; color:${statusColor}; }
  .container { max-width: 960px; margin: 36px auto; padding: 0 24px; }
  .cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
  .card { background: #fff; border-radius: 12px; padding: 22px 16px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
  .card .num { font-size: 38px; font-weight: 800; line-height: 1; }
  .card .lbl { font-size: 12px; color: #94a3b8; margin-top: 6px; text-transform: uppercase; letter-spacing: .5px; }
  h2 { font-size: 18px; font-weight: 700; margin: 0 0 20px; color: #0f172a; }
  .footer { text-align:center; padding: 24px; font-size:12px; color:#94a3b8; }
</style>
</head>
<body>

<div class="header">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px">
    <div>
      <h1>Trusty — Rapport de tests Frontend</h1>
      <p>Généré le ${date}</p>
    </div>
    <div class="badge">${globalStatus}</div>
  </div>
</div>

<div class="container">

  <div class="cards">
    <div class="card">
      <div class="num" style="color:#6366f1">${numTotalTests}</div>
      <div class="lbl">Total</div>
    </div>
    <div class="card">
      <div class="num" style="color:#22c55e">${numPassedTests}</div>
      <div class="lbl">Réussis</div>
    </div>
    <div class="card">
      <div class="num" style="color:#ef4444">${numFailedTests}</div>
      <div class="lbl">Échoués</div>
    </div>
    <div class="card">
      <div class="num" style="color:${passRate === 100 ? '#22c55e' : passRate >= 80 ? '#f59e0b' : '#ef4444'}">${passRate}%</div>
      <div class="lbl">Réussite</div>
    </div>
  </div>

  <h2>Détail par fichier de test</h2>
  ${suitesHtml || '<p style="color:#94a3b8;text-align:center">Aucun fichier de test trouvé.</p>'}

</div>
<div class="footer">Trusty CI — rapport généré automatiquement par Vitest</div>
</body>
</html>`

writeFileSync(resolve(root, 'test-report.html'), html, 'utf-8')
console.log(`✅  Rapport HTML généré : test-report.html`)
console.log(`    ${numTotalTests} tests — ${numPassedTests} réussis — ${numFailedTests} échoués — ${passRate}% de réussite`)
