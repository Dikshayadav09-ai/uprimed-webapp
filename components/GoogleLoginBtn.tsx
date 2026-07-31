"use client"
declare global {
  interface Window {
    google: any;
  }
}


import { axiosInstance } from "@/lib/axiosInstance";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import { setLogin } from '@/app/redux/slice/LoggedInSlice'
import { setUser } from "@/app/redux/slice/UserSlice";

export default function GoogleLoginButton() {
  //router from react navigation
  const router = useRouter()
  const dispatch = useDispatch()

  //state for double verification
  const [IsLoggedIN, setIsLoggedIN] = useState<boolean>(false)
  const count = useSelector((state: RootState) => state.loggedIn)


  //checker
  useEffect(() => {
    if (IsLoggedIN) {
      dispatch(setLogin(true))
      router.push('/')
    }
  }, [IsLoggedIN])

  //main google handler
  useEffect(() => {
    const initGoogle = () => {
      if (typeof window !== "undefined" && window.google) {
        window.google.accounts.id.initialize({
          client_id: "385505549008-0o6bimc5j1t9pm3hqmr28912l5ivrfei.apps.googleusercontent.com",
          callback: async (response: any) => {
            try {
              const responseFromSerever = await axiosInstance.post('/auth/googleLogin', {
                token: response.credential
              })
              console.log(responseFromSerever.data.token)
              localStorage.setItem("authToken", responseFromSerever.data.token)
              verifyAuth()
              toast.success("logined successFully")
            } catch (error) {
              console.log(error)
              toast.error("some error occuerd")
            }
          },
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn")!,
          { theme: "outline", size: "large" }
        );
      } else {
        console.warn("Google script not yet loaded");
      }
    };
    initGoogle();
  }, []);


  //an function that checks verify auth
  const verifyAuth = async () => {
    const verifyAuth = await axiosInstance.post('/auth/verifyAuth')
    const res = verifyAuth.data
    console.log(res)
    const id: string = res.id
    if (res.success) {
      dispatch(setUser({ id: id, data: null, name: res.name, email: res.email, plan: res.plan }))
      setIsLoggedIN(true)
    } else {
      setIsLoggedIN(false)
    }
  }

  return <div id="googleBtn" className="bg-zinc-900 ml-1"></div>;
}
