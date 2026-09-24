import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base=process.env.NEXT_PUBLIC_SITE_URL
  ??"http://localhost:3000"; 
  return ["",
  "/about",
  "/services",
  "/projects",
  "/case-studies",
  "/blog",
  "/contact"].map(path=>({url:`${base}${path}`,
  lastModified:new Date(),
  changeFrequency:path===""
    ?"weekly"
    :"monthly",
  priority:path===""
    ?1
    :.7})); }
