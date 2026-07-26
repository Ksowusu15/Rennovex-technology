import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
const schema=z.object({email:z.string().email(),name:z.string().optional()});
export async function POST(request:Request){
  const throttle = rateLimit(request, "newsletter", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);try{const data=schema.parse(await request.json());await prisma.newsletterSubscriber.upsert({where:{email:data.email},update:{name:data.name||undefined,isSubscribed:true},create:data});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"Enter a valid email address."},{status:400});}}
