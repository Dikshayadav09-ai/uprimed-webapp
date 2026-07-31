import AddMonitorComponent from '@/components/monitor/AddMonitorComponent'
import SideBar from '@/components/SideBar'
import VerifyAuth from '@/lib/verifyAuth'
import React from 'react'

const page = () => {
    return (
        <VerifyAuth>
        <>
            <div className="flex h-screen md:flex-row flex-col">
                <SideBar activeTab="monitor" />
                <div className="md:w-full h-full flex  justify-start bg-black text-white overflow-auto">
                    <AddMonitorComponent/>
                </div>
            </div>
        </>
        </VerifyAuth>
    )
}

export default page