// api/coin-add/route.ts

import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {},
    create: { clerkId: user.id, coins: 100 },
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
  
    return NextResponse.json({ coins: dbUser?.coins || 0 });
  }
