import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Projet d\'integration',
    description: 'Documentation automatique des APIs du projet',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Entrez votre token JWT sous la forme : Bearer <token>'
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  definitions: {
    RegisterRequest: {
      email: 'etudiant@test.com',
      password: 'password123',
      nom: 'Nom',
      prenom: 'Prenom',
      role: 'ETUDIANT'
    },
    LoginRequest: {
      email: 'etudiant@test.com',
      password: 'password123'
    },
    EtudiantProfileRequest: {
      numero_etudiant: '2026001',
      filiere: 'GINF',
      annee: 3,
      date_naissance: '2000-01-01',
      adresse: '123 Rue de la fac',
      ville: 'Tanger',
      pays: 'Maroc',
      biographie: 'Etudiant passionné par le développement',
      linkedin_url: 'https://linkedin.com/in/username',
      github_username: 'username',
      site_web: 'https://mywebsite.com',
      objectif_professionnel: 'Développeur Fullstack',
      score_credibilite: 0,
      niveau_credibilite: 'DEBUTANT',
      visibilite_profil: 'PUBLIC'
    },
    AdminProfileRequest: {
      niveau_acces: 'ADMIN'
    },
    ProfesseurProfileRequest: {
      id_professeur: 'cuid_de_l_utilisateur',
      departement: 'SIC',
      specialite: 'Informatique',
      filieres: ['GINF', 'GSR'],
      date_naissance: '1980-01-01',
      adresse: '456 Rue des profs',
      ville: 'Tanger',
      pays: 'Maroc',
      biographie: 'Professeur expérimenté'
    },
    CompetenceRequest: {
      nom: 'Node.js',
      type: 'TECHNIQUE',
      categorie: 'Backend',
      description: 'Développement serveur avec Node.js',
      icone: 'https://icon-url.com'
    },
    FormationRequest: {
      diplome: 'Cycle d\'ingénieur',
      etablissement: 'ENSA Tanger',
      date_debut: '2023-09-01',
      date_fin: '2026-06-30',
      description: 'Génie Informatique',
      mention: 'Bien',
      est_actuelle: true
    },
    TechnologieRequest: {
      nom: "React",
      categorie: "Frontend",
      sous_categorie: "Library",
      description: "Bibliothèque JavaScript pour interfaces utilisateur",
      icone: "url_vers_icone"
    },
    ProjetRequest: {
      titre: "Mon Projet",
      description: "Une description détaillée du projet...",
      type_projet: "PFA",
      date_debut: "2023-01-01",
      date_fin: "2023-06-01",
      lien_github: "https://github.com/user/repo",
      lien_youtube: "https://youtube.com/watch?v=...",
      lien_demo: "https://demo.com",
      resultats_obtenus: "Le projet a permis de...",
      nombre_collaborateurs: 3,
      est_public: true
    },
    ParticipationProjetRequest: {
      role_joue: "Développeur Backend",
      date_debut: "2023-01-01",
      date_fin: "2023-06-01",
      est_createur: true,
      est_visible_portfolio: true
    },
    ProjetTechnologieRequest: {
      version: "18.2.0",
      niveau_utilisation: "AVANCE"
    },
    StageRequest: {
      entreprise: "Google",
      adresse_entreprise: "123 Rue Tech",
      poste: "Développeur Backend",
      date_debut: "2024-06-01",
      date_fin: "2024-08-31",
      duree_semaines: 10,
      missions: "Développement d'une API REST",
      encadrant_professionnel: "M. Ghailani",
      encadrant_academique: "Pr. Ghailani",
      est_public: true,
      id_etudiant: "cuid_etudiant"
    },
    StageTechnologieRequest: {
      version: "18.2.0",
      niveau_utilisation: "AVANCE"
    },
    StandardResponse: {
      success: true,
      message: 'Message de succès ou erreur',
      data: {},
      error: null
    }
  }
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
