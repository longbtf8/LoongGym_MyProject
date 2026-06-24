require("module-alias/register");
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT || 3306,

  // backup config
  backupLocalDir: process.env.DB_BACKUP_LOCAL_DIR || "./src/storage/DBBackup",
  backupRemote: process.env.DB_BACKUP_REMOTE || "LoongMilkGymBackupDB",
  backupRemoteDir: process.env.DB_BACKUP_REMOTE_DIR || "DBLoongMilkGym",
};
module.exports = dbConfig;
