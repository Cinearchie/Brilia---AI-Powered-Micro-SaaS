import {NextRequest, NextResponse} from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request : NextRequest){
    console.log('oihijhjijhjijh')
    try{
        console.log("Hello Hello")
        const videos = await prisma.video.findMany({
            orderBy : {createdAt : 'desc'}
        })
        console.log(videos)
        return NextResponse.json(videos)
    }catch(error){
        return NextResponse.json({error : "Error Fetching video"},{status:500})
    }finally{
        await prisma.$disconnect()
    }
}