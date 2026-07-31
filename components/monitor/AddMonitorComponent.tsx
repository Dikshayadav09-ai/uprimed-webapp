"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Activity, ChevronLeft, Clover, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RootState } from "@/app/redux/store/store";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";

const AddMonitorComponent = () => {
    const router = useRouter();
    const plan = useSelector((state: RootState) => state.user.plan);
    const userId = useSelector((state: RootState) => state.user.id);

    const [form, setForm] = useState({
        name: "",
        url: "",
        timing: 0,
        regions: [] as string[],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const allTimingOptions = [
        { label: "1 minute", value: 1 },
        { label: "2 minutes", value: 2 },
        { label: "5 minutes", value: 5 },
        { label: "10 minutes", value: 10 },
    ];

    const allRegionOptions = [
        "India",
        "US-East",
        "US-West",
        "Europe",
        "Asia",
        "Australia",
        "South America",
        "Africa",
        "Canada",
        "Middle East",
    ];

    const allowedTimings =
        plan === "HOBBY"
            ? [5, 10]
            : allTimingOptions.map((t) => t.value);

    const allowedRegions =
        plan === "HOBBY"
            ? ["US-East", "India"]
            : plan === "STARTUP"
                ? ["India", "US-East", "US-West", "Europe", "Asia", "Australia"]
                : allRegionOptions;

    const handleChange = (field: string, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleRegion = (region: string, isDisabled: boolean) => {
        if (isDisabled) return;
        setForm((prev) => {
            const alreadySelected = prev.regions.includes(region);
            return {
                ...prev,
                regions: alreadySelected
                    ? prev.regions.filter((r) => r !== region)
                    : [...prev.regions, region],
            };
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.name.trim()) {
            toast.error("Please enter a monitor name");
            return;
        }

        if (!form.url.trim()) {
            toast.error("Please enter a URL");
            return;
        }

        // Basic URL validation
        try {
            new URL(form.url.startsWith("http") ? form.url : `https://${form.url}`);
        } catch {
            toast.error("Please enter a valid URL");
            return;
        }

        if (form.timing === 0) {
            toast.error("Please select a check frequency");
            return;
        }

        if (form.regions.length === 0) {
            toast.error("Please select at least one region");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post("/url-endpoints", {
                user_id: userId,
                name: form.name,
                url: form.url.startsWith("http") ? form.url : `https://${form.url}`,
                frequency: form.timing * 60, // Convert minutes to seconds
                regions: form.regions
            });

            if (response.data.success) {
                toast.success("Monitor created successfully!");
                // Reset form
                setForm({
                    name: "",
                    url: "",
                    timing: 0,
                    regions: [],
                });
                // Redirect to monitors page after a short delay
                setTimeout(() => {
                    router.push("/monitor");
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to create monitor");
            }
        } catch (error: any) {
            console.error("Error creating monitor:", error);
            toast.error(error.response?.data?.message || "Failed to create monitor. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const back = () => {
        router.push("/monitor");
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 w-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-6">
                {/* Back button - always visible */}
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:bg-zinc-950 hover:text-zinc-500 cursor-pointer transition-all ease-in-out duration-300 text-sm sm:text-base"
                    onClick={() => back()}
                >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back
                </Button>

                {/* Title - hidden on small screens */}
                <div className="hidden sm:flex items-center gap-2 text-base sm:text-lg font-semibold">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                    <span>Add a Monitor</span>
                </div>

                {/* Plan button - hidden on small screens */}
                <Button
                    onClick={() => console.log("View plan clicked")}
                    className="hidden sm:flex bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-3 sm:px-4 py-2 cursor-pointer text-sm sm:text-base"
                >
                    <Clover className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-zinc-300" />
                    {plan}
                </Button>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-xl mx-auto bg-zinc-900 p-4 sm:p-6 rounded-2xl shadow-md border border-zinc-800"
            >
                <h2 className="text-lg sm:text-xl font-bold mb-6">Monitor Settings</h2>

                {/* Monitor Name */}
                <div className="mb-5">
                    <label className="block mb-2 text-xs sm:text-sm font-medium">Monitor Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Enter monitor name"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>

                {/* Endpoint URL */}
                <div className="mb-5">
                    <label className="block mb-2 text-xs sm:text-sm font-medium">Endpoint URL</label>
                    <input
                        type="text"
                        value={form.url}
                        onChange={(e) => handleChange("url", e.target.value)}
                        placeholder="https://api.domain.com"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>

                {/* Timing Options */}
                <div className="mb-5">
                    <label className="block mb-2 text-xs sm:text-sm font-medium">Check Frequency</label>
                    <div className="flex flex-wrap gap-2">
                        {allTimingOptions.map(({ label, value }) => {
                            const isDisabled = !allowedTimings.includes(value);
                            return (
                                <motion.button
                                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                    key={value}
                                    onClick={() => !isDisabled && handleChange("timing", value)}
                                    title={isDisabled ? "Upgrade plan required" : ""}
                                    className={`px-3 sm:px-4 py-2 rounded-lg border relative cursor-pointer text-xs sm:text-sm ${form.timing === value && !isDisabled
                                            ? "bg-white border-zinc-500 text-black"
                                            : isDisabled
                                                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                                                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                                        }`}
                                >
                                    {label}
                                    {isDisabled && <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-1 inline text-zinc-500" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Region Options */}
                <div className="mb-6">
                    <label className="block mb-2 text-xs sm:text-sm font-medium">Select Regions</label>
                    <div className="flex flex-wrap gap-2">
                        {allRegionOptions.map((r) => {
                            const isDisabled = !allowedRegions.includes(r);
                            return (
                                <motion.button
                                    whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                    key={r}
                                    onClick={() => toggleRegion(r, isDisabled)}
                                    title={isDisabled ? "Upgrade plan required" : ""}
                                    className={`px-3 sm:px-4 py-2 flex items-center gap-1 rounded-lg border relative cursor-pointer text-xs sm:text-sm ${form.regions.includes(r) && !isDisabled
                                            ? "bg-zinc-200 border-zinc-500 text-black"
                                            : isDisabled
                                                ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed"
                                                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                                        }`}
                                >
                                    {form.regions.includes(r) && !isDisabled && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                                    {r}
                                    {isDisabled && <Lock className="w-3 h-3 sm:w-4 sm:h-4 ml-1 text-zinc-500" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit */}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-zinc-400 text-black rounded-lg px-3 sm:px-4 py-2 cursor-pointer transition-all ease-in-out duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Creating..." : "Create Monitor"}
                </Button>
            </motion.div>
        </div>
    );
};

export default AddMonitorComponent;
