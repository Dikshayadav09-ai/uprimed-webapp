"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle, Activity, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button"; // shadcn button
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store/store";
import { useRouter } from "next/navigation";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const Monitors = () => {
  const router = useRouter();
  const { name, email, id: userId } = useSelector((state: RootState) => state.user);

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonitors = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axiosInstance.get(`/url-endpoints?user_id=${userId}`);

        if (response.data.success) {
          setMonitors(response.data.data || []);
          setError(null);
        } else {
          setError(response.data.message || "Failed to fetch monitors");
          toast.error("Failed to fetch monitors");
        }
      } catch (err: any) {
        console.error("Error fetching monitors:", err);
        setError(err.response?.data?.message || "Failed to fetch monitors");
        toast.error("Failed to fetch monitors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitors();
  }, [userId]);

  const handleCreateMonitor = () => {
    router.push("/monitor/add");
  };

  const formatFrequency = (seconds: number) => {
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return `${hours} hr`;
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
        return "bg-zinc-500";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 w-full jet">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span>
            Welcome,<p className="hidden md:inline">{name ? name : email?.split("@")[0]}</p> 👋
          </span>
        </div>
        <Button
          onClick={handleCreateMonitor}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add Monitor
        </Button>
      </div>

      {/* Page Body */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Monitors</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && monitors.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
            <p className="text-zinc-400 mb-4">You don't have any monitors yet. Create one to get started.</p>
            <Button
              onClick={handleCreateMonitor}
              className="bg-white hover:bg-zinc-200 text-black"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Monitor
            </Button>
          </div>
        )}

        {/* Monitors Grid */}
        {!isLoading && monitors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                onClick={() => router.push(`/monitor/${monitor.id}`)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all cursor-pointer hover:shadow-lg hover:shadow-green-500/10"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{monitor.name}</h3>
                    <p className="text-sm text-zinc-400 break-all">{monitor.url}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(monitor.over_all_status)} ml-2 mt-1`} />
                </div>

                {/* Details */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Clock className="w-4 h-4" />
                    <span>Every {formatFrequency(monitor.frequency)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    <span>{monitor.regions.length} region{monitor.regions.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Status Badge with Tick Indicators */}
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${monitor.over_all_status.toLowerCase() === "active"
                      ? "bg-green-500/20 text-green-400"
                      : monitor.over_all_status.toLowerCase() === "slow"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : monitor.over_all_status.toLowerCase() === "down"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-zinc-500/20 text-zinc-400"
                      }`}>
                      {monitor.over_all_status}
                    </span>

                    {/* Tick Indicators */}
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        {(monitor.ticks && monitor.ticks.length > 0
                          ? monitor.ticks.slice(0, 10).reverse()
                          : Array(10).fill({ status: "Active" })
                        ).map((tick, index) => (
                          <Tooltip key={tick.id || `default-${index}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-1 h-4 rounded-full transition-all cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-offset-zinc-900 ${tick.status.toLowerCase() === "active"
                                  ? "bg-green-500 hover:ring-green-400"
                                  : tick.status.toLowerCase() === "slow"
                                    ? "bg-yellow-500 hover:ring-yellow-400"
                                    : tick.status.toLowerCase() === "down"
                                      ? "bg-red-500 hover:ring-red-400"
                                      : "bg-zinc-500 hover:ring-zinc-400"
                                  }`}
                              />
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-800 border-zinc-700 text-white">
                              <div className="text-xs">
                                <p className="font-semibold">{tick.status}</p>
                                {tick.created_at && (
                                  <>
                                    <p className="text-zinc-400">{new Date(tick.created_at).toLocaleString()}</p>
                                    <p className="text-zinc-400">Duration: {tick.duration_ms}ms</p>
                                  </>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitors;
