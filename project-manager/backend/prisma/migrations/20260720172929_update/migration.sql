/*
  Warnings:

  - You are about to drop the `CouncilEvalution` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CouncilEvalution` DROP FOREIGN KEY `CouncilEvalution_capstone_id_fkey`;

-- DropForeignKey
ALTER TABLE `CouncilEvalution` DROP FOREIGN KEY `CouncilEvalution_members_id_fkey`;

-- DropTable
DROP TABLE `CouncilEvalution`;

-- CreateTable
CREATE TABLE `CouncilEvaluation` (
    `evalution_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `members_id` BIGINT UNSIGNED NOT NULL,
    `capstone_id` BIGINT UNSIGNED NOT NULL,
    `grade` DOUBLE NULL,
    `lecturer_note` VARCHAR(191) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`evalution_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CouncilEvaluation` ADD CONSTRAINT `CouncilEvaluation_members_id_fkey` FOREIGN KEY (`members_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouncilEvaluation` ADD CONSTRAINT `CouncilEvaluation_capstone_id_fkey` FOREIGN KEY (`capstone_id`) REFERENCES `Capstone`(`capstone_id`) ON DELETE CASCADE ON UPDATE CASCADE;
