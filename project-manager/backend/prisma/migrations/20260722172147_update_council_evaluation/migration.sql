/*
  Warnings:

  - Added the required column `council_id` to the `CouncilEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CouncilEvaluation` ADD COLUMN `council_id` BIGINT UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `CouncilEvaluation` ADD CONSTRAINT `CouncilEvaluation_council_id_fkey` FOREIGN KEY (`council_id`) REFERENCES `Council`(`council_id`) ON DELETE CASCADE ON UPDATE CASCADE;
