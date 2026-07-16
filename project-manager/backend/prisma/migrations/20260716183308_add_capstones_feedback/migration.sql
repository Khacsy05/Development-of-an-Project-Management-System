-- CreateTable
CREATE TABLE `CapstoneFeedback` (
    `feedback_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `capstone_id` BIGINT UNSIGNED NOT NULL,
    `author_id` BIGINT UNSIGNED NOT NULL,
    `author_role` VARCHAR(20) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`feedback_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CapstoneFeedback` ADD CONSTRAINT `CapstoneFeedback_capstone_id_fkey` FOREIGN KEY (`capstone_id`) REFERENCES `Capstone`(`capstone_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CapstoneFeedback` ADD CONSTRAINT `CapstoneFeedback_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
