-- DropIndex
DROP INDEX `revoked_tokens_token_hash_key` ON `revoked_tokens`;

-- AlterTable
ALTER TABLE `revoked_tokens` MODIFY `token_hash` VARCHAR(512) NOT NULL;
