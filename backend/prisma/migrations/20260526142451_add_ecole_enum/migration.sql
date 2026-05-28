-- CreateEnum
CREATE TYPE "Ecole" AS ENUM ('ENSATanger', 'ENCGTanger', 'FSTTanger', 'FSJESTanger', 'ENSATetouan', 'ENSTetouan', 'FSTetouan', 'FLSHMartil', 'FSJESTetouan', 'ENSAAlHoceima', 'FSTAlHoceima', 'FPDAlHoceima');

-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "ecole" "Ecole";
