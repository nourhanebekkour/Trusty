-- AlterTable
ALTER TABLE "etudiants" ALTER COLUMN "filiere" DROP NOT NULL;

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "date_expiration_token_email" TIMESTAMP(3),
ADD COLUMN     "token_reinitialisation_email" VARCHAR(255);
