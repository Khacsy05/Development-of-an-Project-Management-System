/*
  Warnings:

  - You are about to alter the column `status` on the `Capstone` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Capstone` MODIFY `status` ENUM('PENDING_APPROVAL', 'DOING', 'SUBMITTED_FINAL', 'DEFENSE_ELIGIBLE', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING_APPROVAL';
