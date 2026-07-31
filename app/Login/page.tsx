"use client";
import React, { useEffect, useState } from "react";
import Boxes from "@/components/Boxes";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Logo from "@/components/Logo";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { axiosInstance } from "@/lib/axiosInstance";
import GoogleLoginButton from "@/components/GoogleLoginBtn";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { setLogin } from '@/app/redux/slice/LoggedInSlice'
import { UseSelector, useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import { setUser } from "../redux/slice/UserSlice";

interface LoginForm {
    email: string;
    password: string;
}

interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const Page: React.FC = () => {
    const router = useRouter()

    const [isLogin, setIsLogin] = useState<boolean>(true);


    // Password visibility toggles
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

    //otp 
    const [OtpState, setOtpState] = useState<boolean>(false)
    const [value, setValue] = useState<any>(null)

    //loading
    const [loading, setloading] = useState(false)

    // Form state
    const [loginData, setLoginData] = useState<LoginForm>({
        email: "",
        password: "",
    });

    const [signupData, setSignupData] = useState<SignupForm>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });


    const dispatch = useDispatch()
    const count = useSelector((state: RootState) => state.loggedIn)

    const [IsLoggedIN, setIsLoggedIN] = useState<boolean>(false)
    //useEffects
    useEffect(() => {
        try {
            const authToken = localStorage.getItem("authToken")
            if (!authToken) return
            verifyAuth()
        } catch (error) {
            console.log(error)
        }

    }, [])
    useEffect(() => {
        if (IsLoggedIN) {
            dispatch(setLogin(true))
            router.push('/')
        }
    }, [IsLoggedIN])


    const verifyAuth = async () => {
        const verifyAuth = await axiosInstance.post('/auth/verifyAuth')
        const res = verifyAuth.data

        if (res.success) {
            setIsLoggedIN(true)
            dispatch(setUser({ id: res.id, data: null, name: res.name, email: res.email, plan: res.plan }))
        } else {
            setIsLoggedIN(false)
        }
    }

    // Input handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "login" | "signup"
    ) => {
        const { name, value } = e.target;
        if (type === "login") {
            setLoginData((prev) => ({ ...prev, [name]: value }));
        } else {
            setSignupData((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Submit handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Your login logic here
        try {
            setloading(true)
            const loginResponse = await axiosInstance.post('/auth/login', {
                email: loginData.email,
                password: loginData.password
            })
            if (loginResponse.data.success) {
                setloading(false)
                localStorage.setItem("authToken", loginResponse.data.token)
                verifyAuth()
                toast.success("login succesfull")
            } else {
                toast.error(loginResponse.data.message)
            }
            setloading(false)

        } catch (error) {
            console.log(error)
            toast.error("try again later")
            setloading(false)
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Signup Data:", signupData);
        setloading(true)
        // Your signup logic here
        try {
            const signUpResponse = await axiosInstance.post('/auth/signup', {
                ...signupData
            })
            if (signUpResponse.data.success) {
                setloading(false)
                localStorage.setItem("authToken", signUpResponse.data.token)
                toast.success("Otp Sent")
                setOtpState(true)
            } else {
                toast.error(signUpResponse.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error("try again later")
            setloading(false)
        }
        setloading(false)
    };

    const submitOtp = async () => {
        try {
            setloading(true)
            const verificationResponse = await axiosInstance.post('/auth/verify', {
                otp: value,
                email: signupData.email
            })
            if (verificationResponse.data.success) {
                setloading(false)
                localStorage.setItem("authToken", verificationResponse.data.token)
                toast.success("verification succesfull")
                setloading(false)
                setOtpState(false)
                setIsLogin(true)
            } else {
                setloading(false)
                toast.error(verificationResponse.data.message)
            }
        } catch (error) {
            setloading(false)
            console.log(error)
            toast.error("try again later")
        }

    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex text-white overflow-hidden ubuntuM">
            {/* LEFT SIDE - FORM */}
            {OtpState ? <>
                {/* if otp state is true let him enter otp*/}

                <motion.div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8"
                    initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <h1 className="md:text-3xl text-xl font-bold mb-6 jet">
                        <div className="flex gap-5 items-center">
                            <Logo /> Get yourself verified
                        </div>
                    </h1>
                    <motion.div className="space-y-2"
                    >
                        <InputOTP
                            maxLength={6}
                            value={value}
                            onChange={(value) => setValue(value)}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="h-12 w-12 text-2xl" />
                                <InputOTPSlot index={1} className="h-12 w-12 text-2xl" />
                                <InputOTPSlot index={2} className="h-12 w-12 text-2xl" />
                                <InputOTPSlot index={3} className="h-12 w-12 text-2xl" />
                                <InputOTPSlot index={4} className="h-12 w-12 text-2xl" />
                                <InputOTPSlot index={5} className="h-12 w-12 text-2xl" />
                            </InputOTPGroup>
                        </InputOTP>
                        <div className="to-get-this-button-in-center flex items-center justify-center mt-4">
                            <button
                                type="submit"
                                className="w-1/2 p-2 bg-zinc-900 rounded hover:bg-zinc-800 transition-all ease-in-out duration-300 cursor-pointer jet flex items-center justify-center"
                                onClick={submitOtp}
                            >
                                {loading ? <><LoaderCircle className="animate-spin" /></> : "Submit OTP"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </> : <>
                {/* if otp state is false then only show form */}
                <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login" : "signup"}
                            initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
                            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                            exit={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full max-w-sm"
                        >
                            <h1 className="md:text-3xl text-xl font-bold mb-6 jet">
                                <div className="flex gap-5  items-center">
                                    <Logo /> {isLogin ? "Welcome Back" : "Create an Account"}
                                </div>
                            </h1>

                            <form
                                className="space-y-4"
                                onSubmit={isLogin ? handleLogin : handleSignup}
                            >
                                {!isLogin && (
                                    <input
                                        type="text"
                                        name="name"
                                        value={signupData.name}
                                        onChange={(e) => handleChange(e, "signup")}
                                        placeholder="Name"
                                        className="w-full p-3 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-zinc-500"
                                    />
                                )}

                                <input
                                    type="email"
                                    name="email"
                                    value={isLogin ? loginData.email : signupData.email}
                                    onChange={(e) => handleChange(e, isLogin ? "login" : "signup")}
                                    placeholder="Email"
                                    className="w-full p-3 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-zinc-500"
                                />

                                {/* Password with eye toggle */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={isLogin ? loginData.password : signupData.password}
                                        onChange={(e) => handleChange(e, isLogin ? "login" : "signup")}
                                        placeholder="Password"
                                        className="w-full p-3 pr-10 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-zinc-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Confirm Password only for signup */}
                                {!isLogin && (
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={signupData.confirmPassword}
                                            onChange={(e) => handleChange(e, "signup")}
                                            placeholder="Confirm Password"
                                            className="w-full p-3 pr-10 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:border-zinc-500"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-200"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={18} />
                                            ) : (
                                                <Eye size={18} />
                                            )}
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full p-3 bg-zinc-800 rounded hover:bg-zinc-700 transition-all ease-in-out duration-300 cursor-pointer flex items-center justify-center"
                                >
                                    {loading ? <><LoaderCircle className="animate-spin" /></> : <>{isLogin ? "Login" : "Sign Up"}</>}
                                </button>
                            </form>

                            <p className="mt-4 text-sm text-zinc-400 mb-4 ">
                                {isLogin
                                    ? "Don't have an account?"
                                    : "Already have an account?"}{" "}
                                <button
                                    className="text-zinc-200 underline cursor-pointer"
                                    onClick={() => setIsLogin(!isLogin)}
                                >
                                    {isLogin ? "Sign Up" : "Login"}
                                </button>
                            </p>
                            <GoogleLoginButton />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </>}


            {/* RIGHT SIDE - BOXES */}
            <div className="hidden lg:flex w-1/2 items-center justify-start">
                <Boxes />
            </div>
        </div>
    );
};


export default Page;