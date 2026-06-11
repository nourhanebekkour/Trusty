import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

  // Nettoyage de la base de données (Optionnel, à commenter si vous voulez garder les données)
  // await prisma.utilisateur.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Écoles utilisées pour le seed
  const ecole1 = 'ENSATanger';
  const ecole2 = 'ENCGTanger';

  // ==========================================
  // 2. Création des ÉTUDIANTS (2)
  // ==========================================
  console.log('Création des étudiants...');
  const etudiant1 = await prisma.utilisateur.create({
    data: {
      email: 'etudiant1@etu.uae.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Dupont',
      prenom: 'Jean',
      role: 'ETUDIANT',
      ecole: ecole1,
      status_compte: 'ACTIF',
      email_verifie: true,
      etudiant: {
        create: {
          numero_etudiant: 'E10001',
          filiere: 'GINF',
          annee: 3
        }
      }
    }
  });

  const etudiant2 = await prisma.utilisateur.create({
    data: {
      email: 'etudiant2@etu.uae.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Martin',
      prenom: 'Sophie',
      role: 'ETUDIANT',
      ecole: ecole2,
      status_compte: 'ACTIF',
      email_verifie: true,
      etudiant: {
        create: {
          numero_etudiant: 'E20002',
          filiere: 'CSI', // Imaginons une filière pour ENCG ou changeons selon schema.prisma
          annee: 2
        }
      }
    }
  });

  // ==========================================
  // 3. Création des PROFESSEURS (2) - Même école que les étudiants
  // ==========================================
  console.log('Création des professeurs...');
  await prisma.utilisateur.create({
    data: {
      email: 'prof1@uae.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Alami',
      prenom: 'Ahmed',
      role: 'PROFESSEUR',
      ecole: ecole1, // Même école que etudiant1
      status_compte: 'ACTIF',
      email_verifie: true,
      professeur: {
        create: {
          departement: 'SIC',
          specialite: 'Génie Informatique',
          filieres_interv: ['GINF', 'GSR']
        }
      }
    }
  });

  await prisma.utilisateur.create({
    data: {
      email: 'prof2@uae.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Bennani',
      prenom: 'Karim',
      role: 'PROFESSEUR',
      ecole: ecole2, // Même école que etudiant2
      status_compte: 'ACTIF',
      email_verifie: true,
      professeur: {
        create: {
          departement: 'MI',
          specialite: 'Management',
          filieres_interv: ['CSI']
        }
      }
    }
  });

  // ==========================================
  // 4. Création du SUPER_ADMIN (1)
  // ==========================================
  console.log('Création du super admin...');
  await prisma.utilisateur.create({
    data: {
      email: 'superadmin@system.com',
      mot_de_passe: passwordHash,
      nom: 'Admin',
      prenom: 'Super',
      role: 'ADMINISTRATEUR', // On lui assigne une école par défaut ou null si permis (enum Ecole non nullable dans le schema pour Utilisateur?)
      status_compte: 'ACTIF',
      email_verifie: true,
      administrateur: {
        create: {
          niveau_acces: 'SUPER_ADMIN'
        }
      }
    }
  });

  // ==========================================
  // 5. Création des ADMINS (2) - Un pour chaque école
  // ==========================================
  console.log('Création des admins...');
  await prisma.utilisateur.create({
    data: {
      email: 'admin1@ensat.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Ibrahimi',
      prenom: 'Sara',
      role: 'ADMINISTRATEUR',
      ecole: ecole1, // Même école que etudiant1 et prof1
      status_compte: 'ACTIF',
      email_verifie: true,
      administrateur: {
        create: {
          niveau_acces: 'ADMIN'
        }
      }
    }
  });

  await prisma.utilisateur.create({
    data: {
      email: 'admin2@encgt.ac.ma',
      mot_de_passe: passwordHash,
      nom: 'Tazi',
      prenom: 'Yassine',
      role: 'ADMINISTRATEUR',
      ecole: ecole2, // Même école que etudiant2 et prof2
      status_compte: 'ACTIF',
      email_verifie: true,
      administrateur: {
        create: {
          niveau_acces: 'ADMIN'
        }
      }
    }
  });

  // ==========================================
  // 6. Création des PROFESSIONNELS (2)
  // ==========================================
  console.log('Création des professionnels...');
  await prisma.utilisateur.create({
    data: {
      email: 'pro1@google.com',
      mot_de_passe: passwordHash,
      nom: 'Brin',
      prenom: 'Sergey',
      role: 'PROFESSIONNEL',
      status_compte: 'ACTIF',
      email_verifie: true,
      professionnel: {
        create: {
          entreprise: 'Google',
          poste: 'Software Engineer',
          secteur_activite: 'Technologie',
          status_validation: 'VALIDE'
        }
      }
    }
  });

  await prisma.utilisateur.create({
    data: {
      email: 'pro2@microsoft.com',
      mot_de_passe: passwordHash,
      nom: 'Nadella',
      prenom: 'Satya',
      role: 'PROFESSIONNEL',
      status_compte: 'ACTIF',
      email_verifie: true,
      professionnel: {
        create: {
          entreprise: 'Microsoft',
          poste: 'CEO',
          secteur_activite: 'Technologie',
          status_validation: 'VALIDE'
        }
      }
    }
  });

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
