-- CreateTable
CREATE TABLE `companys` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` INTEGER NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `latitude` VARCHAR(255) NOT NULL,
    `longitude` VARCHAR(255) NOT NULL,
    `wa_billing_message` VARCHAR(255) NOT NULL,
    `wa_billing_paid_message` VARCHAR(255) NOT NULL,
    `api_wa_token` VARCHAR(255) NOT NULL,
    `is_wa_notification` BOOLEAN NOT NULL,
    `is_email_notification` BOOLEAN NOT NULL,
    `package` ENUM('beginner', 'intermidiate', 'expert') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `latitude` VARCHAR(255) NOT NULL,
    `longitude` VARCHAR(255) NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `role` ENUM('superadmin', 'operator', 'customer') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `users_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL,
    `company_id` CHAR(36) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `products_company_id_idx`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` CHAR(36) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role` ENUM('open', 'solved', 'archive') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `reports_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_answers` (
    `id` CHAR(36) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `report_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `report_answers_user_id_idx`(`user_id`),
    INDEX `report_answers_report_id_idx`(`report_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` CHAR(36) NOT NULL,
    `product_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `fixed_price` INTEGER NOT NULL,
    `role` ENUM('unpaid', 'paid', 'archive') NOT NULL,
    `due_date` TIMESTAMP(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `invoices_product_id_idx`(`product_id`),
    INDEX `invoices_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` CHAR(36) NOT NULL,
    `invoice_id` CHAR(36) NOT NULL,
    `invoice_number` VARCHAR(255) NOT NULL,
    `gateway_ref` VARCHAR(255) NOT NULL,
    `role` ENUM('pending', 'success', 'failed') NOT NULL,
    `payment_date` TIMESTAMP(0) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `transactions_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companys`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_answers` ADD CONSTRAINT `report_answers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_answers` ADD CONSTRAINT `report_answers_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
