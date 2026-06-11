/*
  Warnings:

  - Added the required column `filiere` to the `etudiants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "etudiants" DROP COLUMN "filiere",
ADD COLUMN     "filiere" "Filiere" NOT NULL;
