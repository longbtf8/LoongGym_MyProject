// Register module-alias so we can use @/ paths
require("module-alias/register");
const { prisma } = require("../lib/prisma");

async function main() {
  console.log("Checking female glute focus program...");
  const program = await prisma.workoutProgram.findUnique({
    where: { slug: "female-glute-focus-program" },
    include: { days: true }
  });

  if (!program) {
    console.log("Program female-glute-focus-program not found in database.");
    return;
  }

  console.log(`Found program: "${program.title}" with ${program.days.length} days.`);
  
  const hasDay7 = program.days.some(d => d.cycleDay === 7);
  if (hasDay7) {
    console.log("Day 7 already exists. No action needed.");
    return;
  }

  console.log("Day 7 is missing. Adding Sunday (day 7) as a rest day...");
  await prisma.workoutProgramDay.create({
    data: {
      programId: program.id,
      cycleDay: 7,
      title: "Nghỉ ngơi hoàn toàn",
      focusArea: "Toàn thân",
      muscleMapUrl: null,
      description: "Ngày nghỉ để phục hồi cơ bắp và hệ thần kinh."
    }
  });

  // Also update metadata cycleLength
  await prisma.workoutProgram.update({
    where: { id: program.id },
    data: {
      metadata: {
        ...((program.metadata && typeof program.metadata === 'object') ? program.metadata : {}),
        cycleLength: 7
      }
    }
  });

  console.log("Successfully added Sunday (day 7) and updated metadata!");
}

main()
  .catch(err => {
    console.error("Error executing script:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
