"use client"

import type React from "react"
import { CheckCircle2, Crosshair, Loader2 } from "lucide-react"
import type { CalibrationPoint } from "@/lib/location-utils"
import { Button } from "@/components/ui/button"

interface CalibrationStatusProps {
  step: "point1" | "point2"
  points: CalibrationPoint[]
  isCapturing: boolean
  onRestart: () => void
}

const formatAccuracy = (accuracy?: number) => {
  if (accuracy === undefined) return "精度未知"
  return `精度 ±${Math.round(accuracy)} 米`
}

export const CalibrationStatus: React.FC<CalibrationStatusProps> = ({ step, points, isCapturing, onRestart }) => {
  const firstPoint = points[0]

  return (
    <div className="fixed left-4 top-36 z-30 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-background/90 px-3 py-3 text-xs shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 font-medium">
        {isCapturing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Crosshair className="h-4 w-4 text-primary" />}
        <span>两点校准 · {step === "point1" ? "第 1 点" : "第 2 点"}</span>
      </div>

      <div className="mt-2 space-y-1 text-muted-foreground">
        <div className="flex items-center gap-2">
          {firstPoint ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />}
          <span>第 1 点 {firstPoint ? `已采集 · ${formatAccuracy(firstPoint.gpsCoord.accuracy)}` : "待采集"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
          <span>第 2 点 {step === "point2" ? "请移动至少 10 米后采集" : "待采集"}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-2 h-7 w-full text-xs"
        onClick={onRestart}
        disabled={isCapturing}
      >
        重新开始校准
      </Button>
    </div>
  )
}
