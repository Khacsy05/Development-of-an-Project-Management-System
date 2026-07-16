/*
  Warnings:

  - You are about to drop the column `lecturer_feedback` on the `Capstone` table. All the data in the column will be lost.
  - You are about to drop the column `student_message` on the `Capstone` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Capstone` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Capstone` DROP COLUMN `lecturer_feedback`,
    DROP COLUMN `student_message`,
    MODIFY `topic_id` BIGINT UNSIGNED NULL,
    MODIFY `lecturer_id` BIGINT UNSIGNED NULL,
    MODIFY `status` ENUM('PENDING_LECTURER', 'REJECTED_LECTURER', 'PENDING_FACULTY', 'REJECTED_FACULTY', 'DOING', 'SUBMITTED_FINAL', 'DEFENSE_ELIGIBLE', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING_LECTURER';

-- CreateTable
CREATE TABLE `CapstoneRequest` (
    `request_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `capstone_id` BIGINT UNSIGNED NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `request_type` VARCHAR(50) NOT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `feedback` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`request_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CapstoneRequest` ADD CONSTRAINT `CapstoneRequest_capstone_id_fkey` FOREIGN KEY (`capstone_id`) REFERENCES `Capstone`(`capstone_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CapstoneRequest` ADD CONSTRAINT `CapstoneRequest_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
