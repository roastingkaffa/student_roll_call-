/*
  Warnings:

  - You are about to drop the column `data` on the `AttendanceRecord` table. All the data in the column will be lost.
  - Added the required column `date` to the `AttendanceRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecord" DROP COLUMN "data",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
