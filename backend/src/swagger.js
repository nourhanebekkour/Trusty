import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Projet ghailani',
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
