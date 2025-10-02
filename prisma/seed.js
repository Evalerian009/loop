import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  // 1️⃣ Ensure General channel exists
  let generalChannel = await prisma.channel.findUnique({
    where: { name: "General" },
  });

  if (!generalChannel) {
    generalChannel = await prisma.channel.create({
      data: { name: "General", isDM: false },
    });
  }
  console.log("General channel ready:", generalChannel.name);

  // 2️⃣ Add all users to General channel
  const users = await prisma.user.findMany();
  for (const user of users) {
    await prisma.channelMember.upsert({
      where: { userId_channelId: { userId: user.id, channelId: generalChannel.id } },
      update: {},
      create: { userId: user.id, channelId: generalChannel.id },
    });
  }

  console.log("All users added to General channel.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });