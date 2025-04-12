"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Compass, Locate, ZoomIn, ZoomOut, Info } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function MapNavigation() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [zoom, setZoom] = useState(1)
  const [isTracking, setIsTracking] = useState(true)
  const [heading, setHeading] = useState(0)

  // 模拟获取位置
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTracking) {
        // 在实际应用中，这里会使用地理位置API获取真实位置
        // 并根据地图校准信息转换为地图上的坐标
        setPosition({
          x: 50 + (Math.random() * 10 - 5),
          y: 50 + (Math.random() * 10 - 5),
        })

        // 模拟罗盘方向变化
        setHeading(Math.random() * 360)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isTracking])

  // 模拟请求位置权限
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (navigator.geolocation) {
          toast({
            title: "位置权限",
            description: "PicTour需要访问您的位置以提供导航服务",
          })

          // 在实际应用中，这里会请求并使用真实的地理位置
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("位置获取成功", position.coords)
            },
            (error) => {
              console.error("位置获取失败", error)
              toast({
                title: "无法获取位置",
                description: "请确保您已授予位置权限",
                variant: "destructive",
              })
              setIsTracking(false)
            },
          )
        } else {
          toast({
            title: "设备不支持",
            description: "您的设备不支持地理位置功能",
            variant: "destructive",
          })
          setIsTracking(false)
        }
      } catch (error) {
        console.error("位置权限请求失败", error)
      }
    }

    requestLocationPermission()
  }, [toast])

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }

  const toggleTracking = () => {
    setIsTracking(!isTracking)
    if (!isTracking) {
      toast({
        title: "位置跟踪已开启",
        description: "地图将自动跟随您的位置",
      })
    }
  }

  return (
    <div className="relative w-full h-screen bg-muted">
      {/* 地图容器 */}
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute w-full h-full transition-transform duration-300"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <Image src="/placeholder.svg?height=800&width=600" alt="Navigation map" fill className="object-contain" />

          {/* 用户位置标记 */}
          <div
            className="absolute z-10"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              {/* 方向指示器 */}
              <div
                className="absolute -top-6 w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-blue-500 left-1/2 -ml-2 transition-transform"
                style={{ transform: `rotate(${heading}deg)` }}
              />

              {/* 用户位置点 */}
              <div className="w-4 h-4 bg-blue-500 rounded-full relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="absolute bottom-8 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm h-12 w-12 rounded-full"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/80 backdrop-blur-sm h-12 w-12 rounded-full"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-6 w-6" />
        </Button>
        <Button
          variant={isTracking ? "default" : "outline"}
          size="icon"
          className={`${isTracking ? "bg-primary" : "bg-background/80 backdrop-blur-sm"} h-12 w-12 rounded-full`}
          onClick={toggleTracking}
        >
          <Locate className="h-6 w-6" />
        </Button>
      </div>

      {/* 罗盘 */}
      <div className="absolute top-4 right-4">
        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full">
          <div className="relative w-12 h-12" style={{ transform: `rotate(${-heading}deg)` }}>
            <Compass className="h-12 w-12 text-primary" />
            <div className="absolute top-0 left-1/2 -ml-0.5 h-2 w-1 bg-destructive" />
          </div>
        </div>
      </div>

      {/* 信息面板 */}
      <div className="absolute bottom-8 left-4">
        <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm h-12 w-12 rounded-full">
          <Info className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
