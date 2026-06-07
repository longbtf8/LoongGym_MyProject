ALTER TABLE `workout_program_days`
  ADD COLUMN `cycle_day` INTEGER NULL;

UPDATE `workout_program_days`
SET `cycle_day` = ((`week_number` - 1) * 7) + `day_number`
WHERE `cycle_day` IS NULL;

ALTER TABLE `workout_program_days`
  MODIFY `cycle_day` INTEGER NOT NULL;

ALTER TABLE `workout_program_days`
  DROP COLUMN `week_number`,
  DROP COLUMN `day_number`;

ALTER TABLE `workout_program_days`
  ADD UNIQUE INDEX `workout_program_days_program_id_cycle_day_key` (`program_id`, `cycle_day`);

ALTER TABLE `workout_programs`
  DROP COLUMN `duration_weeks`;

ALTER TABLE `user_training_plans`
  DROP COLUMN `end_date`;
