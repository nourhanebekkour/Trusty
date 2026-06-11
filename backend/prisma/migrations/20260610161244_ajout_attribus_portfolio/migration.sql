-- DropIndex
DROP INDEX "portfolios_id_etudiant_key";

-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "competences_selectionnees" TEXT[],
ADD COLUMN     "couleur_accent" TEXT,
ADD COLUMN     "projets_selectionnes" TEXT[],
ADD COLUMN     "sections_config" JSONB,
ADD COLUMN     "stages_selectionnes" TEXT[];
