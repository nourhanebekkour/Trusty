import api from './api'

const ENDPOINTS = {
  me: [
    '/auth/me',
    '/me',
    '/profile',
    '/users/me',
    '/utilisateurs/me'
  ],

  internships: [
    '/professional/internships',
    '/professionnel/stages',
    '/stages',
    '/internships'
  ],

  projects: [
    '/professional/projects',
    '/professionnel/projets',
    '/projets',
    '/projects'
  ],

  students: [
    '/professional/students',
    '/professionnel/etudiants',
    '/etudiants',
    '/students'
  ],

  documents: [
    '/professional/documents',
    '/professionnel/documents',
    '/fichiers',
    '/files',
    '/documents'
  ],

  portfolios: [
    '/professional/portfolios',
    '/professionnel/portfolios',
    '/portfolios'
  ],

  recommendations: [
    '/professional/recommendations',
    '/professional/recommandations',
    '/professionnel/recommendations',
    '/professionnel/recommandations',
    '/recommendations',
    '/recommandations'
  ],

  createRecommendation: [
    '/professional/recommendations',
    '/professional/recommandations',
    '/professionnel/recommendations',
    '/professionnel/recommandations',
    '/recommendations',
    '/recommandations'
  ]
}

const unwrap = (response) => {
  const payload = response?.data ?? response

  if (payload?.data !== undefined) return payload.data
  if (payload?.result !== undefined) return payload.result
  if (payload?.items !== undefined) return payload.items
  if (payload?.user !== undefined) return payload.user

  return payload
}

const toArray = (response) => {
  const data = unwrap(response)

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results

  if (Array.isArray(data?.stages)) return data.stages
  if (Array.isArray(data?.internships)) return data.internships

  if (Array.isArray(data?.projets)) return data.projets
  if (Array.isArray(data?.projects)) return data.projects

  if (Array.isArray(data?.etudiants)) return data.etudiants
  if (Array.isArray(data?.students)) return data.students

  if (Array.isArray(data?.fichiers)) return data.fichiers
  if (Array.isArray(data?.documents)) return data.documents

  if (Array.isArray(data?.portfolios)) return data.portfolios

  if (Array.isArray(data?.recommandations)) return data.recommandations
  if (Array.isArray(data?.recommendations)) return data.recommendations

  return []
}

