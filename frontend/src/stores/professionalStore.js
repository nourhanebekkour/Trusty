import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProfessionalStore = defineStore('professional', () => {

  // ── État ──────────────────────────────────────────────────────────────────
  const favoris        = ref([2])
  const recsEmises     = ref([])
  const notifications  = ref([
    { id: 1, nom: 'Thomas Bernard', message: 'a consulté votre offre DataTech',                             time: 'Il y a 30 min', color: '#66c99f' },
    { id: 2, nom: 'Léa Martin',     message: 'a accepté votre contact',                                     time: 'Il y a 2h',     color: '#85B7EB' },
    { id: 3, nom: '',               message: '3 nouveaux portfolios certifiés correspondent à vos critères', time: "Aujourd'hui",   color: '#a0b4ae', last: true },
  ])
  const statsActivite  = ref({ consultes: 24 })

  const candidats = ref([
    {
      id: 1,
      nom: 'Thomas Bernard',
      initiales: 'TB',
      formation: 'M2 Ingénierie Logicielle',
      ecole: 'Sorbonne',
      score: 88,
      gradient: 'linear-gradient(135deg, #378ADD, #85B7EB)',
      ville: 'Paris',
      icon: 'device-laptop',
      color: 'blue',
      description: 'Architecture cloud, Docker & K8s — 3 projets majeurs validés, stage TechCorp Paris.',
    },
    {
      id: 2,
      nom: 'Léa Martin',
      initiales: 'LM',
      formation: 'Licence Design Numérique',
      ecole: 'Paris 8',
      score: 94,
      gradient: 'linear-gradient(135deg, #D4537E, #ED93B1)',
      ville: 'Lyon',
      icon: 'pencil',
      color: 'pink',
      description: 'Spécialiste UX/UI · Dashboard industriel React · Figma expert.',
    },
    {
      id: 3,
      nom: 'Alexandre Gauthier',
      initiales: 'AG',
      formation: 'DUT Informatique',
      ecole: 'Paris-Saclay',
      score: 62,
      gradient: 'linear-gradient(135deg, #1D9E75, #5DCAA5)',
      ville: 'Gif-sur-Yvette',
      icon: 'math-function',
      color: 'teal',
      description: 'Algorithme génétique logistique urbaine — Hackathon 2023.',
    },
    {
      id: 4,
      nom: 'Sophie Durand',
      initiales: 'SD',
      formation: 'Master 1 IA',
      ecole: 'Paris-Saclay',
      score: 77,
      gradient: 'linear-gradient(135deg, #BA7517, #EF9F27)',
      ville: 'Gif-sur-Yvette',
      icon: 'robot',
      color: 'amber',
      description: 'Systèmes de recommandation NLP · Filtrage hybride · Projet M1 distingué.',
    },
  ])

  // ── Getters ───────────────────────────────────────────────────────────────
  const totalRecs          = computed(() => recsEmises.value.length)
  const candidatsFavoris   = computed(() => candidats.value.filter(c => favoris.value.includes(c.id)))
  const candidatsEnAttente = computed(() => candidats.value.filter(c => !aRecommande(c.id)).length)

  // ── Actions ───────────────────────────────────────────────────────────────
  function aRecommande(id) {
    return recsEmises.value.some(r => r.candidatId === id)
  }

  function incrementerConsultes() {
    statsActivite.value.consultes++
  }

  function envoyerRecommandation(candidat, texte, type) {
    const now  = new Date()
    const mois = now.toLocaleString('fr-FR', { month: 'long' })
    const annee = now.getFullYear()

    recsEmises.value.unshift({
      candidatId: candidat.id,
      nom:        candidat.nom,
      initiales:  candidat.initiales,
      gradient:   candidat.gradient,
      type,
      extrait:    texte.length > 60 ? texte.slice(0, 60) + '…' : texte,
      date:       `${mois.charAt(0).toUpperCase() + mois.slice(1)} ${annee}`,
    })

    notifications.value.unshift({
      id:      Date.now(),
      nom:     'DataTech SAS',
      message: `a émis une recommandation ${type === 'officielle' ? 'officielle' : 'rapide'} pour ${candidat.nom}`,
      time:    "À l'instant",
      color:   '#66c99f',
    })
  }

  return {
    // state
    favoris,
    recsEmises,
    notifications,
    statsActivite,
    candidats,
    // getters
    totalRecs,
    candidatsFavoris,
    candidatsEnAttente,
    // actions
    aRecommande,
    incrementerConsultes,
    envoyerRecommandation,
  }
})