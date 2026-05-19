import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProfessorStore = defineStore('professor', () => {

  // ── État ──────────────────────────────────────────────────────────────────
  const projets = ref([
    {
      id: 1,
      nom: 'Cloud Scale API',
      etudiant: 'Thomas Bernard',
      context: 'Projet académique',
      date: 'Soumis il y a 2j',
      description: 'Infrastructure microservices, Docker & Kubernetes — 10k req/s',
      icon: 'api',
      color: 'blue',
      progress: 100,
      statusColor: '#f4b94b',
      status: 'pending',
      statusLabel: 'En attente',
    },
    {
      id: 2,
      nom: 'Développeur Fullstack',
      etudiant: 'Léa Martin',
      context: 'TechCorp Paris',
      date: 'Juin–Déc 2023',
      description: 'Dashboard monitoring industriel — React & Go',
      icon: 'device-laptop',
      color: 'teal',
      progress: 65,
      statusColor: '#f4b94b',
      status: 'pending',
      statusLabel: 'En attente',
    },
    {
      id: 3,
      nom: "Algorithme d'Optimisation",
      etudiant: 'Alexandre Gauthier',
      context: 'Hackathon',
      date: 'Mars 2023',
      description: 'Algorithme génétique — logistique urbaine',
      icon: 'math-function',
      color: 'amber',
      progress: 45,
      statusColor: '#f4b94b',
      status: 'pending',
      statusLabel: 'En attente',
    },
    {
      id: 4,
      nom: 'Système de Recommandation IA',
      etudiant: 'Sophie Durand',
      context: 'Projet M1',
      date: 'Jan 2024',
      description: 'NLP — filtrage collaboratif hybride',
      icon: 'robot',
      color: 'pink',
      progress: 100,
      statusColor: '#66c99f',
      status: 'valide',
      statusLabel: 'Validé',
    },
  ])

  const lettres = ref([
    {
      id: 1,
      etudiant: 'Thomas Bernard',
      message: 'a demandé une lettre pour son stage chez AWS Paris',
      time: 'Il y a 3 heures',
      formation: 'Master 2 Ingénierie Logicielle',
      color: '#66c99f',
      action: 'Rédiger',
      urgent: false,
    },
    {
      id: 2,
      etudiant: 'Léa Martin',
      message: 'a soumis une demande de certification officielle de portfolio',
      time: 'Hier',
      formation: 'Licence Design Numérique',
      color: '#85B7EB',
      action: 'Signer',
      urgent: false,
    },
    {
      id: 3,
      etudiant: 'Alex Gauthier',
      message: 'lettre en attente de signature depuis 5 jours',
      time: '5 jours',
      formation: 'DUT Paris-Saclay',
      color: '#f4b94b',
      action: 'Urgence',
      urgent: true,
    },
  ])

  const etudiants = ref([
    { id: 1, nom: 'Thomas Bernard',    initiales: 'TB', formation: 'M2 Ingénierie Logicielle', score: 88, gradient: 'linear-gradient(135deg, #378ADD, #85B7EB)' },
    { id: 2, nom: 'Léa Martin',        initiales: 'LM', formation: 'Licence Design Numérique', score: 94, gradient: 'linear-gradient(135deg, #D4537E, #ED93B1)' },
    { id: 3, nom: 'Alexandre Gauthier',initiales: 'AG', formation: 'DUT Paris-Saclay',          score: 62, gradient: 'linear-gradient(135deg, #1D9E75, #5DCAA5)' },
    { id: 4, nom: 'Sophie Durand',     initiales: 'SD', formation: 'Master 1 IA',               score: 77, gradient: 'linear-gradient(135deg, #BA7517, #EF9F27)' },
  ])

  const stages = ref([
    {
      id: 1,
      entreprise: 'TechCorp Paris',
      etudiant: 'Léa Martin',
      role: 'Dev. Fullstack',
      dates: 'Juin–Déc 2023',
      progress: 70,
      color: '#66c99f',
      status: 'valide',
      statusLabel: 'En cours',
      note: 'Rapport intermédiaire reçu',
    },
    {
      id: 2,
      entreprise: 'Startup DataViz',
      etudiant: 'Thomas Bernard',
      role: 'Data Engineer',
      dates: 'Jan–Juil 2024',
      progress: 30,
      color: '#f4b94b',
      status: 'pending',
      statusLabel: 'Attente rapport',
      note: 'Rapport final attendu sous 2 semaines',
    },
  ])

  const notifications = ref([
    { id: 1, nom: 'Thomas B.', message: 'a soumis son portfolio complet',        time: 'Il y a 1h',  color: '#66c99f' },
    { id: 2, nom: 'Léa M.',    message: 'a ajouté 2 nouvelles compétences',      time: 'Il y a 3h',  color: '#85B7EB' },
    { id: 3, nom: 'Alex G.',   message: "n'a pas remis son rapport de stage",    time: 'Hier',       color: '#f4b94b' },
    { id: 4, nom: 'Sophie D.', message: 'a demandé une extension de délai',      time: 'Il y a 2j',  color: '#a0b4ae', last: true },
  ])

  // ── Getters ───────────────────────────────────────────────────────────────
  const enAttente       = computed(() => projets.value.filter(p => p.status === 'pending').length)
  const valides         = computed(() => projets.value.filter(p => p.status === 'valide').length)
  const etudiantsSuivis = computed(() => etudiants.value.length)
  const stagesEnCours   = computed(() => stages.value.length)

  // ── Actions ───────────────────────────────────────────────────────────────
  function validerProjet(projet) {
    const found = projets.value.find(p => p.id === projet.id)
    if (!found) return
    found.status      = 'valide'
    found.statusLabel = 'Validé'
    found.progress    = 100
    found.statusColor = '#66c99f'
  }

  return {
    projets,
    lettres,
    etudiants,
    stages,
    notifications,
    enAttente,
    valides,
    etudiantsSuivis,
    stagesEnCours,
    validerProjet,
  }
})