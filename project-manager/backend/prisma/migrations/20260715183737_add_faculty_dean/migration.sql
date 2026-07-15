/*
  Warnings:

  - A unique constraint covering the columns `[dean_id]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `faculty_id` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Faculty` ADD COLUMN `dean_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `Topic` ADD COLUMN `faculty_id` BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Faculty_dean_id_key` ON `Faculty`(`dean_id`);

-- AddForeignKey
ALTER TABLE `Faculty` ADD CONSTRAINT `Faculty_dean_id_fkey` FOREIGN KEY (`dean_id`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Topic` ADD CONSTRAINT `Topic_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `Faculty`(`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;
