import api from '@/services/api'

function extractData(res) {
  const body = res?.data ?? res
  return body?.data ?? body
}

export async function getLettresRecues() {
  const res = await api.get('/lettres-recommandation/recues')
  const data = extractData(res)
  return Array.isArray(data) ? data : []
}

export async function demanderLettre(data) {
  const res = await api.post('/lettres-recommandation/demander', data)
  return extractData(res)
}

export async function getProfesseurs(ecole) {
  const res = await api.get(`/professeurs/ecole/${ecole}`)
  return extractData(res) ?? []
}

export function normalizeLettre(l) {
  return {
    id: l.id_lettre,
    type: l.type_lettre,
    redacteur: l.redacteur ? `${l.redacteur.prenom} ${l.redacteur.nom}` : 'Inconnu',
    description: l.description || '',
    destinataire: l.destinataire || '',
    date_redaction: l.date_redaction,
    date_validation: l.date_validation,
    pdf_url: l.fichier_pdf?.url || null,
  }
}

export const TYPE_LETTRES = [
  { value: 'DOUBLE_DIPLOME', label: 'Double diplôme' },
  { value: 'STAGE', label: 'Stage' },
  { value: 'PFE', label: 'PFE' },
  { value: 'MASTER', label: 'Master' },
  { value: 'EMPLOI', label: 'Emploi' },
  { value: 'INTERNATIONAL', label: 'International' },
]

export function formatType(type) {
  const map = Object.fromEntries(TYPE_LETTRES.map(t => [t.value, t.label]))
  return map[type] || type
}
