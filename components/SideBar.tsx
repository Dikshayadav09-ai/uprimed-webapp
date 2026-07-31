"use client";

import React, { useState } from "react";
import Logo from "./Logo";
import { Activity, Cable, Cog, House, LogOut, Menu, ScreenShare, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  activeTab: "home" | "monitor" | "setting" | "yourPage";
  className?: string;
}

const SideBar = ({ activeTab, className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const logout = () => {
    localStorage.clear();
    router.push("/Login");
  };

  const baseClasses =
    "text-left px-3 py-2 rounded-lg transition-all ease-in-out duration-300 flex items-center gap-2 cursor-pointer";
  const activeClasses = "bg-zinc-900 text-white";
  const hoverClasses = "hover:bg-zinc-900";

  return (
    <>
      {/* Mobile Menu Toggle Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white hover:bg-zinc-800 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-zinc-950 text-white flex flex-col justify-between
          lg:relative lg:translate-x-0
          fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${className ?? ""}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-zinc-800">
          <div className="flex items-center pl-2 gap-2 font-bold text-lg">
            <Logo /> Uptimed
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-2 px-4 py-3 flex-1">
          <button
            className={`${baseClasses} ${activeTab === "home" ? activeClasses : hoverClasses
              }`}
            onClick={() => {
              router.push("/");
              setIsOpen(false);
            }}
          >
            <House size={20} /> Home
          </button>

          <button
            className={`${baseClasses} ${activeTab === "monitor" ? activeClasses : hoverClasses
              }`}
            onClick={() => {
              router.push("/monitor");
              setIsOpen(false);
            }}
          >
            <Activity size={20} /> Monitors
          </button>

          {/* <button
            className={`${baseClasses} ${activeTab === "yourPage" ? activeClasses : hoverClasses
              }`}
            onClick={() => {
              router.push("/your-page");
              setIsOpen(false);
            }}
          >
            <ScreenShare size={20} /> Your Page
          </button> */}
          {/* <button
            className={`${baseClasses} ${activeTab === "setting" ? activeClasses : hoverClasses
              }`}
            onClick={() => {
              router.push("/setting");
              setIsOpen(false);
            }}
          >
            <Cable size={20} /> Connect
          </button> */}
          <button
            className={`${baseClasses} ${activeTab === "setting" ? activeClasses : hoverClasses
              }`}
            onClick={() => {
              router.push("/setting");
              setIsOpen(false);
            }}
          >
            <Cog size={20} /> Settings
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 flex gap-2 items-center mb-12">
          <div className="rounded-full bg-cyan-600 h-[35px] w-[35px] flex items-center justify-center">
            A
          </div>
          <p className="text-sm text-gray-300">Ankit</p>
          <button
            className="flex-1 flex justify-end cursor-pointer"
            onClick={logout}
          >
            <LogOut className="hover:text-zinc-500 transition-all ease-in-out duration-300" />
          </button>
        </div>
      </aside>
      <div className="divider h-screen w-[1px] hidden lg:flex bg-zinc-600"></div>
    </>
  );
};

export default SideBar;
