-- AlterTable
ALTER TABLE `Council` ADD COLUMN `faculty_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `Council` ADD CONSTRAINT `Council_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `Faculty`(`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE;
