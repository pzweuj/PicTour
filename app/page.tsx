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
import { Calibration } from "@/components/location/calibration"
import { GuideButton } from "@/components/guide/guide-button"
import { GuideModal } from "@/components/guide/guide-modal"
import type { MapCoordinate, ImageSize, MapOffset } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  // 状态管理
  const [mapImage, setMapImage] = useState<string>("/placeholder.svg?height=800&width=1200")
  const [orientation, setOrientation] = useState(0) // 角度
  const [scale, setScale] = useState(100) // 比例尺：米/厘米
  const [zoom, setZoom] = useState(1) // 缩放级别
  const [isTracking, setIsTracking] = useState(false) // 是否跟踪位置
  const [heading, setHeading] = useState(0) // 用户朝向
  const [mapOffset, setMapOffset] = useState<MapOffset>({ x: 0, y: 0 }) // 地图偏移量
  const [isSettingPosition, setIsSettingPosition] = useState(false) // 是否正在设置位置
  const [isSettingOrientation, setIsSettingOrientation] = useState(false) // 是否正在设置方向
  const [isCalibrating, setIsCalibrating] = useState(false) // 是否正在进行两点校准
  const [tempOrientation, setTempOrientation] = useState(0) // 临时方向
  const [settingsOpen, setSettingsOpen] = useState(false) // 是否打开设置面板
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("未知") // 位置权限状态
  const [locationError, setLocationError] = useState<string | null>(null) // 位置错误信息
  const [pendingMapPointCallback, setPendingMapPointCallback] = useState<((point: MapCoordinate) => void) | null>(null) // 等待设置地图点的回调
  const [isGuideOpen, setIsGuideOpen] = useState(false) // 是否打开指引弹窗

  // 图片尺寸和用户位置
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 1200, height: 800 }) // 图片实际尺寸
  const [userPosition, setUserPosition] = useState<MapCoordinate>({ x: 600, y: 400 }) // 用户在图片上的位置（像素）

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

  // 在组件加载时检查位置权限
  useEffect(() => {
    checkLocationPermission()

    // 添加一个延迟的权限检查，确保在某些浏览器中能正确触发
    const timer = setTimeout(() => {
      if (locationPermissionStatus === "未知" || locationPermissionStatus === "prompt") {
        console.log("尝试预热位置权限请求")
        // 预热位置请求，可能会触发权限提示
        navigator.geolocation.getCurrentPosition(
          () => console.log("位置预热成功"),
          (err) => console.log("位置预热失败", err.code),
          { timeout: 3000, maximumAge: 0 },
        )
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
        })
      } catch (error) {
        console.error("权限查询失败", error)
        setLocationPermissionStatus("未知")
      }
    } else {
      // 如果不支持permissions API，尝试获取位置来检查权限
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermissionStatus("granted"),
        () => setLocationPermissionStatus("denied"),
        { timeout: 3000 },
      )
    }
  }

  // 请求位置权限
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      toast({
        title: "不支持",
        description: "您的设备不支持地理位置功能",
        variant: "destructive",
      })
      return
    }

    // 强制触发权限请求
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("位置获取成功", position.coords)
        setIsTracking(true)
        setLocationPermissionStatus("granted")
        toast({
          title: "位置跟踪已启动",
          description: "您的位置将在地图上实时更新",
        })
      },
      (error) => {
        console.error("位置获取失败", error.code, error.message)
        setLocationPermissionStatus("denied")

        // 根据错误类型提供不同的提示
        if (error.code === 1) {
          // PERMISSION_DENIED
          toast({
            title: "位置权限被拒绝",
            description: "请在浏览器设置中启用位置权限",
            variant: "destructive",
          })
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          toast({
            title: "位置信息不可用",
            description: "请确保您的设备已开启GPS",
            variant: "destructive",
          })
        } else if (error.code === 3) {
          // TIMEOUT
          toast({
            title: "获取位置超时",
            description: "请检查您的网络连接",
            variant: "destructive",
          })
        } else {
          toast({
            title: "无法获取位置",
            description: error.message,
            variant: "destructive",
          })
        }
      },
      {
        enableHighAccuracy: true, // 请求高精度位置
        timeout: 10000, // 10秒超时
        maximumAge: 0, // 不使用缓存的位置
      },
    )
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
  }

  // 处理定位按钮点击
  const handleLocateClick = () => {
    if (isTracking) {
      setIsTracking(false)
      toast({
        title: "位置跟踪已停止",
      })
    } else {
      requestLocationPermission()
    }
    // 如果已经在跟踪状态，点击按钮也会将地图中心移动到用户位置
    if (isTracking) {
      centerMapOnUser()
    }
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
    setIsTracking(false)
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

  // 开始两点校准
  const startCalibration = () => {
    setIsCalibrating(true)
    setSettingsOpen(false)
  }

  // 完成两点校准
  const completeCalibration = (newOrientation: number, newScale: number) => {
    setOrientation(newOrientation)
    setScale(newScale)
    setIsCalibrating(false)
    toast({
      title: "校准完成",
      description: `方向: ${Math.round(newOrientation)}°, 比例尺: ${Math.round(newScale)}米/厘米`,
    })
  }

  // 设置地图点
  const handleSetMapPoint = (callback: (point: MapCoordinate) => void) => {
    setPendingMapPointCallback(callback)
    setIsSettingPosition(true)
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
        isSettingPosition={isSettingPosition || pendingMapPointCallback !== null}
        isTracking={isTracking}
        heading={heading}
        userPosition={userPosition}
        imageSize={imageSize}
        onMapOffsetChange={setMapOffset}
        onZoomChange={setZoom}
        onUserPositionSet={(position) => {
          if (pendingMapPointCallback) {
            // 如果有等待的回调，执行它
            pendingMapPointCallback(position)
            setPendingMapPointCallback(null)
          } else {
            // 否则，正常设置用户位置
            setUserPosition(position)
            setIsSettingPosition(false)
            toast({
              title: "位置已设置",
              description: "您的位置已在地图上更新",
            })
          }
        }}
      />

      {/* 小型罗盘 */}
      <MiniCompass orientation={orientation} onClick={openCompassSetting} />

      {/* 顶部工具栏 */}
      <Toolbar onOpenMap={openMapFileSelect} fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* 使用指南按钮 */}
      <GuideButton onClick={() => setIsGuideOpen(true)} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 控制面板 */}
      <ControlPanel
        isSettingPosition={isSettingPosition || pendingMapPointCallback !== null}
        isTracking={isTracking}
        settingsOpen={settingsOpen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocateClick}
        onSettings={() => setSettingsOpen(!settingsOpen)}
        onCancelPositionSetting={() => {
          setIsSettingPosition(false)
          setPendingMapPointCallback(null)
        }}
        onConfirmPositionSetting={() => {
          if (mapContainerRef.current) {
            const containerRect = mapContainerRef.current.getBoundingClientRect()
            const screenCenter = {
              x: containerRect.left + containerRect.width / 2,
              y: containerRect.top + containerRect.height / 2,
            }

            // 这里应该调用 screenToMapCoordinate 函数，但由于我们已经将该逻辑移到了 MapView 组件中
            // 所以这里不再需要手动计算，MapView 组件会处理这个逻辑
            setIsSettingPosition(false)
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
        onStartCalibration={startCalibration}
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

      {/* 两点校准模式 */}
      {isCalibrating && (
        <Calibration
          onComplete={completeCalibration}
          onCancel={() => setIsCalibrating(false)}
          onSetMapPoint={handleSetMapPoint}
        />
      )}

      {/* 位置跟踪器 */}
      {isTracking && (
        <LocationTracker
          isTracking={isTracking}
          userPosition={userPosition}
          orientation={orientation}
          scale={scale}
          onLocationUpdate={handleLocationUpdate}
          onError={handleLocationError}
        />
      )}

      {/* 消息提示器 */}
      <Toaster />
    </main>
  )
}
