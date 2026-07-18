/*
  Warnings:

  - You are about to drop the `CapstoneFeedback` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CapstoneFeedback` DROP FOREIGN KEY `CapstoneFeedback_author_id_fkey`;

-- DropForeignKey
ALTER TABLE `CapstoneFeedback` DROP FOREIGN KEY `CapstoneFeedback_capstone_id_fkey`;

-- DropTable
DROP TABLE `CapstoneFeedback`;

-- CreateTable
CREATE TABLE `CapstoneSubmission` (
    `submission_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `capstone_id` BIGINT UNSIGNED NOT NULL,
    `milestone_id` BIGINT UNSIGNED NOT NULL,
    `file_path` VARCHAR(191) NULL,
    `student_note` TEXT NULL,
    `grade` DOUBLE NULL,
    `lecturer_note` TEXT NULL,
    `status` ENUM('PENDING', 'PASSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`submission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CapstoneSubmission` ADD CONSTRAINT `CapstoneSubmission_capstone_id_fkey` FOREIGN KEY (`capstone_id`) REFERENCES `Capstone`(`capstone_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CapstoneSubmission` ADD CONSTRAINT `CapstoneSubmission_milestone_id_fkey` FOREIGN KEY (`milestone_id`) REFERENCES `Milestone`(`milestone_id`) ON DELETE CASCADE ON UPDATE CASCADE;
