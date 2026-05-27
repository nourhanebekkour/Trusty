/*
  Warnings:

  - The `filiere` column on the `etudiants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `departement` column on the `professeurs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `filieres_interv` column on the `professeurs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "activites_parascolaires" DROP CONSTRAINT "activites_parascolaires_id_validateur_fkey";

-- AlterTable
ALTER TABLE "etudiants" DROP COLUMN "filiere",
ADD COLUMN     "filiere" VARCHAR(100);

-- AlterTable
ALTER TABLE "professeurs" DROP COLUMN "departement",
ADD COLUMN     "departement" VARCHAR(100),
DROP COLUMN "filieres_interv",
ADD COLUMN     "filieres_interv" TEXT[];

-- DropEnum
DROP TYPE "Departement";

-- DropEnum
DROP TYPE "Filiere";

-- AddForeignKey
ALTER TABLE "activites_parascolaires" ADD CONSTRAINT "activites_parascolaires_id_validateur_fkey" FOREIGN KEY ("id_validateur") REFERENCES "administrateurs"("id_administrateur") ON DELETE SET NULL ON UPDATE CASCADE;
