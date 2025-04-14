"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Locate, Settings, X, Check } from "lucide-react"

interface ControlPanelProps {
  isSettingPosition: boolean
  isTracking: boolean
  settingsOpen: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onLocate: () => void
  onSettings: () => void
  onCancelPositionSetting: () => void
  onConfirmPositionSetting: () => void
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isSettingPosition,
  isTracking,
  settingsOpen,
  onZoomIn,
  onZoomOut,
  onLocate,
  onSettings,
  onCancelPositionSetting,
  onConfirmPositionSetting,
}) => {
  if (isSettingPosition) {
    return (
      <div className="fixed bottom-4 right-4 z-20">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex gap-2">
          <Button
            variant="destructive"
            size="icon"
            onClick={onCancelPositionSetting}
            className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={onConfirmPositionSetting}
            className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-20">
      <div className="flex flex-col gap-2 items-end">
        {/* 控制按钮组 */}
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex flex-col gap-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none hover:bg-background/50"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none hover:bg-background/50"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant={isTracking ? "default" : "ghost"}
            size="icon"
            onClick={onLocate}
            className={`active:shadow-lg active:scale-95 transition-all duration-75 shadow-none ${isTracking ? "hover:bg-primary/90" : "hover:bg-background/50"}`}
          >
            <Locate className="h-5 w-5" />
          </Button>
          <Button
            variant={settingsOpen ? "default" : "ghost"}
            size="icon"
            onClick={onSettings}
            className={`active:shadow-lg active:scale-95 transition-all duration-75 shadow-none ${settingsOpen ? "hover:bg-primary/90" : "hover:bg-background/50"}`}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
