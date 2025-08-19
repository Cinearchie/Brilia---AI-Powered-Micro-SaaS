import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { clerkId } = await req.json();

  await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      coins: 100, // give default coins
    },
  });

  return NextResponse.json({ status: "ok" });
}
