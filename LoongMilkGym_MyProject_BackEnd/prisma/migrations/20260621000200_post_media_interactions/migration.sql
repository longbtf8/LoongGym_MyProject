ALTER TABLE `post_media`
  ADD COLUMN `caption` TEXT NULL;

CREATE TABLE `post_media_comments` (
  `id` VARCHAR(191) NOT NULL,
  `media_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `post_media_reactions` (
  `id` VARCHAR(191) NOT NULL,
  `media_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `reaction_type` VARCHAR(30) NOT NULL DEFAULT 'like',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `post_media_reactions_media_id_user_id_reaction_type_key`(`media_id`, `user_id`, `reaction_type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_media_comments`
  ADD CONSTRAINT `post_media_comments_media_id_fkey`
  FOREIGN KEY (`media_id`) REFERENCES `post_media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_media_comments`
  ADD CONSTRAINT `post_media_comments_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_media_reactions`
  ADD CONSTRAINT `post_media_reactions_media_id_fkey`
  FOREIGN KEY (`media_id`) REFERENCES `post_media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_media_reactions`
  ADD CONSTRAINT `post_media_reactions_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