const requestFirstAvailable = async (urls) => {
  let lastError = null

  for (const url of urls) {
    try {
      const response = await api.get(url)
      return response
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const postFirstAvailable = async (urls, payloads) => {
  let lastError = null

  for (const url of urls) {
    for (const payload of payloads) {
      try {
        const response = await api.post(url, payload)
        return response
      } catch (error) {
        lastError = error
      }
    }
  }

  throw lastError
}

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-GB')
}

const normalizeStatus = (status) => {
  const labels = {
    EN_ATTENTE: 'Pending',
    VALIDE: 'Validated',
    REJETE: 'Rejected',
    ACTIF: 'Active',
    INACTIF: 'Inactive',
    SUSPENDU: 'Suspended'
  }

  return labels[status] || status || 'Unknown'
}

const normalizeStudent = (raw) => {
  const student = raw?.etudiant || raw?.student || raw || {}
  const user = student?.utilisateur || student?.user || student || {}

  const firstName = user.prenom || user.firstName || ''
  const lastName = user.nom || user.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    id: student.id_etudiant || student.id || user.id_utilisateur || user.id || '-',
    fullName: fullName || student.fullName || student.name || 'Student',
    email: user.email || student.email || '-',
    phone: user.telephone || user.phone || student.telephone || student.phone || '-',
    photo: user.photo || student.photo || null,
    studentNumber: student.numero_etudiant || student.studentNumber || '-',
    field: student.filiere || student.field || '-',
    year: student.annee || student.year || '-',
    city: student.ville || student.city || '-',
    biography: student.biographie || student.biography || '-',
    linkedin: student.linkedin_url || student.linkedin || '',
    github: student.github_username || student.github || '',
    website: student.site_web || student.website || '',
    credibilityScore: student.score_credibilite || student.credibilityScore || 0,
    credibilityLevel: student.niveau_credibilite || student.credibilityLevel || '-',
    portfolio: student.portfolio || null,
    internships: []
  }
}

const normalizeTechnology = (raw) => {
  const technology = raw?.technologie || raw?.technology || raw || {}

  return {
    id: technology.id_technologie || technology.id || technology.nom || technology.name,
    name: technology.nom || technology.name || '-',
    category: technology.categorie || technology.category || '-',
    level: raw?.niveau_utilisation || raw?.level || '-'
  }
}

const normalizeProfile = (response) => {
  const raw = unwrap(response) || {}
  const user = raw.utilisateur || raw.user || raw
  const professional = raw.professionnel || raw.professional || raw

  const firstName = user.prenom || user.firstName || ''
  const lastName = user.nom || user.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    id: user.id_utilisateur || user.id || professional.id_professionnel || '-',
    fullName: fullName || raw.fullName || raw.name || 'Professional User',
    email: user.email || raw.email || '-',
    phone: user.telephone || raw.phone || '-',
    photo: user.photo || raw.photo || null,
    role: user.role || raw.role || 'PROFESSIONNEL',

    company: professional.entreprise || professional.company || '-',
    position: professional.poste || professional.position || 'Professional Supervisor',
    sector: professional.secteur_activite || professional.sector || '-',

    professionalEmail:
      professional.email_professionnel ||
      professional.professionalEmail ||
      user.email ||
      '-',

    validationStatus: normalizeStatus(professional.status_validation)
  }
}

const normalizeInternship = (raw) => {
  const stage = raw?.stage || raw?.internship || raw || {}

  return {
    id: stage.id_stage || stage.id || '-',
    title: stage.poste || stage.title || stage.titre || 'Internship',
    company: stage.entreprise || stage.company || '-',
    companyAddress: stage.adresse_entreprise || stage.companyAddress || '-',
    missions: stage.missions || stage.description || '-',

    startDate: stage.date_debut || stage.startDate || null,
    endDate: stage.date_fin || stage.endDate || null,

    period: `${formatDate(stage.date_debut || stage.startDate)} - ${formatDate(stage.date_fin || stage.endDate)}`,

    durationWeeks: stage.duree_semaines || stage.durationWeeks || '-',

    professionalSupervisor:
      stage.encadrant_professionnel ||
      stage.professionalSupervisor ||
      '-',

    academicSupervisor:
      stage.encadrant_academique ||
      stage.academicSupervisor ||
      '-',

    status: normalizeStatus(stage.status_validation || stage.status),
    rawStatus: stage.status_validation || stage.status,

    submissionDate: formatDate(stage.date_soumission || stage.submissionDate),
    validationDate: formatDate(stage.date_validation || stage.validationDate),
    validationComment: stage.commentaire_validation || stage.validationComment || '-',

    report: stage.rapport || stage.report || null,

    student: normalizeStudent(stage.etudiant || stage.student),
    technologies: toArray(stage.technologies).map(normalizeTechnology)
  }
}

