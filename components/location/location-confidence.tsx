"use client"

import type React from "react"
import { AlertTriangle, CheckCircle2, Loader2, Navigation } from "lucide-react"

export type LocationConfidenceStatus = "idle" | "requesting" | "tracking" | "error"

export interface LocationConfidenceState {
  status: LocationConfidenceStatus
  accuracy?: number
  updatedAt?: number
  message?: string
}

interface LocationConfidenceProps {
  state: LocationConfidenceState
}

const getAccuracyLabel = (accuracy?: number) => {
  if (accuracy === undefined) return "未知"
  if (accuracy <= 20) return "较好"
  if (accuracy <= 50) return "一般"
  return "较差"
}

const formatUpdateTime = (updatedAt?: number) => {
  if (!updatedAt) return ""
  return new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export const LocationConfidence: React.FC<LocationConfidenceProps> = ({ state }) => {
  const isError = state.status === "error"
  const isTracking = state.status === "tracking"
  const isRequesting = state.status === "requesting"

  return (
    <div className="fixed left-4 top-20 z-20 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-background/85 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2 font-medium">
        {isError ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : isRequesting ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : isTracking ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <Navigation className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{isError ? "定位异常" : isRequesting ? "正在定位" : isTracking ? "定位可信度" : "等待定位"}</span>
      </div>

      <div className="mt-1 text-muted-foreground">
        {isError ? (
          state.message || "无法获取当前位置"
        ) : isTracking ? (
          <>
            {state.accuracy === undefined ? "精度未知" : `精度 ±${Math.round(state.accuracy)} 米`} · {getAccuracyLabel(state.accuracy)}
            {state.updatedAt ? ` · ${formatUpdateTime(state.updatedAt)}` : ""}
          </>
        ) : (
          "请允许浏览器定位权限"
        )}
      </div>
    </div>
  )
}
