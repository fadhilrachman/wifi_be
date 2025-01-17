/*
  Warnings:

  - You are about to drop the column `lasLogOut` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `lasLogOut`,
    ADD COLUMN `lastLogOut` DATETIME(3) NULL;
