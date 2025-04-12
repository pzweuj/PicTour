"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CompassIcon, Ruler, MapPin } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function MapCalibration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orientation, setOrientation] = useState("north")
  const [scale, setScale] = useState(100)
  const [referencePoint, setReferencePoint] = useState({ x: 50, y: 50 })

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // 完成校准，导航到导航页面
      router.push("/navigation")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full aspect-[3/4] max-h-[300px] overflow-hidden rounded-md border mb-4">
        <Image src="/placeholder.svg?height=400&width=300" alt="Map for calibration" fill className="object-contain" />

        {step === 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full">
              <CompassIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-full">
              <Ruler className="h-12 w-12 text-primary" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            className="absolute"
            style={{
              left: `${referencePoint.x}%`,
              top: `${referencePoint.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <MapPin className="h-8 w-8 text-destructive" />
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CompassIcon className="h-5 w-5 text-primary" />
            <h3 className="font-medium">步骤 1: 设置地图方位</h3>
          </div>

          <RadioGroup value={orientation} onValueChange={setOrientation} className="grid grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="north" id="north" className="peer sr-only" />
              <Label
                htmlFor="north"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>北向上</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="south" id="south" className="peer sr-only" />
              <Label
                htmlFor="south"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>南向上</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="east" id="east" className="peer sr-only" />
              <Label
                htmlFor="east"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>东向上</span>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="west" id="west" className="peer sr-only" />
              <Label
                htmlFor="west"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span>西向上</span>
              </Label>
            </div>
          </RadioGroup>

          <p className="text-sm text-muted-foreground">请选择地图上方位标识的朝向，这将帮助我们正确定位您的位置。</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />
            <h3 className="font-medium">步骤 2: 设置比例尺</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="scale">比例尺 (米/厘米)</Label>
              <span className="text-sm font-medium">{scale} 米</span>
            </div>
            <Slider
              id="scale"
              min={10}
              max={500}
              step={10}
              value={[scale]}
              onValueChange={(value) => setScale(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-scale">或输入精确值</Label>
            <Input
              id="custom-scale"
              type="number"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              min={1}
            />
          </div>

          <p className="text-sm text-muted-foreground">请设置地图上的比例尺，即地图上1厘米代表实际距离的米数。</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium">步骤 3: 标记参考点</h3>
          </div>

          <p className="text-sm">请在地图上点击一个您知道确切位置的参考点，例如入口、标志性建筑等。</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref-name">参考点名称</Label>
              <Input id="ref-name" placeholder="例如：南门入口" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref-desc">简短描述</Label>
              <Input id="ref-desc" placeholder="例如：主要入口处" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">标记参考点将帮助我们更准确地计算您在地图上的位置。</p>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          上一步
        </Button>
        <Button onClick={handleNext}>{step === 3 ? "完成校准" : "下一步"}</Button>
      </div>
    </div>
  )
}
