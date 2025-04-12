"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Camera,
  Upload,
  Settings,
  Compass,
  MapPin,
  Ruler,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  ImagePlus,
} from "lucide-react"

export default function Home() {
  // 状态管理
  const [mapImage, setMapImage] = useState<string>("/placeholder.svg?height=800&width=1200")
  const [orientation, setOrientation] = useState(0) // 角度
  const [scale, setScale] = useState(100)
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 })
  const [zoom, setZoom] = useState(1)
  const [isTracking, setIsTracking] = useState(false)
  const [heading, setHeading] = useState(0)
  const [isDraggingMap, setIsDraggingMap] = useState(false)
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [isSettingPosition, setIsSettingPosition] = useState(false)
  const [compassDialogOpen, setCompassDialogOpen] = useState(false)
  const [tempOrientation, setTempOrientation] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const compassRef = useRef<HTMLDivElement>(null)

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setMapImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 模拟相机拍摄
  const handleCameraCapture = () => {
    // 在实际应用中，这里会调用设备相机API
    // 为了演示，我们使用一个示例图片
    setMapImage("/placeholder.svg?height=800&width=1200&text=Camera+Capture")
  }

  // 处理地图拖动
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSettingPosition) return

    setIsDraggingMap(true)
    setStartDragPos({ x: e.clientX, y: e.clientY })
  }

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMap || !isSettingPosition) return

    const deltaX = e.clientX - startDragPos.x
    const deltaY = e.clientY - startDragPos.y

    setMapOffset({
      x: mapOffset.x + deltaX,
      y: mapOffset.y + deltaY,
    })

    setStartDragPos({ x: e.clientX, y: e.clientY })
  }

  const handleMapMouseUp = () => {
    setIsDraggingMap(false)
  }

  // 处理触摸事件
  const handleMapTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSettingPosition) return

    setIsDraggingMap(true)
    setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleMapTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingMap || !isSettingPosition) return

    const deltaX = e.touches[0].clientX - startDragPos.x
    const deltaY = e.touches[0].clientY - startDragPos.y

    setMapOffset({
      x: mapOffset.x + deltaX,
      y: mapOffset.y + deltaY,
    })

    setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleMapTouchEnd = () => {
    setIsDraggingMap(false)
  }

  // 处理缩放
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5))

  // 罗盘旋转
  const handleCompassMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!compassRef.current) return

    const compassRect = compassRef.current.getBoundingClientRect()
    const compassCenterX = compassRect.left + compassRect.width / 2
    const compassCenterY = compassRect.top + compassRect.height / 2

    const angle = Math.atan2(e.clientY - compassCenterY, e.clientX - compassCenterX) * (180 / Math.PI) + 90

    setTempOrientation(angle < 0 ? angle + 360 : angle)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newAngle =
        Math.atan2(moveEvent.clientY - compassCenterY, moveEvent.clientX - compassCenterX) * (180 / Math.PI) + 90

      setTempOrientation(newAngle < 0 ? newAngle + 360 : newAngle)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // 确认罗盘设置
  const confirmCompassSetting = () => {
    setOrientation(tempOrientation)
    setCompassDialogOpen(false)
  }

  // 模拟位置跟踪
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking) {
      interval = setInterval(() => {
        // 在实际应用中，这里会使用地理位置API获取真实位置
        setUserPosition({
          x: 50 + (Math.random() * 10 - 5),
          y: 50 + (Math.random() * 10 - 5),
        })

        // 模拟罗盘方向变化
        setHeading(Math.random() * 360)
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking])

  // 请求位置权限
  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("位置获取成功", position.coords)
          setIsTracking(true)
        },
        (error) => {
          console.error("位置获取失败", error)
          alert("无法获取位置，请确保您已授予位置权限")
        },
      )
    } else {
      alert("您的设备不支持地理位置功能")
    }
  }

  // 完成位置设置
  const completePositionSetting = () => {
    // 计算当前中心点在地图上的位置
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // 根据当前偏移和缩放计算实际位置
      const posX = 50 - (mapOffset.x / (rect.width * zoom)) * 100
      const posY = 50 - (mapOffset.y / (rect.height * zoom)) * 100

      setUserPosition({ x: posX, y: posY })
    }

    setIsSettingPosition(false)
    setMapOffset({ x: 0, y: 0 })
  }

  // 计算方向名称
  const getOrientationName = (angle: number) => {
    if (angle >= 337.5 || angle < 22.5) return "北"
    if (angle >= 22.5 && angle < 67.5) return "东北"
    if (angle >= 67.5 && angle < 112.5) return "东"
    if (angle >= 112.5 && angle < 157.5) return "东南"
    if (angle >= 157.5 && angle < 202.5) return "南"
    if (angle >= 202.5 && angle < 247.5) return "西南"
    if (angle >= 247.5 && angle < 292.5) return "西"
    return "西北"
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* 地图全屏背景 */}
      <div
        ref={mapContainerRef}
        className="fixed inset-0 w-full h-full bg-muted"
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMapMouseMove}
        onMouseUp={handleMapMouseUp}
        onMouseLeave={handleMapMouseUp}
        onTouchStart={handleMapTouchStart}
        onTouchMove={handleMapTouchMove}
        onTouchEnd={handleMapTouchEnd}
      >
        <div
          className="absolute w-full h-full transition-transform duration-300"
          style={{
            transform: `scale(${zoom}) translate(${mapOffset.x}px, ${mapOffset.y}px)`,
          }}
        >
          <Image src={mapImage || "/placeholder.svg"} alt="Map" fill className="object-cover" priority />
        </div>

        {/* 用户位置标记 */}
        {!isSettingPosition && (
          <div
            className="absolute z-10"
            style={{
              left: `${userPosition.x}%`,
              top: `${userPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              {/* 方向指示器 */}
              {isTracking && (
                <div
                  className="absolute -top-6 w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-blue-500 left-1/2 -ml-2 transition-transform"
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              )}

              {/* 用户位置点 */}
              <div className="w-4 h-4 bg-blue-500 rounded-full relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
        )}

        {/* 位置设置模式下的中心图钉 */}
        {isSettingPosition && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <MapPin className="h-12 w-12 text-destructive" strokeWidth={3} />
          </div>
        )}

        {/* 方向指示器 - 罗盘覆盖在地图上 */}
        <div className="absolute top-20 right-4 z-10">
          <div className="relative w-16 h-16 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Compass className="h-10 w-10 text-primary" />
            <div
              className="absolute w-1 h-8 bg-destructive"
              style={{
                top: "4px",
                left: "50%",
                marginLeft: "-0.5px",
                transformOrigin: "bottom center",
                transform: `rotate(${orientation}deg)`,
              }}
            />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold">北</div>
          </div>
        </div>

        {/* 比例尺 - 移到左下方 */}
        <div className="absolute bottom-8 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 z-10">
          <div className="w-16 h-1 bg-foreground"></div>
          <span className="text-xs">{scale}米</span>
        </div>
      </div>

      {/* 顶部标题栏 */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold">PicTour</h1>

        {/* 更明显的拍照和上传按钮 */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1 bg-background/90" onClick={handleCameraCapture}>
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">拍照</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1 bg-background/90"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">上传</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </Button>
        </div>
      </div>

      {/* 右下角控制按钮 */}
      <div className="fixed bottom-4 right-4 z-20">
        {/* 位置设置模式下的控制按钮 */}
        {isSettingPosition ? (
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex gap-2">
            <Button variant="destructive" size="icon" onClick={() => setIsSettingPosition(false)}>
              <X className="h-5 w-5" />
            </Button>
            <Button variant="default" size="icon" onClick={completePositionSetting}>
              <Check className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            {/* 控制按钮组 */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex flex-col gap-2 shadow-lg">
              <Button variant="ghost" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant={isTracking ? "default" : "ghost"}
                size="icon"
                onClick={() => (isTracking ? setIsTracking(false) : requestLocationPermission())}
              >
                <Locate className="h-5 w-5" />
              </Button>
              <Button
                variant={settingsOpen ? "default" : "ghost"}
                size="icon"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮设置面板 */}
      {settingsOpen && (
        <Card className="fixed bottom-20 right-4 w-[90%] max-w-xs z-30 bg-background/95 backdrop-blur-md shadow-lg">
          <CardContent className="p-4 space-y-4">
            {/* 方向设置 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">地图方向</h4>
                </div>
                <Dialog open={compassDialogOpen} onOpenChange={setCompassDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      设置方向
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <div className="flex flex-col items-center gap-4">
                      <h3 className="text-lg font-medium">旋转罗盘设置方向</h3>
                      <div
                        ref={compassRef}
                        className="relative w-64 h-64 border-4 border-primary rounded-full flex items-center justify-center cursor-pointer"
                        onMouseDown={handleCompassMouseDown}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Compass className="h-32 w-32 text-primary" />
                        </div>
                        <div
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-destructive"
                          style={{ transform: `rotate(${tempOrientation}deg)`, transformOrigin: "bottom center" }}
                        />
                        {/* 方向标记 */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 font-bold">北</div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold">南</div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">西</div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold">东</div>
                      </div>
                      <div className="flex gap-4 w-full">
                        <Button variant="outline" className="flex-1" onClick={() => setTempOrientation(0)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          重置
                        </Button>
                        <Button className="flex-1" onClick={confirmCompassSetting}>
                          确认
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-sm text-muted-foreground">
                当前方向: {Math.round(orientation)}° ({getOrientationName(orientation)})
              </div>
            </div>

            {/* 比例尺设置 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <h4 className="font-medium">比例尺</h4>
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
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  min={1}
                  className="w-24"
                />
                <span className="text-sm">米/厘米</span>
              </div>
            </div>

            {/* 位置设置 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="font-medium">当前位置</h4>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSettingPosition(true)
                  setSettingsOpen(false)
                }}
              >
                设置当前位置
              </Button>
              <p className="text-sm text-muted-foreground">点击按钮后，拖动地图使图钉指向您的当前位置</p>
            </div>

            {/* 关闭按钮 */}
            <div className="pt-2 flex justify-center">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setSettingsOpen(false)}>
                <ChevronDown className="h-4 w-4 mr-2" />
                关闭设置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
