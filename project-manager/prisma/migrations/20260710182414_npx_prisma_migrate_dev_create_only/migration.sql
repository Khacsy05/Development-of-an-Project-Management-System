/*
  Warnings:

  - Added the required column `faculty_id` to the `Major` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Major` ADD COLUMN `faculty_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `faculty_id` BIGINT NULL;

-- CreateTable
CREATE TABLE `Faculty` (
    `faculty_id` BIGINT NOT NULL AUTO_INCREMENT,
    `faculty_code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `Faculty_faculty_code_key`(`faculty_code`),
    PRIMARY KEY (`faculty_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `Faculty`(`faculty_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Major` ADD CONSTRAINT `Major_faculty_id_fkey` FOREIGN KEY (`faculty_id`) REFERENCES `Faculty`(`faculty_id`) ON DELETE CASCADE ON UPDATE CASCADE;
