"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import SideBar from "@/components/SideBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { ArrowLeft, Edit2, Save, X, Clock, MapPin, Activity, Check, Lock, Bell, Plus, Trash2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Tick {
    id: string;
    end_point_id: string;
    status: string;
    duration_ms: string;
    created_at: string;
    updated_at: string;
}

interface Monitor {
    id: string;
    user_id: string;
    name: string;
    url: string;
    frequency: number;
    regions: string[];
    over_all_status: string;
    created_at: string;
    updated_at: string;
    ticks?: Tick[];
}

interface MonthlyStats {
    month: string;
    totalChecks: number;
    activeChecks: number;
    slowChecks: number;
    downChecks: number;
    uptimePercentage: number;
}

const MonitorDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const monitorId = params.id as string;
    const userPlan = useSelector((state: RootState) => state.user.plan);
    const userId = useSelector((state: RootState) => state.user.id); // Move to component level

    const [monitor, setMonitor] = useState<Monitor | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Alert dialog state
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [alertType, setAlertType] = useState<string>("");
    const [alertContacts, setAlertContacts] = useState<string[]>([""]); // Array of contacts
    const [alerts, setAlerts] = useState<any[]>([]); // List of existing alerts
    const [editingAlertId, setEditingAlertId] = useState<string | null>(null); // ID of alert being edited

    // Editable fields
    const [editedName, setEditedName] = useState("");
    const [editedUrl, setEditedUrl] = useState("");
    const [editedFrequency, setEditedFrequency] = useState(300);
    const [editedRegions, setEditedRegions] = useState<string[]>([]);

    // Plan-based restrictions
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

    const allowedFrequencies =
        userPlan === "HOBBY"
            ? [300, 600] // 5 and 10 minutes only
            : [60, 120, 300, 600]; // All frequencies

    const allowedRegions =
        userPlan === "HOBBY"
            ? ["US-East", "India"]
            : userPlan === "STARTUP"
                ? ["India", "US-East", "US-West", "Europe", "Asia", "Australia"]
                : allRegionOptions;

    useEffect(() => {
        fetchMonitorDetails();
        fetchMonthlyStats();
        fetchAlerts();
    }, [monitorId]);

    const fetchMonitorDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/url-endpoints/${monitorId}`);
            if (response.data.success) {
                const monitorData = response.data.data;
                setMonitor(monitorData);
                setEditedName(monitorData.name);
                setEditedUrl(monitorData.url);
                setEditedFrequency(monitorData.frequency);
                setEditedRegions(monitorData.regions);
            }
        } catch (error: any) {
            console.error("Error fetching monitor:", error);
            toast.error("Failed to load monitor details");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMonthlyStats = async () => {
        try {
            const response = await axiosInstance.get(`/url-endpoints/${monitorId}/stats/monthly`);
            if (response.data.success) {
                setMonthlyStats(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching monthly stats:", error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await axiosInstance.get(`/alerts/endpoint/${monitorId}`);
            if (response.data.success) {
                setAlerts(response.data.data);
            }
        } catch (error: any) {
            console.error("Error fetching alerts:", error);
        }
    };

    const calculateOverallUptime = () => {
        if (!monitor?.ticks || monitor.ticks.length === 0) {
            return 100; // Default to 100% when no ticks
        }

        const upTicks = monitor.ticks.filter(
            (tick) => tick.status.toLowerCase() === "active" || tick.status.toLowerCase() === "slow"
        ).length;

        return ((upTicks / monitor.ticks.length) * 100).toFixed(2);
    };

    const handleSave = async () => {
        if (editedRegions.length === 0) {
            toast.error("Please select at least one region");
            return;
        }

        try {
            setIsSaving(true);
            const response = await axiosInstance.put(`/url-endpoints/${monitorId}`, {
                name: editedName,
                url: editedUrl,
                frequency: editedFrequency,
                regions: editedRegions,
            });

            if (response.data.success) {
                toast.success("Monitor updated successfully");
                setMonitor(response.data.data);
                setIsEditing(false);
                fetchMonitorDetails();
            }
        } catch (error: any) {
            console.error("Error updating monitor:", error);
            const errorMessage = error.response?.data?.message || "Failed to update monitor";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = () => {
        if (monitor) {
            // Auto-correct frequency if not allowed for current plan
            const correctedFrequency = allowedFrequencies.includes(monitor.frequency)
                ? monitor.frequency
                : allowedFrequencies[0]; // Default to first allowed frequency

            // Filter out regions that are not allowed for current plan
            const correctedRegions = monitor.regions.filter(region =>
                allowedRegions.includes(region)
            );

            // If no regions left after filtering, select first allowed region
            const finalRegions = correctedRegions.length > 0
                ? correctedRegions
                : [allowedRegions[0]];

            setEditedName(monitor.name);
            setEditedUrl(monitor.url);
            setEditedFrequency(correctedFrequency);
            setEditedRegions(finalRegions);
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        if (monitor) {
            setEditedName(monitor.name);
            setEditedUrl(monitor.url);
            setEditedFrequency(monitor.frequency);
            setEditedRegions(monitor.regions);
        }
        setIsEditing(false);
    };

    const toggleRegion = (region: string) => {
        const isAllowed = allowedRegions.includes(region);
        if (!isAllowed) return;

        setEditedRegions((prev) => {
            const alreadySelected = prev.includes(region);
            return alreadySelected
                ? prev.filter((r) => r !== region)
                : [...prev, region];
        });
    };

    // Contact management functions
    const addContact = () => {
        setAlertContacts([...alertContacts, ""]);
    };

    const removeContact = (index: number) => {
        if (alertContacts.length > 1) {
            setAlertContacts(alertContacts.filter((_, i) => i !== index));
        }
    };

    const updateContact = (index: number, value: string) => {
        const newContacts = [...alertContacts];
        newContacts[index] = value;
        setAlertContacts(newContacts);
    };

    const handleSetAlert = async () => {
        // Filter out empty contacts
        const validContacts = alertContacts.filter(contact => contact.trim() !== "");

        if (validContacts.length === 0) {
            toast.error("Please add at least one contact");
            return;
        }

        // Validation checks
        if (!userId) {
            toast.error("User ID is missing. Please log in again.");
            return;
        }

        if (!monitorId) {
            toast.error("Monitor ID is missing.");
            return;
        }

        if (!alertType) {
            toast.error("Please select an alert type.");
            return;
        }

        const payload = {
            user_id: userId,
            end_point_id: monitorId,
            alert_type: alertType,
            contacts: validContacts,
        };

        console.log("Sending alert payload:", payload);

        try {
            const response = await axiosInstance.post("/alerts", payload);

            if (response.data.success) {
                toast.success(response.data.message);
                setIsAlertDialogOpen(false);
                setAlertType("");
                setAlertContacts([""]);
                setEditingAlertId(null);
                fetchAlerts(); // Refresh alerts list
            }
        } catch (error: any) {
            console.error("Error setting alert:", error);
            console.error("Error response:", error.response?.data);
            const errorMessage = error.response?.data?.message || "Failed to set alert";
            toast.error(errorMessage);
        }
    };

    // Edit existing alert
    const handleEditAlert = (alert: any) => {
        setEditingAlertId(alert.id);
        setAlertType(alert.alert_type);
        setAlertContacts(alert.contacts);
        setIsAlertDialogOpen(true);
    };

    // Delete alert
    const handleDeleteAlert = async (alertId: string) => {
        try {
            const response = await axiosInstance.delete(`/alerts/${alertId}`);
            if (response.data.success) {
                toast.success("Alert deleted successfully");
                fetchAlerts(); // Refresh alerts list
            }
        } catch (error: any) {
            console.error("Error deleting alert:", error);
            toast.error("Failed to delete alert");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "text-green-400 bg-green-500/20";
            case "slow":
                return "text-yellow-400 bg-yellow-500/20";
            case "down":
                return "text-red-400 bg-red-500/20";
            default:
                return "text-zinc-400 bg-zinc-500/20";
        }
    };

    const getUptimeColor = (uptime: number) => {
        if (uptime >= 75) {
            return "text-green-400";
        } else if (uptime >= 50) {
            return "text-yellow-400";
        } else {
            return "text-red-400";
        }
    };

    const formatFrequency = (seconds: number) => {
        const minutes = seconds / 60;
        if (minutes < 60) return `${minutes} min`;
        const hours = minutes / 60;
        return `${hours} hr`;
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-zinc-950">
                <SideBar activeTab="monitor" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (!monitor) {
        return (
            <div className="flex h-screen bg-zinc-950">
                <SideBar activeTab="monitor" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Monitor Not Found</h2>
                        <Button onClick={() => router.push("/monitor")}>Go Back</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-950">
            <SideBar activeTab="monitor" />
            <div className="flex-1 overflow-y-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/monitor")}
                        className="mb-4 text-zinc-400 hover:text-black transition-all ease-in duration-300 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Monitors
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{monitor.name}</h1>
                            <p className="text-zinc-400">{monitor.url}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(monitor.over_all_status)}`}>
                                {monitor.over_all_status}
                            </span>
                            <Button
                                onClick={() => setIsAlertDialogOpen(true)}
                                variant="outline"
                                className="bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20 hover:border-green-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Set Alert
                            </Button>
                            {!isEditing ? (
                                <Button onClick={handleEdit} variant="outline" className="hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer">
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Monitor Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Configuration Card */}
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-zinc-400">Monitor Name</Label>
                                {isEditing ? (
                                    <Input
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                ) : (
                                    <p className="text-white mt-1">{monitor.name}</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-zinc-400">Endpoint URL</Label>
                                {isEditing ? (
                                    <Input
                                        value={editedUrl}
                                        onChange={(e) => setEditedUrl(e.target.value)}
                                        className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                ) : (
                                    <p className="text-white mt-1 break-all">{monitor.url}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-zinc-400">Check Frequency</Label>
                                    {isEditing ? (
                                        <select
                                            value={editedFrequency}
                                            onChange={(e) => setEditedFrequency(Number(e.target.value))}
                                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2"
                                        >
                                            {allowedFrequencies.includes(60) && <option value={60}>1 minute</option>}
                                            {allowedFrequencies.includes(120) && <option value={120}>2 minutes</option>}
                                            <option value={300}>5 minutes</option>
                                            <option value={600}>10 minutes</option>
                                        </select>
                                    ) : (
                                        <p className="text-white mt-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Every {formatFrequency(monitor.frequency)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-zinc-400">Regions</Label>
                                    <p className="text-white mt-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {isEditing ? editedRegions.length : monitor.regions.length} region{(isEditing ? editedRegions.length : monitor.regions.length) !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>

                            {/* Region Selection */}
                            <div>
                                <Label className="text-zinc-400">Active Regions</Label>
                                {isEditing ? (
                                    <div className="mt-2 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {allRegionOptions.map((region) => {
                                                const isAllowed = allowedRegions.includes(region);
                                                const isSelected = editedRegions.includes(region);
                                                return (
                                                    <div
                                                        key={region}
                                                        onClick={() => toggleRegion(region)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${isSelected
                                                            ? "bg-green-500/20 border-green-500 text-green-400"
                                                            : isAllowed
                                                                ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                                                                : "bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected
                                                                ? "bg-green-500 border-green-500"
                                                                : "border-zinc-600"
                                                                }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm">{region}</span>
                                                        {!isAllowed && <Lock className="w-3 h-3 ml-auto" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {userPlan === "HOBBY" && (
                                            <p className="text-xs text-yellow-400 mt-2">
                                                Upgrade to STARTUP or ENTERPRISE for more regions
                                            </p>
                                        )}
                                        {userPlan === "STARTUP" && (
                                            <p className="text-xs text-yellow-400 mt-2">
                                                Upgrade to ENTERPRISE for all regions
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {monitor.regions.map((region) => (
                                            <span
                                                key={region}
                                                className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-sm"
                                            >
                                                {region}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Alerts Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Alerts</h2>
                        {alerts.length === 0 ? (
                            <p className="text-zinc-400">No alerts configured yet. Click "Set Alert" to add one.</p>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 flex items-start justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium uppercase">
                                                    {alert.alert_type}
                                                </span>
                                                {alert.is_active && (
                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                {alert.contacts.map((contact: string, idx: number) => (
                                                    <p key={idx} className="text-zinc-300 text-sm">
                                                        {contact}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Button
                                                onClick={() => handleEditAlert(alert)}
                                                size="sm"
                                                variant="outline"
                                                className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteAlert(alert.id)}
                                                size="sm"
                                                variant="outline"
                                                className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Uptime Card - Full Width */}
                {/* <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Overall Uptime</h2>
                    <div className="text-center">
                        <div className={`text-5xl font-bold mb-2 ${getUptimeColor(Number(calculateOverallUptime()))}`}>
                            {calculateOverallUptime()}%
                        </div>
                        <p className="text-zinc-400 text-sm">
                            Based on {monitor.ticks?.length || 0} checks
                        </p>
                    </div>
                </div> */}

                {/* Monthly Statistics */}
                {
                    monthlyStats.length > 0 && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold text-white mb-4">Monthly Uptime</h2>
                            <div className="space-y-3">
                                {monthlyStats.slice(0, 6).map((stat) => (
                                    <div key={stat.month} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white font-medium">
                                                    {new Date(stat.month + "-01").toLocaleDateString("en-US", {
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                <span className={`font-semibold ${getUptimeColor(stat.uptimePercentage)}`}>
                                                    {stat.uptimePercentage.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${stat.uptimePercentage >= 75
                                                        ? "bg-green-500"
                                                        : stat.uptimePercentage >= 50
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        }`}
                                                    style={{ width: `${stat.uptimePercentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {stat.totalChecks} checks • {stat.activeChecks} active • {stat.slowChecks} slow • {stat.downChecks} down
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }


                {/* Tick History Visualization */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Response Time History</h2>
                        <span className="text-sm text-zinc-400">
                            Last {monitor.ticks && monitor.ticks.length > 0 ? Math.min(100, monitor.ticks.length) : 100} checks
                        </span>
                    </div>

                    <TooltipProvider>
                        <div className="flex items-center gap-1 flex-wrap">
                            {(monitor.ticks && monitor.ticks.length > 0
                                ? monitor.ticks.slice(0, 100).reverse()
                                : Array(100).fill({ status: "Active", created_at: null, duration_ms: "0" })
                            ).map((tick, index) => (
                                <Tooltip key={tick.id || `placeholder-${index}`}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`w-2 h-8 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-zinc-900 ${tick.status?.toLowerCase() === "active"
                                                ? "bg-green-500 hover:ring-green-400"
                                                : tick.status?.toLowerCase() === "slow"
                                                    ? "bg-yellow-500 hover:ring-yellow-400"
                                                    : tick.status?.toLowerCase() === "down"
                                                        ? "bg-red-500 hover:ring-red-400"
                                                        : "bg-green-500 hover:ring-green-400"
                                                }`}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">
                                        <div className="text-xs">
                                            {tick.created_at ? (
                                                <>
                                                    <p className="font-semibold">{tick.status}</p>
                                                    <p className="text-zinc-400">{new Date(tick.created_at).toLocaleString()}</p>
                                                    <p className="text-zinc-400">Duration: {tick.duration_ms}ms</p>
                                                </>
                                            ) : (
                                                <p className="text-zinc-400">No data yet</p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="text-zinc-400">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                            <span className="text-zinc-400">Slow</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="text-zinc-400">Down</span>
                        </div>
                    </div>
                </div>
{/* Tick History */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Checks</h2>
                {monitor.ticks && monitor.ticks.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        <TooltipProvider>
                            {monitor.ticks.slice(0, 50).map((tick) => (
                                <div
                                    key={tick.id}
                                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-750 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className={`w-3 h-3 rounded-full ${tick.status.toLowerCase() === "active"
                                                        ? "bg-green-500"
                                                        : tick.status.toLowerCase() === "slow"
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                        }`}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Status: {tick.status}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <div>
                                            <p className="text-white text-sm">
                                                {new Date(tick.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-zinc-400 text-xs">
                                                Response: {tick.duration_ms}ms
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(tick.status)}`}>
                                        {tick.status}
                                    </span>
                                </div>
                            ))}
                        </TooltipProvider>
                    </div>
                ) : (
                    <div className="text-center py-8 text-zinc-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No checks recorded yet</p>
                        <p className="text-sm">Checks will appear here once monitoring starts</p>
                    </div>
                )}
            </div>
            </div>

            {/* Alert Configuration Dialog */}
            <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            {editingAlertId ? "Edit Alert" : "Set Up Alert"}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Configure how you want to be notified when your monitor goes down or becomes slow.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Alert Type Selection */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Alert Method</Label>
                            <Select value={alertType} onValueChange={setAlertType}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select alert method" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone (SMS)</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Multiple Contact Inputs */}
                        {alertType && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-zinc-300">
                                        {alertType === "email" && "Email Addresses"}
                                        {alertType === "phone" && "Phone Numbers"}
                                        {alertType === "whatsapp" && "WhatsApp Numbers"}
                                    </Label>
                                    <Button
                                        type="button"
                                        onClick={addContact}
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white h-8"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {alertContacts.map((contact, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                type={alertType === "email" ? "email" : "tel"}
                                                value={contact}
                                                onChange={(e) => updateContact(index, e.target.value)}
                                                placeholder={
                                                    alertType === "email"
                                                        ? `email${index + 1}@example.com`
                                                        : `+1234567890`
                                                }
                                                className="bg-zinc-800 border-zinc-700 text-white flex-1"
                                            />
                                            {alertContacts.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => removeContact(index)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-500 text-red-400 hover:bg-red-500/20 h-10 px-3"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAlertDialogOpen(false);
                                setAlertType("");
                                setAlertContacts([""]);
                            }}
                            className="border-zinc-700 text-black transition-all duration-200 ease-in hover:bg-zinc-800 cursor-pointer hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSetAlert}
                            disabled={!alertType || alertContacts.every(c => c.trim() === "")}
                            className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Save Alert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
};

export default MonitorDetailPage;