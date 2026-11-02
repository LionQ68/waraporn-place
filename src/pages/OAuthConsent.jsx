import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
export default function OAuthConsent(){const nav=useNavigate();useEffect(()=>{supabase?.auth.getSession().then(({data})=>nav(data.session?"/":"/login",{replace:true}));},[nav]);return <div className="grid min-h-screen place-items-center bg-canvas text-slate-400">กำลังยืนยันการเข้าสู่ระบบ...</div>}
