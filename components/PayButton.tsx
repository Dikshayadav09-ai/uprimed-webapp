"use client";
import { axiosInstance } from "@/lib/axiosInstance";
import { useState } from "react";
import { toast } from "sonner";


interface Props {
    billingId?: string;
    user?: any;
    // New props for plan payment
    type?: "bill" | "plan";
    planName?: string;
    amount?: number;
    className?: string;
    children?: React.ReactNode;
}

export default function PayButton({
    billingId,
    user,
    type = "bill",
    planName,
    amount,
    className,
    children
}: Props) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        try {
            setLoading(true);

            let order;

            if (type === "bill") {
                // Bill payment flow
                const payRes = await axiosInstance.post("/bills/pay-offer-bills", { billing_id: billingId });
                const data: any = payRes.data;

                if (!data?.success) {
                    toast.error(data?.message || "Failed to create order");
                    return;
                }
                order = data.order;
            } else {
                // Plan upgrade flow
                const payRes = await axiosInstance.post("/bills/create-plan-order", {
                    plan: planName,
                    user_id: user?.id
                });
                const data: any = payRes.data;

                if (!data?.success) {
                    toast.error(data?.message || "Failed to create order");
                    return;
                }
                order = data.order;
            }

            // Step 2: Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Referup Offer Bill Payments",
                description: "Bill Payment",
                order_id: order.id,
                handler: async function (response: any) {
                    console.log("Payment successful", response);

                    if (type === "plan") {
                        try {
                            const verifyRes = await axiosInstance.put("/auth/complete-upgrade", {
                                user_id: user?.id,
                                plan: planName
                            });

                            if (verifyRes.data.success) {
                                toast.success("Plan upgraded successfully!");
                                window.location.reload();
                            } else {
                                toast.error("Payment verification failed. Please contact support.");
                            }
                        } catch (error) {
                            console.error("Verification error", error);
                            toast.error("Error verifying payment. Please contact support.");
                        }
                    } else {
                        window.location.reload();
                    }
                },
                theme: {
                    color: "#29FF03",
                },
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Something went wrong creating the order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={className || "px-4 py-2 bg-[#29FF03] text-black font-semibold cursor-pointer rounded-md z-50"}
        >
            {loading ? "Processing..." : children || "Pay Now"}
        </button>
    );
}