const normalizeProject = (raw) => {
  const project = raw?.projet || raw?.project || raw || {}
  const participations = toArray(project.participations || project.participations_projets)

  const students = participations.length
    ? participations.map((participation) => ({
        ...normalizeStudent(participation.etudiant || participation.student),
        roleInProject: participation.role_joue || participation.role || '-',
        isCreator: Boolean(participation.est_createur || participation.isCreator)
      }))
    : toArray(project.students || project.etudiants).map(normalizeStudent)

  return {
    id: project.id_projet || project.id || '-',
    title: project.titre || project.title || 'Project',
    description: project.description || '-',
    type: project.type_projet || project.type || '-',

    startDate: formatDate(project.date_debut || project.startDate),
    endDate: formatDate(project.date_fin || project.endDate),

    githubLink: project.lien_github || project.githubLink || '',
    youtubeLink: project.lien_youtube || project.youtubeLink || '',
    demoLink: project.lien_demo || project.demoLink || '',

    results: project.resultats_obtenus || project.results || '-',

    status: normalizeStatus(project.status_validation || project.status),
    rawStatus: project.status_validation || project.status,

    validationComment: project.commentaire_validation || project.validationComment || '-',
    appreciation: project.appreciation || '-',

    technologies: toArray(project.technologies).map(normalizeTechnology),
    files: toArray(project.fichiers || project.files),

    students,
    mainStudent: students[0] || null
  }
}

const normalizeDocument = (raw) => {
  const file = raw?.fichier || raw?.document || raw || {}

  return {
    id: file.id_fichier || file.id || '-',
    name: file.nom_original || file.originalName || file.name || 'Document',
    storageName: file.nom_stockage || file.storageName || '-',
    category: file.categorie || file.category || '-',
    path: file.chemin_minio || file.path || file.url || '',
    mimeType: file.type_mime || file.mimeType || '-',
    size: file.taille_octets || file.size || '-',
    uploadDate: formatDate(file.date_upload || file.uploadDate),
    uploader: file.uploader || null,
    project: file.projet || file.project || null
  }
}

const normalizePortfolio = (raw) => {
  const portfolio = raw?.portfolio || raw || {}
  const student = normalizeStudent(portfolio.etudiant || portfolio.student)

  return {
    id: portfolio.id_portfolio || portfolio.id || '-',
    studentId: portfolio.id_etudiant || portfolio.studentId || student.id,
    title: portfolio.titre_personnalise || portfolio.title || 'Student Portfolio',
    subtitle: portfolio.sous_titre || portfolio.subtitle || '-',
    publicUrl: portfolio.url_publique || portfolio.publicUrl || '',
    views: portfolio.nombre_vues || portfolio.views || 0,
    recommendationsCount:
      portfolio.nombre_recommandations ||
      portfolio.recommendationsCount ||
      0,
    isPublished: Boolean(portfolio.est_publie || portfolio.isPublished),
    createdAt: formatDate(portfolio.date_creation || portfolio.createdAt),
    updatedAt: formatDate(portfolio.date_derniere_maj || portfolio.updatedAt),
    publishedAt: formatDate(portfolio.date_publication || portfolio.publishedAt),
    student
  }
}

const normalizeRecommendation = (raw) => {
  const recommendation = raw?.recommandation || raw?.recommendation || raw || {}

  const student = normalizeStudent(
    recommendation.cible ||
    recommendation.etudiant ||
    recommendation.student
  )

  const author =
    recommendation.auteur ||
    recommendation.author ||
    recommendation.recommandeur ||
    {}

  const firstName = author.prenom || author.firstName || ''
  const lastName = author.nom || author.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    id: recommendation.id_recommandation || recommendation.id || '-',
    studentId: recommendation.id_etudiant || recommendation.studentId || student.id,
    recommenderId: recommendation.id_recommandeur || recommendation.recommenderId || '-',
    message: recommendation.message || '-',

    status: normalizeStatus(recommendation.status),
    rawStatus: recommendation.status,

    createdAt: formatDate(recommendation.date_creation || recommendation.createdAt),
    validationDate: formatDate(recommendation.date_validation || recommendation.validationDate),

    student,

    author: {
      id: author.id_utilisateur || author.id || '-',
      fullName: fullName || author.fullName || author.name || 'Recommender',
      email: author.email || '-',
      role: author.role || '-'
    }
  }
}

