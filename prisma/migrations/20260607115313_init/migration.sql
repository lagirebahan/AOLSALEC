/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `country` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(25)` to `Enum(EnumId(0))`.
  - Added the required column `id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_username_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `country`,
    DROP COLUMN `user_id`,
    DROP COLUMN `username`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `totalCopies` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `borrows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `borrowedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `returnedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `borrows` ADD CONSTRAINT `borrows_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `borrows` ADD CONSTRAINT `borrows_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
