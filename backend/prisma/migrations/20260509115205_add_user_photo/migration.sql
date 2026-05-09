/*
  Warnings:

  - You are about to drop the column `icone` on the `competences` table. All the data in the column will be lost.
  - The `niveau_maitrise` column on the `etudiants_competences` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `icone` on the `technologies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "competences" DROP COLUMN "icone";

-- AlterTable
ALTER TABLE "etudiants_competences" DROP COLUMN "niveau_maitrise",
ADD COLUMN     "niveau_maitrise" "Niveau" NOT NULL DEFAULT 'DEBUTANT';

-- AlterTable
ALTER TABLE "technologies" DROP COLUMN "icone";

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "photo" VARCHAR(500);
