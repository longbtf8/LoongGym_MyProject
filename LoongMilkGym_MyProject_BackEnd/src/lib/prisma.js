require("dotenv/config");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("../../generated/prisma/client");
const dbConfig = require("@/config/db.config");

const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 30,
});

const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
