"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Crown, Sparkles, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axiosInstance";


import PayButton from "@/components/PayButton";

const SettingsPage = () => {
    const { name, email, plan, id: userId } = useSelector((state: RootState) => state.user);
    const [editedName, setEditedName] = useState(name || "");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEnterpriseDialogOpen, setIsEnterpriseDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentBill, setCurrentBill] = useState<any>(null);

    const plans = [
        {
            name: "HOBBY",
            price: "Free",
            priceAmount: 0,
            features: [
                "2 Regions (US-East, India)",
                "5 & 10 minute intervals",
                "Maximum 2 monitors",
                "Basic alerts",
                "Email support"
            ],
            limitations: [
                "Limited regions",
                "Limited check frequencies",
                "Monitor limit: 2"
            ],
            color: "zinc",
            icon: Sparkles
        },
        {
            name: "STARTUP",
            price: "₹3,999",
            priceAmount: 3999,
            period: "/month",
            features: [
                "All 6 regions worldwide",
                "All intervals (1, 2, 5, 10 min)",
                "Maximum 8 monitors",
                "Advanced alerts",
                "Priority email support",
                "Detailed analytics"
            ],
            limitations: [
                "Monitor limit: 8"
            ],
            color: "green",
            icon: Crown,
            popular: true
        },
        {
            name: "ENTERPRISE",
            price: "Custom",
            priceAmount: null,
            features: [
                "All 10+ regions worldwide",
                "Custom check intervals",
                "Unlimited monitors",
                "Advanced customization",
                "Dedicated support",
                "SLA guarantees",
                "Custom integrations",
                "Team collaboration"
            ],
            limitations: [],
            color: "purple",
            icon: Crown
        }
    ];

    React.useEffect(() => {
        const fetchBill = async () => {
            if (!userId) return;
            try {
                const res = await axiosInstance.get(`/bills/my-bill/${userId}`);
                if (res.data.success && res.data.bill) {
                    setCurrentBill(res.data.bill);
                }
            } catch (error) {
                console.error("Failed to fetch bill", error);
            }
        };
        fetchBill();
    }, [userId]);

    const handleSaveName = async () => {
        if (!editedName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        try {
            setIsSaving(true);
            const response = await axiosInstance.put(`/auth/update-profile`, {
                user_id: userId,
                name: editedName
            });

            if (response.data.success) {
                toast.success("Name updated successfully");
                setIsEditingName(false);
                // TODO: Update Redux store with new name
            }
        } catch (error: any) {
            console.error("Error updating name:", error);
            toast.error(error.response?.data?.message || "Failed to update name");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgrade = async (targetPlan: string) => {
        if (targetPlan === "ENTERPRISE") {
            setIsEnterpriseDialogOpen(true);
            return;
        }

        try {
            const response = await axiosInstance.put(`/auth/upgrade-plan`, {
                user_id: userId,
                plan: targetPlan
            });

            if (response.data.success) {
                toast.success(`Successfully upgraded to ${targetPlan} plan!`);
                // TODO: Update Redux store with new plan
            }
        } catch (error: any) {
            console.error("Error upgrading plan:", error);
            toast.error(error.response?.data?.message || "Failed to upgrade plan");
        }
    };

    const getCurrentPlanIndex = () => {
        return plans.findIndex(p => p.name === plan);
    };

    const canUpgrade = (planName: string) => {
        const currentIndex = getCurrentPlanIndex();
        const targetIndex = plans.findIndex(p => p.name === planName);
        return targetIndex > currentIndex;
    };

    return (
        <div className="flex h-screen bg-zinc-950">
            <SideBar activeTab="setting" />
            <div className="flex-1 overflow-y-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                    <p className="text-zinc-400">Manage your account and subscription</p>
                </div>

                {/* Profile Section */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                            <div className="flex gap-2">
                                <Input
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    disabled={!isEditingName}
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    placeholder="Enter your name"
                                />
                                {isEditingName ? (
                                    <>
                                        <Button
                                            onClick={handleSaveName}
                                            disabled={isSaving}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setEditedName(name || "");
                                                setIsEditingName(false);
                                            }}
                                            variant="outline"
                                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditingName(true)}
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
                            <Input
                                value={email || ""}
                                disabled
                                className="bg-zinc-800 border-zinc-700 text-zinc-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Billing Section */}
                {currentBill && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4">Pending Invoice</h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-lg font-medium text-white">{currentBill.billing_period_label}</p>
                                <p className="text-zinc-400 text-sm">
                                    Due: {new Date(currentBill.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-2xl font-bold text-white mt-2">
                                    ₹{currentBill.total}
                                </p>
                            </div>
                            <PayButton billingId={currentBill.id} />
                        </div>
                    </div>
                )}

                {/* Current Plan */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-400">{plan} Plan</p>
                            <p className="text-zinc-400 mt-1">
                                {plans.find(p => p.name === plan)?.price}
                                {plans.find(p => p.name === plan)?.period}
                            </p>
                        </div>
                        {plan !== "ENTERPRISE" && (
                            plan === "HOBBY" ? (
                                <PayButton
                                    type="plan"
                                    planName="STARTUP"
                                    amount={3999}
                                    user={{ id: userId }} // passing minimal user object needed
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium"
                                >
                                    Upgrade Plan
                                </PayButton>
                            ) : (
                                <Button
                                    onClick={() => handleUpgrade("ENTERPRISE")}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    Upgrade Plan
                                </Button>
                            )
                        )}
                    </div>
                </div>

                {/* Plans Comparison */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((planItem) => {
                            const Icon = planItem.icon;
                            const isCurrentPlan = planItem.name === plan;
                            const canUpgradeToThis = canUpgrade(planItem.name);

                            return (
                                <div
                                    key={planItem.name}
                                    className={`relative bg-zinc-900 border rounded-lg p-6 ${isCurrentPlan
                                        ? "border-green-500 ring-2 ring-green-500/20"
                                        : planItem.popular
                                            ? "border-green-500/50"
                                            : "border-zinc-800"
                                        }`}
                                >
                                    {planItem.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                POPULAR
                                            </span>
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 right-4">
                                            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                CURRENT
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-4">
                                        <Icon className={`w-6 h-6 text-${planItem.color}-400`} />
                                        <h3 className="text-xl font-bold text-white">{planItem.name}</h3>
                                    </div>

                                    <div className="mb-6">
                                        <span className="text-3xl font-bold text-white">{planItem.price}</span>
                                        {planItem.period && (
                                            <span className="text-zinc-400 ml-1">{planItem.period}</span>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {planItem.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-zinc-300 text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {canUpgradeToThis ? (
                                        planItem.name === "STARTUP" ? (
                                            <PayButton
                                                type="plan"
                                                planName="STARTUP"
                                                amount={3999}
                                                user={{ id: userId }}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium"
                                            >
                                                Upgrade to STARTUP
                                            </PayButton>
                                        ) : (
                                            <Button
                                                onClick={() => handleUpgrade(planItem.name)}
                                                className={`w-full ${planItem.name === "STARTUP"
                                                    ? "bg-green-500 hover:bg-green-600"
                                                    : "bg-purple-500 hover:bg-purple-600"
                                                    } text-white`}
                                            >
                                                Upgrade to {planItem.name}
                                            </Button>
                                        )
                                    ) : isCurrentPlan ? (
                                        <Button
                                            disabled
                                            className="w-full bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        >
                                            Current Plan
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled
                                            className="w-full bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        >
                                            Not Available
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Enterprise Contact Dialog */}
                <Dialog open={isEnterpriseDialogOpen} onOpenChange={setIsEnterpriseDialogOpen}>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Contact Sales</DialogTitle>
                            <DialogDescription className="text-zinc-400">
                                Get in touch with our sales team to discuss Enterprise plan options
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div className="bg-zinc-800 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <Phone className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Call us</p>
                                        <a
                                            href="tel:7021906522"
                                            className="text-lg font-semibold text-white hover:text-green-400 transition-colors"
                                        >
                                            +91 7021906522
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-400">Email us</p>
                                        <a
                                            href="mailto:sales@uptimed.com"
                                            className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                                        >
                                            sales@uptimed.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-zinc-400 text-center mt-4">
                                Our team will get back to you within 24 hours
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default SettingsPage;
