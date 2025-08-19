import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function deductCoin(clerkId : string , amount : number){
    const user = await prisma.user.update({
        where: {clerkId},
        data: {coins : {decrement : amount}}
    })
    if (!user) {
        throw new Error(`User with clerkId ${clerkId} not found`);
      }
    return user.coins
}