-- AlterTable
ALTER TABLE "series" ADD COLUMN     "rating" DECIMAL(3,1),
ADD COLUMN     "is_adult" BOOLEAN NOT NULL DEFAULT false;