export const professionalApi = {
  async getProfile() {
    const response = await requestFirstAvailable(ENDPOINTS.me)
    return normalizeProfile(response)
  },

  async getInternships() {
    const response = await requestFirstAvailable(ENDPOINTS.internships)
    return toArray(response).map(normalizeInternship)
  },

  async getStudents() {
    const internships = await this.getInternships().catch(() => [])
    const studentsMap = new Map()

    internships.forEach((internship) => {
      if (!internship.student?.id) return

      const existingStudent = studentsMap.get(internship.student.id)

      if (existingStudent) {
        existingStudent.internships.push(internship)
      } else {
        studentsMap.set(internship.student.id, {
          ...internship.student,
          internships: [internship]
        })
      }
    })

    if (studentsMap.size > 0) {
      return Array.from(studentsMap.values())
    }

    const response = await requestFirstAvailable(ENDPOINTS.students)
    return toArray(response).map(normalizeStudent)
  },

  async getProjects() {
    const response = await requestFirstAvailable(ENDPOINTS.projects)
    const projects = toArray(response).map(normalizeProject)

    const students = await this.getStudents().catch(() => [])
    const studentIds = students.map((student) => student.id)

    if (studentIds.length === 0) {
      return projects
    }

    return projects.filter((project) =>
      project.students.some((student) => studentIds.includes(student.id))
    )
  },

  async getDocuments() {
    const response = await requestFirstAvailable(ENDPOINTS.documents)
    return toArray(response).map(normalizeDocument)
  },

  async getPortfolios() {
    const students = await this.getStudents().catch(() => [])
    const studentIds = students.map((student) => student.id)

    const response = await requestFirstAvailable(ENDPOINTS.portfolios)
    const portfolios = toArray(response).map(normalizePortfolio)

    if (studentIds.length === 0) {
      return portfolios
    }

    return portfolios.filter((portfolio) =>
      studentIds.includes(portfolio.studentId)
    )
  },

  async getRecommendations() {
    const students = await this.getStudents().catch(() => [])
    const studentIds = students.map((student) => student.id)

    const response = await requestFirstAvailable(ENDPOINTS.recommendations)
    const recommendations = toArray(response).map(normalizeRecommendation)

    if (studentIds.length === 0) {
      return recommendations
    }

    return recommendations.filter((recommendation) =>
      studentIds.includes(recommendation.studentId)
    )
  },

  async createRecommendation(studentId, message) {
    const payloads = [
      {
        id_etudiant: studentId,
        message
      },
      {
        studentId,
        message
      },
      {
        idEtudiant: studentId,
        message
      }
    ]

    const response = await postFirstAvailable(
      ENDPOINTS.createRecommendation,
      payloads
    )

    return normalizeRecommendation(unwrap(response))
  },

  async addRecommendation(student, message) {
    return this.createRecommendation(student.id, message)
  },

  async getDashboard() {
    const [
      profile,
      internships,
      projects,
      students,
      documents,
      portfolios,
      recommendations
    ] = await Promise.all([
      this.getProfile().catch(() => null),
      this.getInternships().catch(() => []),
      this.getProjects().catch(() => []),
      this.getStudents().catch(() => []),
      this.getDocuments().catch(() => []),
      this.getPortfolios().catch(() => []),
      this.getRecommendations().catch(() => [])
    ])

    return {
      profile,

      stats: {
        totalInternships: internships.length,
        pendingInternships: internships.filter((item) => item.rawStatus === 'EN_ATTENTE').length,
        totalProjects: projects.length,
        assignedStudents: students.length,
        documents: documents.length,
        portfolios: portfolios.length,
        recommendations: recommendations.length
      },

      recentInternships: internships.slice(0, 5),
      recentProjects: projects.slice(0, 5)
    }
  },

  async addInternshipRemark(internshipId, content) {
    return api.post(`/stages/${internshipId}/remarks`, {
      content
    })
  },

  async addProjectFeedback(projectId, content) {
    return api.post(`/projets/${projectId}/feedback`, {
      content
    })
  }
}