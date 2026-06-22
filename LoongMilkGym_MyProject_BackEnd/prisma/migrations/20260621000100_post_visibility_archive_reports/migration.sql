CREATE TABLE `post_user_hidden` (
  `id` VARCHAR(191) NOT NULL,
  `post_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `post_user_hidden_post_id_user_id_key`(`post_id`, `user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `post_profile_archives` (
  `id` VARCHAR(191) NOT NULL,
  `post_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `post_profile_archives_post_id_user_id_key`(`post_id`, `user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `post_reports` (
  `id` VARCHAR(191) NOT NULL,
  `post_id` VARCHAR(191) NOT NULL,
  `reporter_id` VARCHAR(191) NOT NULL,
  `reason` TEXT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `resolved_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_user_hidden`
  ADD CONSTRAINT `post_user_hidden_post_id_fkey`
  FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_user_hidden`
  ADD CONSTRAINT `post_user_hidden_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_profile_archives`
  ADD CONSTRAINT `post_profile_archives_post_id_fkey`
  FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_profile_archives`
  ADD CONSTRAINT `post_profile_archives_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_reports`
  ADD CONSTRAINT `post_reports_post_id_fkey`
  FOREIGN KEY (`post_id`) REFERENCES `community_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_reports`
  ADD CONSTRAINT `post_reports_reporter_id_fkey`
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
