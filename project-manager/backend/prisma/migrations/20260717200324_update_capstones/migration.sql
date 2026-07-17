/*
  Warnings:

  - Added the required column `faculty_id` to the `Capstone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Capstone` ADD COLUMN `faculty_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `Capstone` ADD CONSTRAINT `Capstone_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `Faculty`(`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;
