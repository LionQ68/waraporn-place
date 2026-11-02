import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function PageLayout({ title, subtitle, actions, children }) {
  const [open, setOpen] = useState(false);
  const { profile, user } = useAuth();
  return <div className="min-h-screen bg-canvas text-slate-900"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl md:px-8"><button onClick={() => setOpen(true)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"><Menu /></button><div className="min-w-0 flex-1"><h1 className="truncate text-xl font-extrabold">{title}</h1>{subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}</div>{actions}<button className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><Bell size={19} /></button><div className="hidden items-center gap-2 sm:flex"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{(profile?.full_name || user?.email || "A")[0].toUpperCase()}</span><span className="max-w-32 truncate text-sm font-semibold">{profile?.full_name || user?.email}</span></div></header><main className="p-4 md:p-8">{children}</main></div></div>;
}
