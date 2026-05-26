import api from './api'

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
  if (Array.isArray(data?.projets)) return data.projets
  if (Array.isArray(data?.projects)) return data.projects
  if (Array.isArray(data?.etudiants)) return data.etudiants
  if (Array.isArray(data?.students)) return data.students
  if (Array.isArray(data?.fichiers)) return data.fichiers
  if (Array.isArray(data?.documents)) return data.documents

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
    phone: user.telephone || student.phone || '-',
    photo: user.photo || student.photo || null,
    studentNumber: student.numero_etudiant || student.studentNumber || '-',
    field: student.filiere || student.field || '-',
    year: student.annee || student.year || '-',
    city: student.ville || student.city || '-'
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

  const participations = toArray(project.participations)

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

const saveLocalItem = (key, value) => {
  const oldItems = JSON.parse(localStorage.getItem(key) || '[]')

  const newItem = {
    id: Date.now(),
    ...value,
    createdAt: new Date().toISOString()
  }

  localStorage.setItem(key, JSON.stringify([newItem, ...oldItems]))

  return newItem
}

export const professionalApi = {
  async getProfile() {
    const response = await requestFirstAvailable([
      '/auth/me',
      '/me',
      '/profile',
      '/users/me',
      '/utilisateurs/me'
    ])

    return normalizeProfile(response)
  },

  async getInternships() {
    const response = await requestFirstAvailable([
      '/professional/internships',
      '/professionnel/stages',
      '/stages',
      '/internships'
    ])

    return toArray(response).map(normalizeInternship)
  },

  async getProjects() {
    const response = await requestFirstAvailable([
      '/professional/projects',
      '/professionnel/projets',
      '/projets',
      '/projects'
    ])

    return toArray(response).map(normalizeProject)
  },

  async getStudents() {
    try {
      const response = await requestFirstAvailable([
        '/professional/students',
        '/professionnel/etudiants',
        '/etudiants',
        '/students'
      ])

      return toArray(response).map(normalizeStudent)
    } catch {
      const internships = await this.getInternships()

      const map = new Map()

      internships.forEach((internship) => {
        if (internship.student?.id) {
          map.set(internship.student.id, internship.student)
        }
      })

      return Array.from(map.values())
    }
  },

  async getDocuments() {
    try {
      const response = await requestFirstAvailable([
        '/professional/documents',
        '/professionnel/documents',
        '/fichiers',
        '/files',
        '/documents'
      ])

      return toArray(response).map(normalizeDocument)
    } catch {
      const projects = await this.getProjects()
      const internships = await this.getInternships()

      const projectFiles = projects.flatMap((project) =>
        project.files.map((file) =>
          normalizeDocument({
            ...file,
            project: {
              id: project.id,
              title: project.title
            }
          })
        )
      )

      const internshipReports = internships
        .filter((internship) => internship.report)
        .map((internship) =>
          normalizeDocument({
            ...internship.report,
            name: internship.report.nom_original || 'Internship report'
          })
        )

      return [...projectFiles, ...internshipReports]
    }
  },

  async getDashboard() {
    const [profile, internships, projects, students, documents] = await Promise.all([
      this.getProfile().catch(() => null),
      this.getInternships().catch(() => []),
      this.getProjects().catch(() => []),
      this.getStudents().catch(() => []),
      this.getDocuments().catch(() => [])
    ])

    return {
      profile,

      stats: {
        totalInternships: internships.length,
        pendingInternships: internships.filter((item) => item.rawStatus === 'EN_ATTENTE').length,
        totalProjects: projects.length,
        assignedStudents: students.length,
        documents: documents.length
      },

      recentInternships: internships.slice(0, 5),
      recentProjects: projects.slice(0, 5)
    }
  },

  async addInternshipRemark(internshipId, content) {
    return saveLocalItem('professional_internship_remarks', {
      internshipId,
      content
    })
  },

  async addProjectFeedback(projectId, content) {
    return saveLocalItem('professional_project_feedbacks', {
      projectId,
      content
    })
  }
}