"use client";

import React, { useState, useEffect } from "react";
import { Activity, TrendingUp, AlertCircle, CheckCircle, Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import { axiosInstance } from "@/lib/axiosInstance";
import { useRouter } from "next/navigation";

interface Monitor {
    id: string;
    name: string;
    url: string;
    over_all_status: string;
    frequency: number;
    regions: string[];
    created_at: string;
    ticks?: any[];
}

const HomeComponent = () => {
    const router = useRouter();
    const { name, email, plan, id: userId } = useSelector((state: RootState) => state.user);
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        down: 0,
        slow: 0,
    });

    useEffect(() => {
        fetchMonitors();
    }, [userId]);

    const fetchMonitors = async () => {
        try {
            setIsLoading(true);
            console.log("Fetching monitors for user:", userId);

            if (!userId) {
                console.error("No user ID available");
                setIsLoading(false);
                return;
            }

            const response = await axiosInstance.get(`/url-endpoints?user_id=${userId}`);
            console.log("Monitors response:", response.data);

            if (response.data.success) {
                const monitorData = response.data.data;
                setMonitors(monitorData);

                // Calculate stats
                const total = monitorData.length;
                const active = monitorData.filter((m: Monitor) => m.over_all_status.toLowerCase() === "active").length;
                const down = monitorData.filter((m: Monitor) => m.over_all_status.toLowerCase() === "down").length;
                const slow = monitorData.filter((m: Monitor) => m.over_all_status.toLowerCase() === "slow").length;

                setStats({ total, active, down, slow });
            }
        } catch (error: any) {
            console.error("Error fetching monitors:", error);
            console.error("Error response:", error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateUptime = (monitor: Monitor) => {
        if (!monitor.ticks || monitor.ticks.length === 0) return "100";
        const upTicks = monitor.ticks.filter(
            (tick) => tick.status.toLowerCase() === "active" || tick.status.toLowerCase() === "slow"
        ).length;
        return ((upTicks / monitor.ticks.length) * 100).toFixed(1);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-500";
            case "slow":
                return "bg-yellow-500";
            case "down":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "bg-green-500/20 text-green-400 border-green-500/30";
            case "slow":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case "down":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 w-full overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Welcome back, {name || email?.split("@")[0]} 👋
                        </h1>
                        <p className="text-zinc-400">Here's what's happening with your monitors today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <span className="text-green-400 font-semibold">{plan} Plan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Monitors */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-2xl font-bold text-white">{stats.total}</span>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Total Monitors</h3>
                </div>

                {/* Active Monitors */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <span className="text-2xl font-bold text-green-400">{stats.active}</span>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Active</h3>
                </div>

                {/* Slow Monitors */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <span className="text-2xl font-bold text-yellow-400">{stats.slow}</span>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Slow</h3>
                </div>

                {/* Down Monitors */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-2xl font-bold text-red-400">{stats.down}</span>
                    </div>
                    <h3 className="text-zinc-400 text-sm font-medium">Down</h3>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                        onClick={() => router.push("/monitor/add")}
                        className="bg-green-500 hover:bg-green-600 text-white p-6 h-auto justify-between cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">Add New Monitor</p>
                                <p className="text-sm text-green-100">Start monitoring a new endpoint</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </Button>

                    <Button
                        onClick={() => router.push("/monitor")}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white p-6 h-auto justify-between cursor-pointer transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold">View All Monitors</p>
                                <p className="text-sm text-zinc-300">See detailed monitor analytics</p>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Recent Monitors */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Your Monitors</h2>
                    {monitors.length > 0 && (
                        <Button
                            onClick={() => router.push("/monitor")}
                            variant="outline"
                            className="text-black hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
                        >
                            View All
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : monitors.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                        <Activity className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No monitors yet</h3>
                        <p className="text-zinc-400 mb-6">Get started by adding your first monitor</p>
                        <Button
                            onClick={() => router.push("/monitor/add")}
                            className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Monitor
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monitors.slice(0, 6).map((monitor) => (
                            <div
                                key={monitor.id}
                                onClick={() => router.push(`/monitor/${monitor.id}`)}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-zinc-700 cursor-pointer transition-all hover:shadow-lg group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-green-400 transition-colors">
                                            {monitor.name}
                                        </h3>
                                        <p className="text-sm text-zinc-400 truncate">{monitor.url}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(
                                            monitor.over_all_status
                                        )}`}
                                    >
                                        {monitor.over_all_status}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <div className="text-zinc-400">
                                        Uptime: <span className="text-white font-semibold">{calculateUptime(monitor)}%</span>
                                    </div>
                                    <div className="text-zinc-400">
                                        Every <span className="text-white font-semibold">{monitor.frequency / 60}m</span>
                                    </div>
                                </div>

                                {/* Tick History */}
                                {monitor.ticks && monitor.ticks.length > 0 && (
                                    <div className="flex gap-1">
                                        {monitor.ticks.slice(-20).map((tick, index) => (
                                            <div
                                                key={index}
                                                className={`flex-1 h-2 rounded-full ${getStatusColor(tick.status)}`}
                                                title={`${tick.status} - ${new Date(tick.created_at).toLocaleString()}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeComponent;
