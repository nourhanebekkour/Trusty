-- CreateEnum
CREATE TYPE "StatusValidation" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE');

-- CreateEnum
CREATE TYPE "Niveau" AS ENUM ('DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT');

-- CreateEnum
CREATE TYPE "StatusUtilisateur" AS ENUM ('INACTIF', 'ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "NiveauAcces" AS ENUM ('SUPER_ADMIN', 'ADMIN');

-- CreateEnum
CREATE TYPE "Filiere" AS ENUM ('GINF', 'GSEA', 'GSR', 'GIND', 'G2EI', 'CSI');

-- CreateEnum
CREATE TYPE "Departement" AS ENUM ('SIC', 'GEI', 'MI', 'LCM');

-- CreateEnum
CREATE TYPE "TypeProjet" AS ENUM ('MODULE', 'INTEGRATION', 'PFA', 'PFE', 'STAGE', 'PERSONNEL', 'HACKATHON', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeCompetence" AS ENUM ('TECHNIQUE', 'COMPORTEMENTALE');

-- CreateEnum
CREATE TYPE "TypeEntite" AS ENUM ('PROJET', 'STAGE', 'ACTIVITE', 'RECOMMANDATION', 'COMMENTAIRE');

-- CreateEnum
CREATE TYPE "TypeCible" AS ENUM ('PROJET', 'COMPETENCE', 'PROFIL');

-- CreateEnum
CREATE TYPE "TypeLettre" AS ENUM ('DOUBLE_DIPLOME', 'STAGE', 'PFE', 'MASTER', 'EMPLOI', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('VALIDATION', 'COMMENTAIRE', 'RECOMMANDATION', 'ATTESTATION', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "TypeAction" AS ENUM ('CREATION', 'MODIFICATION', 'SUPPRESSION', 'VALIDATION');

-- CreateEnum
CREATE TYPE "VisibiliteProfil" AS ENUM ('PUBLIC', 'PRIVE', 'ENSEIGNANTS_UNIQUEMENT', 'LIEN_PARTAGE');

-- CreateEnum
CREATE TYPE "TypeActivite" AS ENUM ('CLUB', 'EVENEMENT', 'HACKATHON', 'COMPETITION', 'ENGAGEMENT');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id_utilisateur" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "telephone" VARCHAR(20),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "derniere_connexion" TIMESTAMP(3),
    "status_compte" "StatusUtilisateur" NOT NULL DEFAULT 'INACTIF',
    "email_verifie" BOOLEAN NOT NULL DEFAULT false,
    "token_reinitialisation" VARCHAR(255),
    "date_expiration_token" TIMESTAMP(3),

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "administrateurs" (
    "id_administrateur" TEXT NOT NULL,
    "niveau_acces" "NiveauAcces" NOT NULL DEFAULT 'ADMIN',
    "derniere_action" TIMESTAMP(3),

    CONSTRAINT "administrateurs_pkey" PRIMARY KEY ("id_administrateur")
);

-- CreateTable
CREATE TABLE "etudiants" (
    "id_etudiant" TEXT NOT NULL,
    "numero_etudiant" VARCHAR(20) NOT NULL,
    "filiere" VARCHAR(100) NOT NULL,
    "annee" INTEGER NOT NULL,
    "date_naissance" TIMESTAMP(3),
    "adresse" VARCHAR(255),
    "ville" VARCHAR(100),
    "pays" VARCHAR(100) DEFAULT 'Maroc',
    "biographie" TEXT,
    "linkedin_url" VARCHAR(500),
    "github_username" VARCHAR(100),
    "site_web" VARCHAR(500),
    "objectif_professionnel" VARCHAR(100),
    "score_credibilite" INTEGER NOT NULL DEFAULT 0,
    "niveau_credibilite" "Niveau" NOT NULL DEFAULT 'DEBUTANT',
    "visibilite_profil" "VisibiliteProfil" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "etudiants_pkey" PRIMARY KEY ("id_etudiant")
);

-- CreateTable
CREATE TABLE "professeurs" (
    "id_professeur" TEXT NOT NULL,
    "departement" "Departement" NOT NULL,
    "specialite" VARCHAR(100) NOT NULL,
    "filieres_interv" "Filiere"[],
    "date_naissance" TIMESTAMP(3),
    "adresse" VARCHAR(255),
    "ville" VARCHAR(100),
    "pays" VARCHAR(100),
    "biographie" TEXT,

    CONSTRAINT "professeurs_pkey" PRIMARY KEY ("id_professeur")
);

-- CreateTable
CREATE TABLE "professionnels" (
    "id_professionnel" TEXT NOT NULL,
    "entreprise" VARCHAR(200) NOT NULL,
    "poste" VARCHAR(100) NOT NULL,
    "secteur_activite" VARCHAR(100),
    "email_professionnel" VARCHAR(255) NOT NULL,
    "status_validation" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_demande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "id_validateur" TEXT,
    "id_justificatif" TEXT,

    CONSTRAINT "professionnels_pkey" PRIMARY KEY ("id_professionnel")
);

-- CreateTable
CREATE TABLE "projets" (
    "id_projet" TEXT NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "type_projet" "TypeProjet" NOT NULL DEFAULT 'AUTRE',
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "lien_github" VARCHAR(500),
    "lien_youtube" VARCHAR(500),
    "lien_demo" VARCHAR(500),
    "resultats_obtenus" TEXT,
    "nombre_collaborateurs" INTEGER NOT NULL DEFAULT 1,
    "status_validation" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_soumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "commentaire_validation" TEXT,
    "appreciation" VARCHAR(50),
    "est_mis_en_avant" BOOLEAN NOT NULL DEFAULT false,
    "est_public" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "id_validateur" TEXT,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id_projet")
);

-- CreateTable
CREATE TABLE "participations_projets" (
    "id_projet" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "est_visible_portfolio" BOOLEAN NOT NULL DEFAULT true,
    "role_joue" VARCHAR(100) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "est_createur" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "participations_projets_pkey" PRIMARY KEY ("id_projet","id_etudiant")
);

-- CreateTable
CREATE TABLE "stages" (
    "id_stage" TEXT NOT NULL,
    "entreprise" VARCHAR(200) NOT NULL,
    "adresse_entreprise" VARCHAR(255),
    "poste" VARCHAR(100) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "duree_semaines" INTEGER,
    "missions" TEXT NOT NULL,
    "encadrant_professionnel" VARCHAR(200),
    "encadrant_academique" VARCHAR(100),
    "status_validation" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_soumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "commentaire_validation" TEXT,
    "est_public" BOOLEAN NOT NULL DEFAULT true,
    "id_etudiant" TEXT NOT NULL,
    "id_validateur" TEXT,
    "id_rapport" TEXT,

    CONSTRAINT "stages_pkey" PRIMARY KEY ("id_stage")
);

-- CreateTable
CREATE TABLE "activites_parascolaires" (
    "id_activite" TEXT NOT NULL,
    "type_activite" "TypeActivite" NOT NULL,
    "nom_activite" VARCHAR(200) NOT NULL,
    "organisation" VARCHAR(200),
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "description" TEXT,
    "role" VARCHAR(100),
    "status_validation" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_soumission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "commentaire_validation" TEXT,
    "est_public" BOOLEAN NOT NULL DEFAULT true,
    "id_etudiant" TEXT NOT NULL,
    "id_validateur" TEXT,
    "id_attestation" TEXT,

    CONSTRAINT "activites_parascolaires_pkey" PRIMARY KEY ("id_activite")
);

-- CreateTable
CREATE TABLE "formations" (
    "id_formation" TEXT NOT NULL,
    "diplome" VARCHAR(200) NOT NULL,
    "etablissement" VARCHAR(200) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "description" TEXT,
    "mention" VARCHAR(50),
    "est_actuelle" BOOLEAN NOT NULL DEFAULT false,
    "id_etudiant" TEXT NOT NULL,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id_formation")
);

-- CreateTable
CREATE TABLE "competences" (
    "id_competence" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "type" "TypeCompetence" NOT NULL,
    "categorie" VARCHAR(100),
    "description" TEXT,
    "icone" VARCHAR(500),

    CONSTRAINT "competences_pkey" PRIMARY KEY ("id_competence")
);

-- CreateTable
CREATE TABLE "etudiants_competences" (
    "id_etudiant" TEXT NOT NULL,
    "id_competence" TEXT NOT NULL,
    "niveau_maitrise" INTEGER NOT NULL DEFAULT 0,
    "date_ajout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etudiants_competences_pkey" PRIMARY KEY ("id_etudiant","id_competence")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id_technologie" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "categorie" VARCHAR(50) NOT NULL,
    "sous_categorie" VARCHAR(50),
    "description" TEXT,
    "icone" VARCHAR(500),

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id_technologie")
);

-- CreateTable
CREATE TABLE "projets_technologies" (
    "id_projet" TEXT NOT NULL,
    "id_technologie" TEXT NOT NULL,
    "version" VARCHAR(50),
    "niveau_utilisation" "Niveau" NOT NULL DEFAULT 'DEBUTANT',

    CONSTRAINT "projets_technologies_pkey" PRIMARY KEY ("id_projet","id_technologie")
);

-- CreateTable
CREATE TABLE "stages_technologies" (
    "id_stage" TEXT NOT NULL,
    "id_technologie" TEXT NOT NULL,
    "version" VARCHAR(50),
    "niveau_utilisation" "Niveau" NOT NULL DEFAULT 'DEBUTANT',

    CONSTRAINT "stages_technologies_pkey" PRIMARY KEY ("id_stage","id_technologie")
);

-- CreateTable
CREATE TABLE "historiques_validations" (
    "id_validation" TEXT NOT NULL,
    "type_entite" "TypeEntite" NOT NULL,
    "id_entite" TEXT NOT NULL,
    "status_validation" "StatusValidation" NOT NULL,
    "date_soumission" TIMESTAMP(3) NOT NULL,
    "date_decision" TIMESTAMP(3),
    "commentaires" TEXT,
    "appreciation" VARCHAR(50),
    "id_validateur" TEXT NOT NULL,

    CONSTRAINT "historiques_validations_pkey" PRIMARY KEY ("id_validation")
);

-- CreateTable
CREATE TABLE "fichiers" (
    "id_fichier" TEXT NOT NULL,
    "nom_original" VARCHAR(255) NOT NULL,
    "nom_stockage" VARCHAR(255) NOT NULL,
    "categorie" VARCHAR(20) NOT NULL,
    "chemin_minio" VARCHAR(500) NOT NULL,
    "type_mime" VARCHAR(100) NOT NULL,
    "taille_octets" INTEGER NOT NULL,
    "date_upload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_projet" TEXT,
    "id_uploader" TEXT NOT NULL,

    CONSTRAINT "fichiers_pkey" PRIMARY KEY ("id_fichier")
);

-- CreateTable
CREATE TABLE "lettres_recommandation" (
    "id_lettre" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "id_redacteur" TEXT NOT NULL,
    "type_lettre" "TypeLettre" NOT NULL,
    "destinataire" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "date_redaction" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),
    "id_fichier_pdf" TEXT NOT NULL,

    CONSTRAINT "lettres_recommandation_pkey" PRIMARY KEY ("id_lettre")
);

-- CreateTable
CREATE TABLE "commentaires" (
    "id_commentaire" TEXT NOT NULL,
    "id_auteur" TEXT NOT NULL,
    "id_etudiant_cible" TEXT NOT NULL,
    "id_projet_cible" TEXT,
    "id_competence_cible" TEXT,
    "type_cible" "TypeCible" NOT NULL,
    "contenu" TEXT NOT NULL,
    "status" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "commentaires_pkey" PRIMARY KEY ("id_commentaire")
);

-- CreateTable
CREATE TABLE "recommandations" (
    "id_recommandation" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "id_recommandeur" TEXT NOT NULL,
    "message" TEXT,
    "status" "StatusValidation" NOT NULL DEFAULT 'EN_ATTENTE',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_validation" TIMESTAMP(3),

    CONSTRAINT "recommandations_pkey" PRIMARY KEY ("id_recommandation")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id_portfolio" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "id_modele" TEXT,
    "titre_personnalise" VARCHAR(200),
    "sous_titre" VARCHAR(255),
    "url_publique" VARCHAR(255),
    "nombre_vues" INTEGER NOT NULL DEFAULT 0,
    "nombre_recommandations" INTEGER NOT NULL DEFAULT 0,
    "est_publie" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_derniere_maj" TIMESTAMP(3),
    "date_publication" TIMESTAMP(3),

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id_portfolio")
);

-- CreateTable
CREATE TABLE "consultations" (
    "id_consultation" TEXT NOT NULL,
    "id_portfolio" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "date_consultation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultations_pkey" PRIMARY KEY ("id_consultation")
);

-- CreateTable
CREATE TABLE "modeles_portfolios" (
    "id_modele" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "categorie" VARCHAR(50) NOT NULL,
    "fichier_css" VARCHAR(500) NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_admin_createur" TEXT NOT NULL,
    "id_apercu" TEXT NOT NULL,

    CONSTRAINT "modeles_portfolios_pkey" PRIMARY KEY ("id_modele")
);

-- CreateTable
CREATE TABLE "badges" (
    "id_badge" TEXT NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "categorie" VARCHAR(50) NOT NULL,
    "icone" VARCHAR(500) NOT NULL,
    "condition_attribution" TEXT NOT NULL,
    "est_actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id_badge")
);

-- CreateTable
CREATE TABLE "etudiants_badges" (
    "id_etudiant" TEXT NOT NULL,
    "id_badge" TEXT NOT NULL,
    "date_attribution" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etudiants_badges_pkey" PRIMARY KEY ("id_etudiant","id_badge")
);

-- CreateTable
CREATE TABLE "depots_github" (
    "id_depot" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "nom_depot" VARCHAR(200) NOT NULL,
    "url_github" VARCHAR(500) NOT NULL,
    "description_github" TEXT,
    "nombre_commits" INTEGER,
    "langage_principal" VARCHAR(50),
    "date_dernier_commit" TIMESTAMP(3),
    "date_synchronisation" TIMESTAMP(3),

    CONSTRAINT "depots_github_pkey" PRIMARY KEY ("id_depot")
);

-- CreateTable
CREATE TABLE "suggestions_systeme" (
    "id_suggestion" TEXT NOT NULL,
    "id_etudiant" TEXT NOT NULL,
    "type_suggestion" VARCHAR(50) NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "element_suggere" VARCHAR(200),
    "priorite" VARCHAR(20) NOT NULL,
    "justification_ia" TEXT,
    "est_lue" BOOLEAN NOT NULL DEFAULT false,
    "date_generation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_lecture" TIMESTAMP(3),

    CONSTRAINT "suggestions_systeme_pkey" PRIMARY KEY ("id_suggestion")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" TEXT NOT NULL,
    "id_destinataire" TEXT NOT NULL,
    "type_notification" "TypeNotification" NOT NULL,
    "titre" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "lien_action" VARCHAR(500),
    "est_lue" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_lecture" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "historiques_connexions" (
    "id_historique" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "date_connexion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL,
    "raison_echec" VARCHAR(100),
    "ip_adresse" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "historiques_connexions_pkey" PRIMARY KEY ("id_historique")
);

-- CreateTable
CREATE TABLE "historiques_actions" (
    "id_historique" TEXT NOT NULL,
    "id_utilisateur" TEXT NOT NULL,
    "type_action" "TypeAction" NOT NULL,
    "entite_concernee" VARCHAR(50) NOT NULL,
    "id_entite" TEXT NOT NULL,
    "details" TEXT,
    "date_action" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historiques_actions_pkey" PRIMARY KEY ("id_historique")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "etudiants_numero_etudiant_key" ON "etudiants"("numero_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "professionnels_id_justificatif_key" ON "professionnels"("id_justificatif");

-- CreateIndex
CREATE UNIQUE INDEX "stages_id_rapport_key" ON "stages"("id_rapport");

-- CreateIndex
CREATE UNIQUE INDEX "activites_parascolaires_id_attestation_key" ON "activites_parascolaires"("id_attestation");

-- CreateIndex
CREATE UNIQUE INDEX "formations_id_etudiant_etablissement_diplome_date_debut_key" ON "formations"("id_etudiant", "etablissement", "diplome", "date_debut");

-- CreateIndex
CREATE UNIQUE INDEX "competences_nom_key" ON "competences"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_nom_key" ON "technologies"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "fichiers_nom_stockage_key" ON "fichiers"("nom_stockage");

-- CreateIndex
CREATE UNIQUE INDEX "lettres_recommandation_id_fichier_pdf_key" ON "lettres_recommandation"("id_fichier_pdf");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_id_etudiant_key" ON "portfolios"("id_etudiant");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_url_publique_key" ON "portfolios"("url_publique");

-- CreateIndex
CREATE UNIQUE INDEX "modeles_portfolios_id_apercu_key" ON "modeles_portfolios"("id_apercu");

-- CreateIndex
CREATE UNIQUE INDEX "badges_nom_key" ON "badges"("nom");

-- AddForeignKey
ALTER TABLE "administrateurs" ADD CONSTRAINT "administrateurs_id_administrateur_fkey" FOREIGN KEY ("id_administrateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants" ADD CONSTRAINT "etudiants_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professeurs" ADD CONSTRAINT "professeurs_id_professeur_fkey" FOREIGN KEY ("id_professeur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_id_professionnel_fkey" FOREIGN KEY ("id_professionnel") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_id_justificatif_fkey" FOREIGN KEY ("id_justificatif") REFERENCES "fichiers"("id_fichier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnels" ADD CONSTRAINT "professionnels_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "professeurs"("id_professeur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations_projets" ADD CONSTRAINT "participations_projets_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_projet") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations_projets" ADD CONSTRAINT "participations_projets_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "professeurs"("id_professeur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages" ADD CONSTRAINT "stages_id_rapport_fkey" FOREIGN KEY ("id_rapport") REFERENCES "fichiers"("id_fichier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "professeurs"("id_professeur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_attestation_fkey" FOREIGN KEY ("id_attestation") REFERENCES "fichiers"("id_fichier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants_competences" ADD CONSTRAINT "etudiants_competences_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants_competences" ADD CONSTRAINT "etudiants_competences_id_competence_fkey" FOREIGN KEY ("id_competence") REFERENCES "competences"("id_competence") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_technologies" ADD CONSTRAINT "projets_technologies_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_projet") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets_technologies" ADD CONSTRAINT "projets_technologies_id_technologie_fkey" FOREIGN KEY ("id_technologie") REFERENCES "technologies"("id_technologie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages_technologies" ADD CONSTRAINT "stages_technologies_id_stage_fkey" FOREIGN KEY ("id_stage") REFERENCES "stages"("id_stage") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stages_technologies" ADD CONSTRAINT "stages_technologies_id_technologie_fkey" FOREIGN KEY ("id_technologie") REFERENCES "technologies"("id_technologie") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiques_validations" ADD CONSTRAINT "historiques_validations_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichiers" ADD CONSTRAINT "fichiers_id_projet_fkey" FOREIGN KEY ("id_projet") REFERENCES "projets"("id_projet") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fichiers" ADD CONSTRAINT "fichiers_id_uploader_fkey" FOREIGN KEY ("id_uploader") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_redacteur_fkey" FOREIGN KEY ("id_redacteur") REFERENCES "professeurs"("id_professeur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lettres_recommandation" ADD CONSTRAINT "lettres_recommandation_id_fichier_pdf_fkey" FOREIGN KEY ("id_fichier_pdf") REFERENCES "fichiers"("id_fichier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_auteur_fkey" FOREIGN KEY ("id_auteur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaires" ADD CONSTRAINT "commentaires_id_projet_cible_fkey" FOREIGN KEY ("id_projet_cible") REFERENCES "projets"("id_projet") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_id_recommandeur_fkey" FOREIGN KEY ("id_recommandeur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_modele_fkey" FOREIGN KEY ("id_modele") REFERENCES "modeles_portfolios"("id_modele") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_id_portfolio_fkey" FOREIGN KEY ("id_portfolio") REFERENCES "portfolios"("id_portfolio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeles_portfolios" ADD CONSTRAINT "modeles_portfolios_id_admin_createur_fkey" FOREIGN KEY ("id_admin_createur") REFERENCES "administrateurs"("id_administrateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modeles_portfolios" ADD CONSTRAINT "modeles_portfolios_id_apercu_fkey" FOREIGN KEY ("id_apercu") REFERENCES "fichiers"("id_fichier") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants_badges" ADD CONSTRAINT "etudiants_badges_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etudiants_badges" ADD CONSTRAINT "etudiants_badges_id_badge_fkey" FOREIGN KEY ("id_badge") REFERENCES "badges"("id_badge") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depots_github" ADD CONSTRAINT "depots_github_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions_systeme" ADD CONSTRAINT "suggestions_systeme_id_etudiant_fkey" FOREIGN KEY ("id_etudiant") REFERENCES "etudiants"("id_etudiant") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_id_destinataire_fkey" FOREIGN KEY ("id_destinataire") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiques_connexions" ADD CONSTRAINT "historiques_connexions_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historiques_actions" ADD CONSTRAINT "historiques_actions_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "utilisateurs"("id_utilisateur") ON DELETE CASCADE ON UPDATE CASCADE;
