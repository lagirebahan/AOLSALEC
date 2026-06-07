-- CreateTable
CREATE TABLE `users` (
    `user_id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(55) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(55) NOT NULL,
    `country` VARCHAR(55) NOT NULL,
    `role` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
