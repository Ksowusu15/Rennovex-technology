import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
function csvCell(value:unknown){const text=value==null
  ?""
  :String(value);
  return `"${text.replaceAll('"',
  '""')}"`;}
export async function GET(request:Request){const session=await getSession();
  if(!session)return NextResponse.json({error:"Unauthorized"},
  {status:401});
  const user=await prisma.user.findUnique({where:{id:session.userId},
  select:{role:true,
  isActive:true}});
  if(!user?.isActive
    ||user.role==="EDITOR")return NextResponse.json({error:"Forbidden"},
  {status:403});
  const type=new URL(request.url).searchParams.get("type");
  let rows:unknown[][]=[];
  let name="export.csv";
  if(type==="quotes"){const items=await prisma.quoteRequest.findMany({orderBy:{createdAt:"desc"}});
  rows=[["Reference",
  "Name",
  "Email",
  "Phone",
  "Company",
  "Service",
  "Budget",
  "Timeline",
  "Requirements",
  "Status",
  "Created"],
  ...items.map(i=>[i.reference,
  i.name,
  i.email,
  i.phone,
  i.company,
  i.service,
  i.budget,
  i.timeline,
  i.requirements,
  i.status,
  i.createdAt.toISOString()])];
  name="rennovex-quotes.csv";}else if(type==="bookings"){const items=await prisma.consultationBooking.findMany({orderBy:{createdAt:"desc"}});
  rows=[["Reference",
  "Name",
  "Email",
  "Phone",
  "Company",
  "Service",
  "Preferred Date",
  "Notes",
  "Status",
  "Created"],
  ...items.map(i=>[i.reference,
  i.name,
  i.email,
  i.phone,
  i.company,
  i.service,
  i.preferredDate.toISOString(),
  i.notes,
  i.status,
  i.createdAt.toISOString()])];
  name="rennovex-bookings.csv";}else if(type==="assistant"){const items=await prisma.chatSession.findMany({orderBy:{updatedAt:"desc"},
  include:{messages:true}});
  rows=[["Session",
  "Name",
  "Email",
  "Phone",
  "Status",
  "Conversation",
  "Updated"],
  ...items.map(i=>[i.id,
  i.visitorName,
  i.email,
  i.phone,
  i.status,
  i.messages.map(m=>`${m.sender}: ${m.content}`).join(" | "),
  i.updatedAt.toISOString()])];
  name="rennovex-assistant-conversations.csv";}else return NextResponse.json({error:"Unknown export"},
  {status:400});
  const csv=rows.map(row=>row.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(csv,
  {headers:{"Content-Type":"text/csv; charset=utf-8",
  "Content-Disposition":`attachment; filename="${name}"`}});}
