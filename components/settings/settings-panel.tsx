"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Compass, MapPin, Ruler, ChevronDown } from "lucide-react"
import { getOrientationName } from "@/lib/map-utils"
import { useLanguage } from "@/contexts/language-context"

interface SettingsPanelProps {
  isOpen: boolean
  orientation: number
  scale: number
  currentScale: number
  onOpenCompassSetting: () => void
  onSetPosition: () => void
  onScaleChange: (value: number[]) => void
  onScaleInputChange: (value: number) => void
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  orientation,
  scale,
  currentScale,
  onOpenCompassSetting,
  onSetPosition,
  onScaleChange,
  onScaleInputChange,
  onClose,
}) => {
  const { t, language } = useLanguage()

  if (!isOpen) return null

  return (
    <Card className="fixed bottom-20 right-4 w-[90%] max-w-xs z-30 bg-background/95 backdrop-blur-md shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* 方向设置 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <h4 className="font-medium">{t.settings.orientation}</h4>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCompassSetting}
              className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            >
              {t.settings.setOrientation}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {t.compass.currentDirection}: {Math.round(orientation)}° ({getOrientationName(orientation, language)})
          </div>
        </div>

        {/* 比例尺设置 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <h4 className="font-medium">{t.settings.scale}</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="scale">{t.settings.scaleLabel}</Label>
              <span className="text-sm font-medium">{scale} {t.settings.meters}</span>
            </div>
            <Slider id="scale" min={10} max={500} step={10} value={[scale]} onValueChange={onScaleChange} />
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={scale}
              onChange={(e) => onScaleInputChange(Number(e.target.value))}
              min={1}
              className="w-24"
            />
            <span className="text-sm">{t.settings.scaleUnit}</span>
          </div>
          <div className="text-xs text-muted-foreground">{t.settings.actualScale}: {currentScale} {t.settings.scaleUnit} {t.settings.scaleChanges}</div>
        </div>

        {/* 位置设置 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h4 className="font-medium">{t.settings.position}</h4>
          </div>
          <Button
            variant="outline"
            className="w-full active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            onClick={onSetPosition}
          >
            {t.settings.setPosition}
          </Button>
          <p className="text-sm text-muted-foreground">{t.settings.positionHint}</p>
        </div>

        {/* 关闭按钮 */}
        <div className="pt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            onClick={onClose}
          >
            <ChevronDown className="h-4 w-4 mr-2" />
            {t.settings.closeSettings}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
