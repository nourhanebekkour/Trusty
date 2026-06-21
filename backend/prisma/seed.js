import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // 1. Nettoyage de la base de données
  console.log('Nettoyage des données existantes...');
  await prisma.historiqueValidation.deleteMany();
  await prisma.lettreRecommandation.deleteMany();
  await prisma.activiteParascolaire.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.recommandation.deleteMany();
  await prisma.commentaire.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.etudiantCompetence.deleteMany();
  await prisma.etudiantBadge.deleteMany();
  await prisma.portfolio.deleteMany();
  await prisma.depotGitHub.deleteMany();
  await prisma.formation.deleteMany();
  await prisma.professionnel.deleteMany();
  await prisma.fichier.deleteMany();
  await prisma.modelePortfolio.deleteMany();
  await prisma.technologie.deleteMany();
  await prisma.competence.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.utilisateur.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123@', salt);

  const ecoles = ['ENSATanger', 'ENCGTanger', 'FSTTanger', 'FSJESTanger'];

  // ==========================================
  // 2. Création du SUPER_ADMIN et Fichiers génériques
  // ==========================================
  console.log('Création du super admin...');
  const superAdmin = await prisma.utilisateur.create({
    data: {
      email: 'superadmin@system.com',
      mot_de_passe: passwordHash,
      nom: 'Admin',
      prenom: 'Super',
      role: 'ADMINISTRATEUR',
      status_compte: 'ACTIF',
      email_verifie: true,
      administrateur: {
        create: {
          niveau_acces: 'SUPER_ADMIN'
        }
      }
    }
  });

  const dummyImage = await prisma.fichier.create({
    data: {
      nom_original: 'apercu.png',
      nom_stockage: faker.string.uuid() + '.png',
      categorie: 'IMAGE',
      chemin_minio: '/images/apercu.png',
      type_mime: 'image/png',
      taille_octets: 1024 * 200,
      id_uploader: superAdmin.id_utilisateur
    }
  });

  // ==========================================
  // 3. Référentiels (Compétences, Technologies, Badges, Modèles)
  // ==========================================
  console.log('Création des référentiels (Compétences, Techs, Badges, Modèles)...');
  const competences = await Promise.all([
    prisma.competence.create({ data: { nom: 'Développement Web', type: 'TECHNIQUE', categorie: 'Informatique' } }),
    prisma.competence.create({ data: { nom: 'Gestion de Projet', type: 'COMPORTEMENTALE', categorie: 'Management' } }),
    prisma.competence.create({ data: { nom: 'Machine Learning', type: 'TECHNIQUE', categorie: 'Data' } }),
    prisma.competence.create({ data: { nom: 'Communication', type: 'COMPORTEMENTALE', categorie: 'Soft Skills' } }),
    prisma.competence.create({ data: { nom: 'DevOps', type: 'TECHNIQUE', categorie: 'Informatique' } }),
    prisma.competence.create({ data: { nom: 'Design UI/UX', type: 'TECHNIQUE', categorie: 'Design' } }),
  ]);

  const technologies = await Promise.all([
    prisma.technologie.create({ data: { nom: 'React', categorie: 'Frontend' } }),
    prisma.technologie.create({ data: { nom: 'Node.js', categorie: 'Backend' } }),
    prisma.technologie.create({ data: { nom: 'PostgreSQL', categorie: 'Base de données' } }),
    prisma.technologie.create({ data: { nom: 'Python', categorie: 'Langage' } }),
    prisma.technologie.create({ data: { nom: 'Docker', categorie: 'DevOps' } }),
    prisma.technologie.create({ data: { nom: 'Figma', categorie: 'Design' } }),
  ]);

  const badges = await Promise.all([
    prisma.badge.create({ data: { nom: 'Top Contributor', description: 'Excellente contribution', categorie: 'Engagement', icone: 'star', condition_attribution: 'Avoir 5 projets valides' } }),
    prisma.badge.create({ data: { nom: 'Code Ninja', description: 'Expert en code', categorie: 'Technique', icone: 'code', condition_attribution: 'Maitriser 5 technos' } }),
    prisma.badge.create({ data: { nom: 'Leader', description: 'Capacité à diriger', categorie: 'Comportement', icone: 'users', condition_attribution: 'Chef de 3 projets' } }),
  ]);

  const modelePortfolio = await prisma.modelePortfolio.create({
    data: {
      nom: 'Modèle Moderne',
      slug: 'modele-moderne',
      id_apercu: dummyImage.id_fichier
    }
  });

  // ==========================================
  // 4. Création des autres utilisateurs de base (Admins, Profs, Pros)
  // ==========================================
  console.log('Création des professeurs...');
  const professeurs = [];
  for (let i = 0; i < 5; i++) {
    const p = await prisma.utilisateur.create({
      data: {
        email: `prof${i + 1}@uae.ac.ma`,
        mot_de_passe: passwordHash,
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        role: 'PROFESSEUR',
        ecole: 'ENSATanger', // Fixé pour être sûr que prof1 est de la même école que les VIPs
        status_compte: 'ACTIF',
        email_verifie: true,
        professeur: {
          create: {
            departement: 'Informatique',
            specialite: 'Génie Logiciel',
            filieres_interv: ['GINF', 'GTR']
          }
        }
      },
      include: { professeur: true }
    });
    professeurs.push(p);
  }

  console.log('Création des professionnels...');
  const professionnels = [];
  for (let i = 0; i < 5; i++) {
    // 2 pros validés, 3 pros en attente de validation (pour l'admin)
    const statusValidationPro = i < 2 ? 'VALIDE' : 'EN_ATTENTE';
    
    const pro = await prisma.utilisateur.create({
      data: {
        email: `pro${i + 1}@entreprise.com`,
        mot_de_passe: passwordHash,
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        role: 'PROFESSIONNEL',
        status_compte: i < 2 ? 'ACTIF' : 'INACTIF',
        email_verifie: true,
        professionnel: {
          create: {
            entreprise: faker.company.name(),
            poste: faker.person.jobTitle(),
            secteur_activite: 'IT',
            status_validation: statusValidationPro
          }
        }
      },
      include: { professionnel: true }
    });
    professionnels.push(pro);
  }

  // ==========================================
  // 5. Création d'étudiants simples (5)
  // ==========================================
  console.log('Création d\'étudiants simples...');
  for (let i = 0; i < 5; i++) {
    await prisma.utilisateur.create({
      data: {
        email: `etudiant${i + 1}@etu.uae.ac.ma`,
        mot_de_passe: passwordHash,
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        role: 'ETUDIANT',
        ecole: 'ENSATanger',
        status_compte: 'ACTIF',
        email_verifie: true,
        etudiant: {
          create: {
            numero_etudiant: faker.string.alphanumeric(8).toUpperCase(),
            filiere: 'GINF',
            annee: faker.number.int({ min: 1, max: 5 })
          }
        }
      }
    });
  }

  // ==========================================
  // 6. Création d'étudiants "VIP" avec Workflow de Validation très chargé
  // ==========================================
  console.log('Création d\'étudiants VIP complets avec WORKFLOW DE VALIDATION...');
  for (let i = 0; i < 3; i++) {
    const etu = await prisma.utilisateur.create({
      data: {
        email: `vip.student${i + 1}@etu.uae.ac.ma`,
        mot_de_passe: passwordHash,
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        telephone: faker.phone.number(),
        role: 'ETUDIANT',
        ecole: 'ENSATanger',
        status_compte: 'ACTIF',
        email_verifie: true,
        photo: faker.image.avatar(),
        etudiant: {
          create: {
            numero_etudiant: `VIP00${i + 1}`,
            filiere: 'GINF',
            annee: 5,
            biographie: faker.lorem.paragraphs(2),
            linkedin_url: 'https://linkedin.com/in/' + faker.internet.username(),
            github_username: 'mohamedamine465',
            site_web: faker.internet.url(),
            objectif_professionnel: 'Devenir Architecte Logiciel Senior',
            score_credibilite: faker.number.int({ min: 90, max: 100 }),
            niveau_credibilite: 'EXPERT'
          }
        }
      },
      include: { etudiant: true }
    });

    const etudiantId = etu.etudiant.id_etudiant;
    const uId = etu.id_utilisateur;

    // Ajouter des compétences (Toutes)
    await prisma.etudiantCompetence.createMany({
      data: competences.map(c => ({
        id_etudiant: etudiantId,
        id_competence: c.id_competence,
        niveau_maitrise: faker.helpers.arrayElement(['INTERMEDIAIRE', 'AVANCE', 'EXPERT'])
      }))
    });

    // Ajouter des badges (Tous)
    await prisma.etudiantBadge.createMany({
      data: badges.map(b => ({
        id_etudiant: etudiantId,
        id_badge: b.id_badge
      }))
    });

    // Formations
    await prisma.formation.createMany({
      data: [
        {
          diplome: 'Cycle Préparatoire',
          etablissement: 'ENSA Tanger',
          date_debut: new Date('2021-09-01'),
          date_fin: new Date('2023-06-30'),
          est_actuelle: false,
          id_etudiant: etudiantId,
          mention: 'Très Bien'
        },
        {
          diplome: 'Cycle d\'Ingénieur d\'État',
          etablissement: 'ENSA Tanger',
          date_debut: new Date('2023-09-01'),
          date_fin: new Date('2026-06-30'),
          est_actuelle: true,
          id_etudiant: etudiantId,
          mention: 'Très Bien'
        }
      ]
    });

    const projetsSelectionnesIds = [];

    // Ajouter Projets : 2 VALIDES, 2 EN_ATTENTE (pour prof1), 1 REJETE (pour prof1)
    const projetStatusList = ['VALIDE', 'VALIDE', 'EN_ATTENTE', 'EN_ATTENTE', 'REJETE'];
    for (let j = 0; j < 5; j++) {
      const pStatus = projetStatusList[j];
      
      // On affecte systématiquement les items à réviser/rejetés à prof1 pour que son dashboard soit rempli
      const selectedProf = (pStatus === 'EN_ATTENTE' || pStatus === 'REJETE') ? professeurs[0] : professeurs[1];
      
      const projet = await prisma.projet.create({
        data: {
          titre: faker.company.catchPhrase(),
          description: faker.lorem.paragraphs(2),
          type_projet: faker.helpers.arrayElement(['PFA', 'PFE', 'MODULE', 'PERSONNEL', 'HACKATHON']),
          date_debut: faker.date.past({ years: 2 }),
          date_fin: pStatus === 'VALIDE' ? faker.date.recent() : null,
          status_validation: pStatus,
          est_mis_en_avant: pStatus === 'VALIDE' && j === 0,
          lien_github: faker.internet.url(),
          id_validateur: selectedProf.id_utilisateur,
          commentaire_validation: pStatus === 'REJETE' ? 'Il manque le rapport écrit et le code source est incomplet.' : null,
          date_validation: pStatus !== 'EN_ATTENTE' ? new Date() : null,
          date_soumission: faker.date.recent({ days: 10 }),
          participations: {
            create: {
              id_etudiant: etudiantId,
              role_joue: 'Développeur Principal',
              date_debut: new Date('2025-01-01'),
              est_createur: true
            }
          },
          technologies: {
            create: faker.helpers.arrayElements(technologies, 2).map((tech, idx) => ({
              id_technologie: tech.id_technologie,
              niveau_utilisation: idx === 0 ? 'AVANCE' : 'EXPERT'
            }))
          }
        }
      });

      if (pStatus === 'VALIDE') {
        projetsSelectionnesIds.push(projet.id_projet);
      }

      // Ajouter Historique de Validation si pas en attente
      if (pStatus !== 'EN_ATTENTE') {
        await prisma.historiqueValidation.create({
          data: {
            type_entite: 'PROJET',
            id_entite: projet.id_projet,
            status_validation: pStatus,
            date_soumission: faker.date.past({ years: 1 }),
            date_decision: new Date(),
            commentaires: pStatus === 'REJETE' ? 'Refusé suite au plagiat' : 'Excellent travail',
            id_validateur: selectedProf.id_utilisateur
          }
        });
      }

      // Ajouter un Commentaire sur le projet si EN_ATTENTE pour montrer une discussion
      if (pStatus === 'EN_ATTENTE') {
        await prisma.commentaire.create({
          data: {
            id_auteur: selectedProf.id_utilisateur,
            id_etudiant_cible: etudiantId,
            id_projet_cible: projet.id_projet,
            type_cible: 'PROJET',
            contenu: "Pouvez-vous ajouter des précisions sur l'architecture backend utilisée ?",
            status: 'EN_ATTENTE'
          }
        });
      }
    }

    // Ajouter Stages : 2 VALIDES, 2 EN_ATTENTE (pour prof1), 1 REJETE (pour prof1)
    const stageStatusList = ['VALIDE', 'VALIDE', 'EN_ATTENTE', 'EN_ATTENTE', 'REJETE'];
    for (let j = 0; j < 5; j++) {
      const sStatus = stageStatusList[j];
      const stageRapportFile = await prisma.fichier.create({
        data: {
          nom_original: `rapport_stage_${j + 1}.pdf`,
          nom_stockage: faker.string.uuid() + '.pdf',
          categorie: 'DOCUMENT',
          chemin_minio: `/docs/rapport_stage_${j + 1}.pdf`,
          type_mime: 'application/pdf',
          taille_octets: faker.number.int({ min: 500000, max: 2000000 }),
          id_uploader: uId
        }
      });

      // Toujours affecter prof1 pour les statuts d'attente/rejet
      const selectedProf = (sStatus === 'EN_ATTENTE' || sStatus === 'REJETE') ? professeurs[0] : professeurs[2];

      const stage = await prisma.stage.create({
        data: {
          entreprise: faker.company.name(),
          poste: 'Stagiaire ' + faker.person.jobTitle(),
          date_debut: faker.date.past({ years: 2 }),
          date_fin: sStatus === 'VALIDE' ? faker.date.recent() : null,
          duree_semaines: faker.number.int({ min: 4, max: 24 }),
          missions: faker.lorem.paragraphs(2),
          encadrant_professionnel: faker.person.fullName(),
          status_validation: sStatus,
          id_etudiant: etudiantId,
          id_validateur: selectedProf.id_utilisateur,
          id_rapport: stageRapportFile.id_fichier,
          commentaire_validation: sStatus === 'REJETE' ? 'Le rapport de stage n\'est pas au bon format académique.' : null,
          date_soumission: faker.date.recent({ days: 10 }),
          technologies: {
            create: [
              { id_technologie: faker.helpers.arrayElement(technologies).id_technologie, niveau_utilisation: 'INTERMEDIAIRE' }
            ]
          }
        }
      });

      if (sStatus !== 'EN_ATTENTE') {
        await prisma.historiqueValidation.create({
          data: {
            type_entite: 'STAGE',
            id_entite: stage.id_stage,
            status_validation: sStatus,
            date_soumission: faker.date.past(),
            date_decision: new Date(),
            id_validateur: selectedProf.id_utilisateur
          }
        });
      }
    }

    // Ajouter Activités Parascolaires : 1 VALIDE, 2 EN_ATTENTE (pour Admin)
    const activiteStatusList = ['VALIDE', 'EN_ATTENTE', 'EN_ATTENTE'];
    for (let j = 0; j < 3; j++) {
      const aStatus = activiteStatusList[j];
      await prisma.activiteParascolaire.create({
        data: {
          type_activite: faker.helpers.arrayElement(['CLUB', 'EVENEMENT', 'HACKATHON']),
          nom_activite: faker.company.name() + ' Club',
          role: faker.person.jobTitle(),
          date_debut: faker.date.past({ years: 3 }),
          date_fin: aStatus === 'VALIDE' ? faker.date.recent() : null,
          description: faker.lorem.paragraph(),
          status_validation: aStatus,
          date_soumission: faker.date.recent({ days: 10 }),
          id_etudiant: etudiantId,
          id_validateur: superAdmin.id_utilisateur
        }
      });
    }

    // Lettres de Recommandation (Requêtes en attente = Notifications pour prof1)
    for (let j = 0; j < 3; j++) {
      // Simulation d'une demande de lettre à prof1
      await prisma.notification.create({
        data: {
          id_destinataire: professeurs[0].id_utilisateur,
          type_notification: "SUGGESTION",
          titre: "Nouvelle demande de lettre de recommandation",
          message: `L'étudiant(e) ${etu.prenom} ${etu.nom} vous a demandé une lettre de recommandation de type STAGE destinée à Google.\nDescription: Je souhaite postuler pour un stage d'été au sein de la Silicon Valley.`,
          date_creation: faker.date.recent()
        }
      });
    }

    // Recommandations directes (Validées ou en attente)
    for (let j = 0; j < 4; j++) {
      const rStatus = j < 2 ? 'VALIDE' : 'EN_ATTENTE';
      const recommandeur = rStatus === 'EN_ATTENTE' ? professeurs[0] : professionnels[0];
      await prisma.recommandation.create({
        data: {
          id_etudiant: etudiantId,
          id_recommandeur: recommandeur.id_utilisateur,
          message: rStatus === 'VALIDE' ? faker.lorem.paragraphs(2) : null,
          status: rStatus,
          date_validation: rStatus === 'VALIDE' ? faker.date.recent() : null
        }
      });
    }

    // Lettres de Recommandation existantes
    for (let j = 0; j < 2; j++) {
      const lettreRecFile = await prisma.fichier.create({
        data: {
          nom_original: `lettre_recommandation_${j + 1}.pdf`,
          nom_stockage: faker.string.uuid() + '.pdf',
          categorie: 'DOCUMENT',
          chemin_minio: `/docs/lettre_recommandation_${j + 1}.pdf`,
          type_mime: 'application/pdf',
          taille_octets: faker.number.int({ min: 100000, max: 500000 }),
          id_uploader: uId
        }
      });

      await prisma.lettreRecommandation.create({
        data: {
          id_etudiant: etudiantId,
          id_redacteur: professeurs[1].id_utilisateur,
          type_lettre: faker.helpers.arrayElement(['STAGE', 'PFE', 'EMPLOI', 'DOUBLE_DIPLOME']),
          destinataire: 'À qui de droit',
          description: faker.lorem.paragraph(),
          date_validation: faker.date.recent(), 
          id_fichier_pdf: lettreRecFile.id_fichier
        }
      });
    }

    // Dépôts GitHub
    for (let j = 0; j < 4; j++) {
      await prisma.depotGitHub.create({
        data: {
          id_etudiant: etudiantId,
          nom_depot: faker.word.noun() + '-' + faker.word.adjective(),
          url_github: 'https://github.com/' + faker.internet.username() + '/' + faker.word.noun(),
          description_github: faker.lorem.sentence(),
          langage_principal: faker.helpers.arrayElement(['TypeScript', 'JavaScript', 'Python', 'Java']),
          nombre_commits: faker.number.int({ min: 10, max: 1500 }),
          date_dernier_commit: faker.date.recent()
        }
      });
    }

    // Notifications Générales pour l'étudiant
    for (let j = 0; j < 5; j++) {
      await prisma.notification.create({
        data: {
          id_destinataire: uId,
          type_notification: faker.helpers.arrayElement(['VALIDATION', 'COMMENTAIRE', 'RECOMMANDATION']),
          titre: faker.lorem.words(3),
          message: faker.lorem.sentence(),
          est_lue: faker.datatype.boolean(),
          date_creation: faker.date.recent()
        }
      });
    }

    // Portfolio Unifié (avec uniquement les projets valides)
    await prisma.portfolio.create({
      data: {
        id_etudiant: etudiantId,
        id_modele: modelePortfolio.id_modele,
        titre_personnalise: 'Portfolio de ' + etu.prenom,
        sous_titre: 'Développeur Fullstack Expert',
        url_publique: `portfolio-${etu.prenom.toLowerCase()}-${etu.nom.toLowerCase()}-${faker.string.alphanumeric(4)}`,
        est_publie: true,
        date_publication: new Date(),
        projets_selectionnes: projetsSelectionnesIds,
        couleur_accent: faker.color.rgb()
      }
    });
  }

  console.log('Seeding terminé avec succès !');
  console.log('\\n=== COMPTES DE TEST (Mot de passe: password123) ===');
  console.log('- Super Admin : superadmin@system.com');
  console.log('- Etudiants VIP : vip.student1@etu.uae.ac.ma (jusqu\'à 3)');
  console.log('- Etudiants : etudiant1@etu.uae.ac.ma (jusqu\'à 5)');
  console.log('- Professeurs : prof1@uae.ac.ma (jusqu\'à 5)');
  console.log('- Professionnels : pro1@entreprise.com (jusqu\'à 5)');
  console.log('===================================================\\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
