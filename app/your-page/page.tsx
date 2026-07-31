'use client'
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
export default function Home() {
  const router = useRouter()
  const isLoggedIN = useSelector((state: RootState) => state.loggedIn)
  useEffect(() => {
    if (!isLoggedIN) {
      router.push('/Login')
    }
  }, [])

  return (
   <>
      <div className="flex h-screen md:flex-row flex-col">
            <SideBar activeTab="yourPage"/>
            <div className="md:w-full h-full flex  justify-start bg-black text-white overflow-hidden">
                my content
            </div>
        </div>
    </>
  );
}
