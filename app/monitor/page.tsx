'use client'
import { useDispatch, UseDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import Monitors from "@/components/Monitors";
import { setUser } from "../redux/slice/UserSlice";
import { axiosInstance } from "@/lib/axiosInstance";
export default function Home() {
    const router = useRouter()
    const dispatch = useDispatch()
    const isLoggedIN = useSelector((state: RootState) => state.loggedIn)
    useEffect(() => {
        verifyAuth()
    }, [])

    const verifyAuth = async () => {
        const verifyAuth = await axiosInstance.post('/auth/verifyAuth')
        const res = verifyAuth.data
        console.log(res)
        const id: string = res.id
        if (res.success) {
            dispatch(setUser({ id: id, data: null, name: res.name, email: res.email, plan: res.plan }))
        } else {
            router.push('/Login')
        }
    }

    return (
        <>
            <div className="flex h-screen md:flex-row flex-col">
                <SideBar activeTab="monitor" />
                <div className="md:w-full h-full flex  justify-start bg-black text-white overflow-hidden">
                    <Monitors />
                </div>
            </div>
        </>
    );
}
