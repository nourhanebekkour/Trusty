-- AlterTable
ALTER TABLE "utilisateurs" ADD COLUMN     "date_expiration_refresh" TIMESTAMP(3),
ADD COLUMN     "refresh_token" VARCHAR(500);
