/*
  Warnings:

  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `address`,
    ADD COLUMN `lasLogOut` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expiredAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `token` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
