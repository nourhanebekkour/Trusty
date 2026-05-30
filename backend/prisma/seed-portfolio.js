import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Création du portfolio de test pour Sara Benali...')

  const passwordHash = await bcrypt.hash('password123', 10)

  // ── 1. Sara Benali (étudiante) ───────────────────────────────────────────
  let sara = await prisma.utilisateur.findUnique({
    where: { email: 'sara.benali@etu.uae.ac.ma' }
  })

  if (!sara) {
    sara = await prisma.utilisateur.create({
      data: {
        email: 'sara.benali@etu.uae.ac.ma',
        mot_de_passe: passwordHash,
        nom: 'Benali',
        prenom: 'Sara',
        role: 'ETUDIANT',
        ecole: 'ENSATanger',
        status_compte: 'ACTIF',
        email_verifie: true,
        etudiant: {
          create: {
            numero_etudiant: 'E30001',
            filiere: 'Génie Informatique',
            annee: 3,
            biographie: "Passionnée par le développement web et l'intelligence artificielle. J'adore construire des interfaces élégantes et performantes.",
            objectif_professionnel: 'Développeuse Full Stack',
            github_username: 'sara-benali',
            linkedin_url: 'https://linkedin.com/in/sara-benali',
            score_credibilite: 82,
            niveau_credibilite: 'AVANCE'
          }
        }
      }
    })
    console.log('  ✓ Utilisatrice Sara Benali créée')
  } else {
    console.log('  → Sara Benali existe déjà, on continue')
  }

  const idEtudiant = sara.id_utilisateur

  // ── 2. Fichier fictif pour l'aperçu du template ──────────────────────────
  // Pas besoin de MinIO — on crée juste l'entrée en base pour satisfaire la FK
  let fichierApercu = await prisma.fichier.findUnique({
    where: { id_fichier: 'seed-apercu-template-1' }
  })

  if (!fichierApercu) {
    fichierApercu = await prisma.fichier.create({
      data: {
        id_fichier: 'seed-apercu-template-1',
        nom_original: 'apercu-template1.png',
        nom_stockage: 'seed-apercu-template1.png',
        categorie: 'PUBLIC',
        chemin_minio: 'public/seed-apercu-template1.png',
        type_mime: 'image/png',
        taille_octets: 1,
        id_uploader: sara.id_utilisateur
      }
    })
    console.log('  ✓ Fichier aperçu créé (fictif)')
  }

  // ── 3. Modèle de portfolio (template) ────────────────────────────────────
  let modele = await prisma.modelePortfolio.findUnique({
    where: { slug: 'template-1' }
  })

  if (!modele) {
    modele = await prisma.modelePortfolio.create({
      data: {
        nom: 'Template Modern',
        slug: 'template-1',
        est_actif: true,
        id_apercu: fichierApercu.id_fichier
      }
    })
    console.log('  ✓ Modèle de portfolio créé')
  } else {
    console.log('  → Modèle "template-1" existe déjà')
  }

  // ── 4. Compétences ────────────────────────────────────────────────────────
  const competencesData = [
    { nom: 'Vue.js',            type: 'TECHNIQUE',       categorie: 'Frontend',        niveau: 'AVANCE'        },
    { nom: 'Node.js',           type: 'TECHNIQUE',       categorie: 'Backend',         niveau: 'AVANCE'        },
    { nom: 'Python',            type: 'TECHNIQUE',       categorie: 'Programmation',   niveau: 'INTERMEDIAIRE' },
    { nom: 'Docker',            type: 'TECHNIQUE',       categorie: 'DevOps',          niveau: 'INTERMEDIAIRE' },
    { nom: 'SQL',               type: 'TECHNIQUE',       categorie: 'Base de données', niveau: 'AVANCE'        },
    { nom: 'Communication',     type: 'COMPORTEMENTALE', categorie: 'Soft Skills',     niveau: 'AVANCE'        },
    { nom: 'Leadership',        type: 'COMPORTEMENTALE', categorie: 'Soft Skills',     niveau: 'INTERMEDIAIRE' },
    { nom: 'Travail en équipe', type: 'COMPORTEMENTALE', categorie: 'Soft Skills',     niveau: 'AVANCE'        },
  ]

  for (const c of competencesData) {
    const competence = await prisma.competence.upsert({
      where: { nom: c.nom },
      update: {},
      create: { nom: c.nom, type: c.type, categorie: c.categorie }
    })
    await prisma.etudiantCompetence.upsert({
      where: {
        id_etudiant_id_competence: {
          id_etudiant: idEtudiant,
          id_competence: competence.id_competence
        }
      },
      update: {},
      create: {
        id_etudiant: idEtudiant,
        id_competence: competence.id_competence,
        niveau_maitrise: c.niveau
      }
    })
  }
  console.log('  ✓ Compétences créées')

  // ── 5. Technologies ────────────────────────────────────────────────────────
  const techData = [
    { nom: 'Vue.js',     categorie: 'Frontend'        },
    { nom: 'React',      categorie: 'Frontend'        },
    { nom: 'Node.js',    categorie: 'Backend'         },
    { nom: 'PostgreSQL', categorie: 'Base de données' },
    { nom: 'Docker',     categorie: 'DevOps'          },
    { nom: 'Python',     categorie: 'Programmation'   },
  ]
  const techs = {}
  for (const t of techData) {
    techs[t.nom] = await prisma.technologie.upsert({
      where: { nom: t.nom },
      update: {},
      create: { nom: t.nom, categorie: t.categorie }
    })
  }
  console.log('  ✓ Technologies créées')

  // ── 6. Stage validé ────────────────────────────────────────────────────────
  const existingStage = await prisma.stage.findFirst({
    where: { id_etudiant: idEtudiant }
  })

  if (!existingStage) {
    await prisma.stage.create({
      data: {
        entreprise: 'OCP Group',
        poste: 'Développeuse Full Stack',
        date_debut: new Date('2024-06-01'),
        date_fin: new Date('2024-08-31'),
        duree_semaines: 13,
        missions: "Développement d'une application de gestion RH\nIntégration d'APIs REST\nTests unitaires avec Jest",
        encadrant_academique: 'Pr. Fatima Zahra',
        encadrant_professionnel: 'M. Karim Idrissi',
        status_validation: 'VALIDE',
        est_public: true,
        id_etudiant: idEtudiant,
        technologies: {
          create: [
            { id_technologie: techs['Vue.js'].id_technologie    },
            { id_technologie: techs['Node.js'].id_technologie   },
            { id_technologie: techs['PostgreSQL'].id_technologie },
          ]
        }
      }
    })
    console.log('  ✓ Stage créé')
  }

  // ── 7. Projet validé ──────────────────────────────────────────────────────
  const existingProjet = await prisma.projet.findFirst({
    where: { participations: { some: { id_etudiant: idEtudiant } } }
  })

  if (!existingProjet) {
    await prisma.projet.create({
      data: {
        titre: 'Plateforme E-Learning',
        description: "Développement d'une plateforme d'apprentissage en ligne avec gestion des cours, quiz et suivi des progrès étudiant.",
        type_projet: 'PFA',
        date_debut: new Date('2024-01-15'),
        date_fin: new Date('2024-05-30'),
        lien_github: 'https://github.com/sara-benali/elearning-platform',
        status_validation: 'VALIDE',
        est_public: true,
        nombre_collaborateurs: 3,
        resultats_obtenus: 'Application déployée avec 500 utilisateurs actifs en phase beta. Note obtenue : 18/20.',
        technologies: {
          create: [
            { id_technologie: techs['React'].id_technologie      },
            { id_technologie: techs['Node.js'].id_technologie    },
            { id_technologie: techs['PostgreSQL'].id_technologie  },
            { id_technologie: techs['Docker'].id_technologie     },
          ]
        },
        participations: {
          create: {
            id_etudiant: idEtudiant,
            role_joue: 'Lead Frontend',
            date_debut: new Date('2024-01-15'),
            date_fin: new Date('2024-05-30'),
            est_createur: true,
            est_visible_portfolio: true
          }
        }
      }
    })
    console.log('  ✓ Projet créé')
  }

  // ── 8. Badges ─────────────────────────────────────────────────────────────
  const badgesData = [
    { nom: 'Hackathon Winner',        description: '1ère place au Hackathon ENSA 2024',           categorie: 'Compétition', icone: '🏆', condition_attribution: 'Gagner un hackathon officiel'        },
    { nom: 'Full Stack Developer',    description: 'Maîtrise complète frontend et backend',        categorie: 'Compétence',  icone: '💻', condition_attribution: 'Avoir des projets full stack validés' },
    { nom: 'Open Source Contributor', description: '50+ contributions sur des dépôts publics',     categorie: 'GitHub',      icone: '⭐', condition_attribution: '50 commits sur repos publics'          },
  ]

  for (const b of badgesData) {
    const badge = await prisma.badge.upsert({
      where: { nom: b.nom },
      update: {},
      create: b
    })
    await prisma.etudiantBadge.upsert({
      where: {
        id_etudiant_id_badge: { id_etudiant: idEtudiant, id_badge: badge.id_badge }
      },
      update: {},
      create: { id_etudiant: idEtudiant, id_badge: badge.id_badge }
    })
  }
  console.log('  ✓ Badges créés')

  // ── 9. Activité parascolaire ──────────────────────────────────────────────
  const existingActivite = await prisma.activiteParascolaire.findFirst({
    where: { id_etudiant: idEtudiant }
  })

  if (!existingActivite) {
    await prisma.activiteParascolaire.create({
      data: {
        type_activite: 'CLUB',
        nom_activite: 'Présidente Club Tech ENSA',
        organisation: 'ENSA Tanger',
        date_debut: new Date('2023-09-01'),
        date_fin: new Date('2024-06-30'),
        description: "Organisation d'ateliers de programmation et de hackathons pour 150+ étudiants.",
        role: 'Présidente',
        status_validation: 'VALIDE',
        est_public: true,
        id_etudiant: idEtudiant
      }
    })
    console.log('  ✓ Activité parascolaire créée')
  }

  // ── 10. Dépôts GitHub ─────────────────────────────────────────────────────
  const existingDepot = await prisma.depotGitHub.findFirst({
    where: { id_etudiant: idEtudiant }
  })

  if (!existingDepot) {
    await prisma.depotGitHub.createMany({
      data: [
        { id_etudiant: idEtudiant, nom_depot: 'elearning-platform',    url_github: 'https://github.com/sara-benali/elearning-platform', nombre_commits: 187, langage_principal: 'JavaScript', date_dernier_commit: new Date('2024-05-28'), date_synchronisation: new Date() },
        { id_etudiant: idEtudiant, nom_depot: 'ml-sentiment-analysis', url_github: 'https://github.com/sara-benali/ml-sentiment',        nombre_commits: 94,  langage_principal: 'Python',     date_dernier_commit: new Date('2024-03-15'), date_synchronisation: new Date() },
        { id_etudiant: idEtudiant, nom_depot: 'portfolio-app',         url_github: 'https://github.com/sara-benali/portfolio-app',       nombre_commits: 56,  langage_principal: 'Vue',        date_dernier_commit: new Date('2024-06-10'), date_synchronisation: new Date() },
      ]
    })
    console.log('  ✓ Dépôts GitHub créés')
  }

  // ── 11. Recommandation ────────────────────────────────────────────────────
  // L'auteur est l'étudiant1 du seed principal si il existe,
  // sinon on crée un professeur de test dédié.
  let auteur = await prisma.utilisateur.findUnique({
    where: { email: 'etudiant1@etu.uae.ac.ma' }
  })

  if (!auteur) {
    auteur = await prisma.utilisateur.findUnique({
      where: { email: 'prof.seed.test@uae.ac.ma' }
    })
    if (!auteur) {
      auteur = await prisma.utilisateur.create({
        data: {
          email: 'prof.seed.test@uae.ac.ma',
          mot_de_passe: passwordHash,
          nom: 'Bennani',
          prenom: 'Ahmed',
          role: 'PROFESSEUR',
          ecole: 'ENSATanger',
          status_compte: 'ACTIF',
          email_verifie: true,
          professeur: {
            create: { departement: 'Informatique', specialite: 'Génie Logiciel' }
          }
        }
      })
      console.log('  ✓ Professeur de test créé (auteur de la recommandation)')
    }
  }

  const existingRec = await prisma.recommandation.findFirst({
    where: { id_etudiant: idEtudiant }
  })

  if (!existingRec) {
    await prisma.recommandation.create({
      data: {
        id_etudiant: idEtudiant,
        id_recommandeur: auteur.id_utilisateur,
        message: "Sara est une développeuse exceptionnelle, rigoureuse et créative. Son travail a été remarquable par sa qualité technique et son implication.",
        status: 'VALIDE'
      }
    })
    console.log('  ✓ Recommandation créée')
  }

  // ── 12. Portfolio publié ──────────────────────────────────────────────────
  const existingPortfolio = await prisma.portfolio.findUnique({
    where: { url_publique: 'sara-benali' }
  })

  if (!existingPortfolio) {
    await prisma.portfolio.create({
      data: {
        id_etudiant: idEtudiant,
        id_modele: modele.id_modele,
        titre_personnalise: 'Portfolio de Sara Benali',
        url_publique: 'sara-benali',
        est_publie: true,
        nombre_vues: 58,
        date_publication: new Date()
      }
    })
    console.log('  ✓ Portfolio créé et publié')
  } else {
    console.log('  → Portfolio sara-benali existe déjà')
  }

  console.log('')
  console.log('Portfolio de test prêt !')
  console.log('URL  : http://localhost:5173/portfolio/sara-benali')
  console.log('Login: sara.benali@etu.uae.ac.ma / password123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
