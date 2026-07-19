-- CreateTable
CREATE TABLE `CouncilEvalution` (
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
ALTER TABLE `CouncilEvalution` ADD CONSTRAINT `CouncilEvalution_members_id_fkey` FOREIGN KEY (`members_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouncilEvalution` ADD CONSTRAINT `CouncilEvalution_capstone_id_fkey` FOREIGN KEY (`capstone_id`) REFERENCES `Capstone`(`capstone_id`) ON DELETE CASCADE ON UPDATE CASCADE;
