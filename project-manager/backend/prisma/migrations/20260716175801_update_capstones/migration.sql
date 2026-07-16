/*
  Warnings:

  - A unique constraint covering the columns `[student_id]` on the table `Capstone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Capstone_student_id_key` ON `Capstone`(`student_id`);
