import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeReference } from "@/lib/references";
import { rateLimit, 
  tooManyRequests } from "@/lib/rate-limit";
const schema=z.object({name:z.string().min(2),
  email:z.string().email(),
  phone:z.string().optional(),
  company:z.string().optional(),
  service:z.string().optional(),
  preferredDate:z.string().min(1),
  notes:z.string().max(2000).optional()});
export async function POST(request:Request){
  const throttle = rateLimit(request, 
    "bookings", 
    5, 
    900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try{const data=schema.parse(await request.json());
    const date=new Date(data.preferredDate);
    if(Number.isNaN(date.getTime())
      ||date.getTime()<Date.now()) throw new Error("Invalid date"); 
    const item=await prisma.consultationBooking.create({data:{...data,
    preferredDate:date,
    reference:makeReference("RNX-B")}});
    return NextResponse.json({ok:true,
    reference:item.reference},
    {status:201});}catch(error){console.error(error);
    return NextResponse.json({error:"Choose a valid future date and complete the required fields."},
    {status:400});}}
