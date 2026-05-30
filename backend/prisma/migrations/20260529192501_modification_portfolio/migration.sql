/*
  Warnings:

  - You are about to drop the column `categorie` on the `modeles_portfolios` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `modeles_portfolios` table. All the data in the column will be lost.
  - You are about to drop the column `fichier_css` on the `modeles_portfolios` table. All the data in the column will be lost.
  - You are about to drop the column `id_admin_createur` on the `modeles_portfolios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `modeles_portfolios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `modeles_portfolios` table without a default value. This is not possible if the table is not empty.
  - Made the column `id_modele` on table `portfolios` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "modeles_portfolios" DROP CONSTRAINT "modeles_portfolios_id_admin_createur_fkey";

-- DropForeignKey
ALTER TABLE "portfolios" DROP CONSTRAINT "portfolios_id_modele_fkey";

-- AlterTable
ALTER TABLE "modeles_portfolios" DROP COLUMN "categorie",
DROP COLUMN "description",
DROP COLUMN "fichier_css",
DROP COLUMN "id_admin_createur",
ADD COLUMN     "slug" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "portfolios" ALTER COLUMN "id_modele" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "modeles_portfolios_slug_key" ON "modeles_portfolios"("slug");

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_id_modele_fkey" FOREIGN KEY ("id_modele") REFERENCES "modeles_portfolios"("id_modele") ON DELETE CASCADE ON UPDATE CASCADE;
