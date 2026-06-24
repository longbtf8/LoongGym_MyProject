require("module-alias/register");
const { prisma } = require("../lib/prisma");

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: "ADMIN" },
        { isSuperAdmin: true }
      ]
    },
    select: {
      email: true,
      role: true,
      isSuperAdmin: true
    }
  });
  console.log("Admin Users:", JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
