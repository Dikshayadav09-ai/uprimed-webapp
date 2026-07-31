"use client";

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "./axiosInstance";
import { setUser } from "@/app/redux/slice/UserSlice";
import { useRouter } from "next/navigation";
import styled from 'styled-components';

interface Props {
    children: React.ReactNode;
}

//test
const VerifyAuth: React.FC<Props> = ({ children }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const { data: res } = await axiosInstance.post("/auth/verifyAuth");

                if (res.success) {
                    dispatch(
                        setUser({
                            id: res.id,
                            data: null,
                            name: res.name,
                            email: res.email,
                            plan: res.plan,
                        })
                    );
                } else {
                    router.push("/Login");
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/Login");
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, [dispatch, router]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black text-white">
                <StyledWrapper>
                    <div className="spinner">
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                    </div>
                </StyledWrapper>
            </div>
        );
    }

    return <>{children}</>;
};

export default VerifyAuth;

const StyledWrapper = styled.div`
  .spinner {
    position: absolute;
    width: 9px;
    height: 9px;
  }

  .spinner div {
    position: absolute;
    width: 50%;
    height: 150%;
    background: #ffff;
    transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
    animation: spinner-fzua35 1s calc(var(--delay) * 1s) infinite ease;
  }

  .spinner div:nth-child(1) {
    --delay: 0.1;
    --rotation: 36;
    --translation: 150;
  }

  .spinner div:nth-child(2) {
    --delay: 0.2;
    --rotation: 72;
    --translation: 150;
  }

  .spinner div:nth-child(3) {
    --delay: 0.3;
    --rotation: 108;
    --translation: 150;
  }

  .spinner div:nth-child(4) {
    --delay: 0.4;
    --rotation: 144;
    --translation: 150;
  }

  .spinner div:nth-child(5) {
    --delay: 0.5;
    --rotation: 180;
    --translation: 150;
  }

  .spinner div:nth-child(6) {
    --delay: 0.6;
    --rotation: 216;
    --translation: 150;
  }

  .spinner div:nth-child(7) {
    --delay: 0.7;
    --rotation: 252;
    --translation: 150;
  }

  .spinner div:nth-child(8) {
    --delay: 0.8;
    --rotation: 288;
    --translation: 150;
  }

  .spinner div:nth-child(9) {
    --delay: 0.9;
    --rotation: 324;
    --translation: 150;
  }

  .spinner div:nth-child(10) {
    --delay: 1;
    --rotation: 360;
    --translation: 150;
  }

  @keyframes spinner-fzua35 {
    0%, 10%, 20%, 30%, 50%, 60%, 70%, 80%, 90%, 100% {
      transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1%));
    }

    50% {
      transform: rotate(calc(var(--rotation) * 1deg)) translate(0, calc(var(--translation) * 1.5%));
    }
  }`;


