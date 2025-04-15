"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MapView } from "@/components/map/map-view"
import { MiniCompass } from "@/components/compass/mini-compass"
import { CompassSetting } from "@/components/compass/compass-setting"
import { ControlPanel } from "@/components/controls/control-panel"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { Toolbar } from "@/components/toolbar/toolbar"
import { LocationTracker } from "@/components/location/location-tracker"
import type { MapCoordinate, ImageSize, MapOffset } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { GuideModal } from "@/components/guide/guide-modal"

export default function Home() {
  // 状态管理
  const [mapImage, setMapImage] = useState<string>("/placeholder.svg?height=800&width=1200")
  const [orientation, setOrientation] = useState(0) // 角度
  const [scale, setScale] = useState(100) // 比例尺：米/厘米
  const [zoom, setZoom] = useState(1) // 缩放级别
  const [heading, setHeading] = useState(0) // 用户朝向
  const [mapOffset, setMapOffset] = useState<MapOffset>({ x: 0, y: 0 }) // 地图偏移量
  const [isSettingPosition, setIsSettingPosition] = useState(false) // 是否正在设置位置
  const [isSettingOrientation, setIsSettingOrientation] = useState(false) // 是否正在设置方向
  const [tempOrientation, setTempOrientation] = useState(0) // 临时方向
  const [settingsOpen, setSettingsOpen] = useState(false) // 是否打开设置面板
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("未知") // 位置权限状态
  const [locationError, setLocationError] = useState<string | null>(null) // 位置错误信息
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 1200, height: 800 }) // 图片实际尺寸
  const [userPosition, setUserPosition] = useState<MapCoordinate>({ x: 600, y: 400 }) // 用户在图片上的位置（像素）
  const [isGuideOpen, setIsGuideOpen] = useState(false) // 是否打开指引

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // 首次访问时自动打开指引
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem("pictour-guide-seen")
    if (!hasSeenGuide) {
      // 延迟一秒打开指引，让页面先加载完成
      const timer = setTimeout(() => {
        setIsGuideOpen(true)
        localStorage.setItem("pictour-guide-seen", "true")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // 初始化tempOrientation
  useEffect(() => {
    setTempOrientation(orientation)
  }, [orientation, isSettingOrientation])

  // 加载图片时获取图片尺寸
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
      // 初始化用户位置在图片中心
      setUserPosition({ x: img.width / 2, y: img.height / 2 })
    }
    img.src = mapImage
  }, [mapImage])

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setMapImage(event.target.result as string)
          // 重置缩放和位置
          setZoom(1)
          setMapOffset({ x: 0, y: 0 })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理缩放
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5))

  // 计算当前比例尺值（考虑缩放）
  const getCurrentScale = () => {
    return Math.round(scale / zoom)
  }

  // 确认罗盘设置
  const confirmCompassSetting = () => {
    setOrientation(tempOrientation)
    setIsSettingOrientation(false)
  }

  // 在组件加载时检查位置权限并自动启动位置跟踪
  useEffect(() => {
    checkLocationPermission()

    // 添加一个延迟的权限检查，确保在某些浏览器中能正确触发
    const timer = setTimeout(() => {
      if (locationPermissionStatus === "未知" || locationPermissionStatus === "prompt") {
        console.log("尝试预热位置权限请求")
        // 预热位置请求，可能会触发权限提示
        navigator.geolocation.getCurrentPosition(
          () => {
            console.log("位置预热成功")
            // 位置权限获取成功后自动开始跟踪
            startLocationTracking()
          },
          (err) => console.log("位置预热失败", err.code),
          { timeout: 3000, maximumAge: 0 },
        )
      } else if (locationPermissionStatus === "granted") {
        // 如果已经有权限，自动开始跟踪
        startLocationTracking()
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [locationPermissionStatus])

  // 检查位置权限状态
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermissionStatus("不支持")
      return
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        setLocationPermissionStatus(result.state)

        // 监听权限变化
        result.addEventListener("change", () => {
          setLocationPermissionStatus(result.state)
          // 如果权限变为授予，自动开始跟踪
          if (result.state === "granted") {
            startLocationTracking()
          }
        })
      } catch (error) {
        console.error("权限查询失败", error)
        setLocationPermissionStatus("未知")
      }
    } else {
      // 如果不支持permissions API，尝试获取位置来检查权限
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationPermissionStatus("granted")
          startLocationTracking()
        },
        () => setLocationPermissionStatus("denied"),
        { timeout: 3000 },
      )
    }
  }

  // 开始位置跟踪
  const startLocationTracking = () => {
    if (navigator.geolocation) {
      // 不显示toast，静默启动位置跟踪
      console.log("开始位置跟踪")
    } else {
      console.error("设备不支持地理位置功能")
    }
  }

  // 将地图中心移动到用户位置
  const centerMapOnUser = () => {
    if (!mapContainerRef.current) return

    // 获取容器尺寸
    const containerRect = mapContainerRef.current.getBoundingClientRect()
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // 计算用户位置相对于图片中心的偏移（考虑缩放）
    const deltaX = (userPosition.x - imageSize.width / 2) * zoom
    const deltaY = (userPosition.y - imageSize.height / 2) * zoom

    // 计算需要的地图偏移量，使用户位置显示在屏幕中心
    setMapOffset({
      x: -deltaX,
      y: -deltaY,
    })

    toast({
      title: "已定位到当前位置",
      duration: 2000,
    })
  }

  // 处理定位按钮点击 - 现在只用于居中显示用户位置
  const handleLocateClick = () => {
    centerMapOnUser()
  }

  // 处理位置更新
  const handleLocationUpdate = (newPosition: MapCoordinate, newHeading: number) => {
    setUserPosition(newPosition)
    if (newHeading !== 0) {
      setHeading(newHeading)
    }
  }

  // 处理位置错误
  const handleLocationError = (error: string) => {
    setLocationError(error)
    toast({
      title: "位置跟踪错误",
      description: error,
      variant: "destructive",
    })
  }

  // 打开罗盘设置
  const openCompassSetting = () => {
    setTempOrientation(orientation)
    setIsSettingOrientation(true)
    setSettingsOpen(false)
  }

  // 打开位置设置
  const openPositionSetting = () => {
    setIsSettingPosition(true)
    setSettingsOpen(false)
  }

  // 打开地图文件选择
  const openMapFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* 地图视图 */}
      <MapView
        mapImage={mapImage}
        zoom={zoom}
        mapOffset={mapOffset}
        isSettingPosition={isSettingPosition}
        isTracking={true} // 始终显示用户位置标记
        heading={heading}
        userPosition={userPosition}
        imageSize={imageSize}
        scale={scale}
        onMapOffsetChange={setMapOffset}
        onZoomChange={setZoom}
        onUserPositionSet={(position) => {
          setUserPosition(position)
          setIsSettingPosition(false)
          toast({
            title: "位置已设置",
            description: "您的位置已在地图上更新",
          })
        }}
        mapContainerRef={mapContainerRef as React.RefObject<HTMLDivElement>}
      />

      {/* 小型罗盘 */}
      <MiniCompass orientation={orientation} onClick={openCompassSetting} />

      {/* 顶部工具栏 */}
      <Toolbar
        onOpenMap={openMapFileSelect}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        onGuideClick={() => setIsGuideOpen(true)}
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* 使用指南弹窗 */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 控制面板 */}
      <ControlPanel
        isSettingPosition={isSettingPosition}
        settingsOpen={settingsOpen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocateClick}
        onSettings={() => setSettingsOpen(!settingsOpen)}
        onCancelPositionSetting={() => {
          setIsSettingPosition(false)
        }}
        onConfirmPositionSetting={() => {
          if (mapContainerRef.current) {
            const containerRect = mapContainerRef.current.getBoundingClientRect()
            const centerX = containerRect.width / 2
            const centerY = containerRect.height / 2

            // 获取屏幕中心对应的地图坐标
            import("@/lib/map-utils").then(({ screenToMapCoordinate }) => {
              const mapCoord = screenToMapCoordinate(
                { x: centerX, y: centerY },
                containerRect,
                imageSize,
                mapOffset,
                zoom,
              )

              // 更新用户位置
              setUserPosition(mapCoord)
              setIsSettingPosition(false)

              toast({
                title: "位置已设置",
                description: "您的位置已在地图上更新",
              })
            })
          }
        }}
      />

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        orientation={orientation}
        scale={scale}
        currentScale={getCurrentScale()}
        onOpenCompassSetting={openCompassSetting}
        onSetPosition={openPositionSetting}
        onScaleChange={(value) => setScale(value[0])}
        onScaleInputChange={(value) => setScale(value)}
        onClose={() => setSettingsOpen(false)}
      />

      {/* 罗盘设置全屏模式 */}
      {isSettingOrientation && (
        <CompassSetting
          tempOrientation={tempOrientation}
          setTempOrientation={setTempOrientation}
          onConfirm={confirmCompassSetting}
        />
      )}

      {/* 位置跟踪器 - 始终保持活跃 */}
      <LocationTracker
        isTracking={true}
        userPosition={userPosition}
        orientation={orientation}
        scale={scale}
        onLocationUpdate={handleLocationUpdate}
        onError={handleLocationError}
      />

      {/* 消息提示器 */}
      <Toaster />
    </main>
  )
}
