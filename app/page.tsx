'use client'
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { RootState } from "./redux/store/store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import HomeComponent from "@/components/HomeComponent";
export default function Home() {
  const [verifyingAuth, setverifyingAuth] = useState(true)
  const router = useRouter()
  const isLoggedIN = useSelector((state: RootState) => state.loggedIn)
  
  useEffect(() => {
    // if (!isLoggedIN) {
    //   router.push('/Login')
    // }
    // setverifyingAuth(false)
  }, [])

  return (
    <>
      <div className="flex h-screen md:flex-row flex-col">
        <SideBar activeTab="home" />
        <div className="md:w-full h-full flex  justify-start bg-black text-white overflow-hidden">
          <HomeComponent />
        </div>
      </div>
    </>
  );
}
