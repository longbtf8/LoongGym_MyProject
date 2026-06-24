const { exec } = require("node:child_process");
const util = require("util");
const fs = require("node:fs");
const path = require("node:path");
const dbConfig = require("../config/db.config");
const { getYmdHms } = require("../utils/time");

const execPromise = util.promisify(exec);

async function backupDB() {
  const { user, host, password, port, database, backupLocalDir, backupRemote, backupRemoteDir } = dbConfig;
  
  const currentTime = getYmdHms();
  const fileName = `${database}_${currentTime}.sql`;
  
  const absoluteLocalDir = path.resolve(backupLocalDir);
  const localFilePath = path.join(absoluteLocalDir, fileName);

  try {
    if (!fs.existsSync(absoluteLocalDir)) {
      fs.mkdirSync(absoluteLocalDir, { recursive: true });
    }

    console.log(`[BackupDB] Đang kết xuất CSDL ${database}...`);
    
    const BackupCMD = `mysqldump -u"${user}" --password="${password}" -h"${host}" -P"${port}" "${database}" > "${localFilePath}"`;
    await execPromise(BackupCMD);

    console.log(`[BackupDB] Kết xuất thành công file local: ${localFilePath}`);

    console.log(`[BackupDB] Đang tải lên Drive qua Rclone...`);
    const copyCommand = `rclone copyto "${localFilePath}" "${backupRemote}:${backupRemoteDir}/${fileName}"`;
    await execPromise(copyCommand);

    console.log(`[BackupDB] Tải lên Google Drive thành công! File: ${backupRemoteDir}/${fileName}`);

  } catch (error) {
    console.error("[BackupDB] Lỗi trong quá trình backup:", error);
  }
}

module.exports = backupDB;
