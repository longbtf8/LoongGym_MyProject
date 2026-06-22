CREATE TABLE `post_media_comment_reactions` (
  `id` VARCHAR(191) NOT NULL,
  `comment_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `reaction_type` VARCHAR(30) NOT NULL DEFAULT 'like',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `pmcr_comment_user_type_key`(`comment_id`, `user_id`, `reaction_type`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `post_media_comment_reactions`
  ADD CONSTRAINT `post_media_comment_reactions_comment_id_fkey`
  FOREIGN KEY (`comment_id`) REFERENCES `post_media_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `post_media_comment_reactions`
  ADD CONSTRAINT `post_media_comment_reactions_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
