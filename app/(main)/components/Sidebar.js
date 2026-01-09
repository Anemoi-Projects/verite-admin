"use client";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  MessageCircle,
  User,
  MessageCircleQuestion,
  XCircle,
  File,
  LogOut,
  Library,
  Group,
  Shield,
  PersonStanding,
  MessageCircleDashed,
  MailIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Sidebar = () => {
  // sidebar
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully", {
      className: "bg-green-700 text-white",
    });
    router.push("/");
  };

  const NavItem = ({ Icon, label, href }) => {
    const pathname = usePathname();
    const isActive = pathname?.includes(href);

    return (
      <Link
        href={href}
        className={`  gap-4 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-x-3 ${
          isActive ? "theme-button" : "hover:bg-muted dark:hover:bg-gray-50/10"
        }`}
      >
        {React.createElement(Icon)}
        <span className="text-sm font-medium">{label}</span>
      </Link>
    );
  };
  return (
    <aside
      className="py-6 min-w-[250px] overflow-auto border-r-[0.5px]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="text-3xl font-bold mb-10">
        <div className=" px-4 py-2 rounded-md ">
          <img src="/logo.png" alt="logo" width={50} />
        </div>
      </div>
      <nav className="flex flex-col gap-6 w-full px-2">
        <NavItem Icon={LayoutDashboard} label="Dashboard" href="/dashboard" />
        <NavItem Icon={FileText} label="Pages" href="/all-pages" />
        <NavItem Icon={Shield} label="Teams & Partners" href="/teams" />
        <NavItem Icon={Library} label="Category Library" href="/library" />
        <NavItem Icon={MessageCircleQuestion} label="FAQs" href="/faqs" />
        <NavItem Icon={MessageCircleDashed} label="Messages" href="/messages" />
        <NavItem Icon={MailIcon} label="Maillist" href="/maillist" />
        <NavItem Icon={User} label="Users" href="#" />
        <NavItem Icon={MessageCircle} label="Testimonials" href="#" />
      </nav>
      <div className="mt-5 mb-6 w-full px-2">
        <div
          className="gap-4 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-x-3 font-semibold text-sm hover:bg-muted"
          onClick={() => handleLogout()}
          label="Logout"
        >
          <LogOut /> Logout
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
