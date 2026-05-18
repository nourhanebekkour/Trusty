import { PrismaClient, Role, StatusUtilisateur, Niveau, VisibiliteProfil, TypeProjet, TypeActivite, NiveauAcces, Departement } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Création de l'Administrateur
  const adminUser = await prisma.utilisateur.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      mot_de_passe: passwordHash,
      nom: 'Admin',
      prenom: 'System',
      role: Role.ADMINISTRATEUR,
      status_compte: StatusUtilisateur.ACTIF,
      email_verifie: true,
      administrateur: {
        create: {
          niveau_acces: NiveauAcces.SUPER_ADMIN,
        },
      },
    },
  });
  console.log('Admin créé');

  // 2. Création du Professeur
  const profUser = await prisma.utilisateur.upsert({
    where: { email: 'prof@test.com' },
    update: {},
    create: {
      email: 'prof@test.com',
      mot_de_passe: passwordHash,
      nom: 'Zahidi',
      prenom: 'Mohammed',
      role: Role.PROFESSEUR,
      status_compte: StatusUtilisateur.ACTIF,
      email_verifie: true,
      professeur: {
        create: {
          departement: Departement.SIC,
          specialite: 'Génie Logiciel',
        },
      },
    },
  });
  console.log('Professeur créé');

  // 3. Création de l'Étudiant
  const etudiantUser = await prisma.utilisateur.upsert({
    where: { email: 'etudiant@test.com' },
    update: {},
    create: {
      email: 'etudiant@test.com',
      mot_de_passe: passwordHash,
      nom: 'Ghailani',
      prenom: 'Amine',
      role: Role.ETUDIANT,
      status_compte: StatusUtilisateur.ACTIF,
      email_verifie: true,
      etudiant: {
        create: {
          numero_etudiant: '2026001',
          filiere: 'GINF',
          annee: 4,
          ville: 'Casablanca',
          biographie: 'Étudiant passionné par le développement fullstack.',
          linkedin_url: 'https://linkedin.com/in/amine-ghailani',
          github_username: 'aminegh',
          visibilite_profil: VisibiliteProfil.PUBLIC,
        },
      },
    },
  });
  console.log('Étudiant créé');

  const idEtudiant = etudiantUser.id_utilisateur;
  const idProf = profUser.id_utilisateur;

  // 4. Technologies
  const techReact = await prisma.technologie.upsert({
    where: { nom: 'React' },
    update: {},
    create: { nom: 'React', categorie: 'Frontend', description: 'Bibliothèque UI' },
  });

  const techNode = await prisma.technologie.upsert({
    where: { nom: 'Node.js' },
    update: {},
    create: { nom: 'Node.js', categorie: 'Backend', description: 'Runtime JavaScript' },
  });

  const techPrisma = await prisma.technologie.upsert({
    where: { nom: 'Prisma' },
    update: {},
    create: { nom: 'Prisma', categorie: 'ORM', description: 'Database Toolkit' },
  });
  console.log('Technologies créées');

  // 5. Projet
  const projet = await prisma.projet.create({
    data: {
      titre: 'E-Portfolio EMSI',
      description: 'Développement d\'une plateforme de e-portfolio pour les étudiants.',
      type_projet: TypeProjet.PFE,
      date_debut: new Date('2026-01-01'),
      status_validation: 'VALIDE',
      date_validation: new Date(),
      id_validateur: idProf,
      participations: {
        create: {
          id_etudiant: idEtudiant,
          role_joue: 'Lead Developer',
          est_createur: true,
          date_debut: new Date('2026-01-01'),
        },
      },
      technologies: {
        create: [
          { id_technologie: techReact.id_technologie, niveau_utilisation: Niveau.AVANCE },
          { id_technologie: techNode.id_technologie, niveau_utilisation: Niveau.INTERMEDIAIRE },
          { id_technologie: techPrisma.id_technologie, niveau_utilisation: Niveau.AVANCE },
        ],
      },
    },
  });
  console.log('Projet créé');

  // 6. Stage
  const stage = await prisma.stage.create({
    data: {
      entreprise: 'Capgemini',
      poste: 'Stagiaire Développeur Java/Angular',
      date_debut: new Date('2025-06-01'),
      date_fin: new Date('2025-08-31'),
      missions: 'Conception et développement d\'un module de gestion RH.',
      status_validation: 'VALIDE',
      id_etudiant: idEtudiant,
      id_validateur: idProf,
      technologies: {
        create: [
          { id_technologie: techNode.id_technologie, niveau_utilisation: Niveau.DEBUTANT },
        ],
      },
    },
  });
  console.log('Stage créé');

  // 7. Formation
  await prisma.formation.create({
    data: {
      diplome: 'Ingénierie Informatique et Réseaux',
      etablissement: 'EMSI Casablanca',
      date_debut: new Date('2022-09-01'),
      id_etudiant: idEtudiant,
      mention: 'Bien',
    },
  });
  console.log('Formation créée');

  // 8. Activité Parascolaire
  await prisma.activiteParascolaire.create({
    data: {
      nom_activite: 'EMSI IT Club',
      type_activite: TypeActivite.CLUB,
      organisation: 'EMSI',
      date_debut: new Date('2023-10-01'),
      description: 'Membre actif du club informatique, organisation de workshops.',
      id_etudiant: idEtudiant,
      role: 'Responsable Technique',
    },
  });
  console.log('Activité parascolaire créée');

  console.log('Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
