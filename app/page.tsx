"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Settings,
  Compass,
  MapPin,
  Ruler,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
  Check,
  ChevronDown,
  ArrowUp,
  Image as ImageIcon,
} from "lucide-react"

// 图片坐标类型
interface MapCoordinate {
  x: number // 图片上的x坐标（像素）
  y: number // 图片上的y坐标（像素）
}

// 屏幕坐标类型
interface ScreenCoordinate {
  x: number // 屏幕上的x坐标（像素）
  y: number // 屏幕上的y坐标（像素）
}

export default function Home() {
  // 状态管理
  const [mapImage, setMapImage] = useState<string>("/placeholder.svg?height=800&width=1200")
  const [orientation, setOrientation] = useState(0) // 角度
  const [scale, setScale] = useState(100) // 比例尺：米/厘米
  const [zoom, setZoom] = useState(1) // 缩放级别
  const [isTracking, setIsTracking] = useState(false) // 是否跟踪位置
  const [heading, setHeading] = useState(0) // 用户朝向
  const [isDraggingMap, setIsDraggingMap] = useState(false) // 是否正在拖动地图
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 }) // 地图偏移量
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 }) // 开始拖动的位置
  const [isSettingPosition, setIsSettingPosition] = useState(false) // 是否正在设置位置
  const [isSettingOrientation, setIsSettingOrientation] = useState(false) // 是否正在设置方向
  const [tempOrientation, setTempOrientation] = useState(0) // 临时方向
  const [settingsOpen, setSettingsOpen] = useState(false) // 是否打开设置面板
  const compassDragStart = useRef<{ x: number; y: number; angle: number } | null>(null) // 罗盘拖动开始
  const [pinchDistance, setPinchDistance] = useState<number | null>(null) // 双指捏合距离
  const [initialZoom, setInitialZoom] = useState<number>(1) // 初始缩放级别

  // 图片尺寸和用户位置
  const [imageSize, setImageSize] = useState({ width: 1200, height: 800 }) // 图片实际尺寸
  const [userPosition, setUserPosition] = useState<MapCoordinate>({ x: 600, y: 400 }) // 用户在图片上的位置（像素）

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const compassRef = useRef<HTMLDivElement>(null)
  const compassDialRef = useRef<HTMLDivElement>(null)
  const mapImageRef = useRef<HTMLDivElement>(null)

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

  // 坐标转换：图片坐标 -> 屏幕坐标
  const mapToScreenCoordinate = (mapCoord: MapCoordinate): ScreenCoordinate => {
    if (!mapContainerRef.current) {
      return { x: 0, y: 0 }
    }

    const containerRect = mapContainerRef.current.getBoundingClientRect()
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // 计算图片中心在屏幕上的位置（考虑偏移）
    const imageCenterScreenX = containerCenterX + mapOffset.x
    const imageCenterScreenY = containerCenterY + mapOffset.y

    // 计算图片坐标相对于图片中心的偏移（考虑缩放）
    const deltaX = (mapCoord.x - imageSize.width / 2) * zoom
    const deltaY = (mapCoord.y - imageSize.height / 2) * zoom

    // 计算最终屏幕坐标
    return {
      x: imageCenterScreenX + deltaX,
      y: imageCenterScreenY + deltaY,
    }
  }

  // 坐标转换：屏幕坐标 -> 图片坐标
  const screenToMapCoordinate = (screenCoord: ScreenCoordinate): MapCoordinate => {
    if (!mapContainerRef.current) {
      return { x: 0, y: 0 }
    }

    const containerRect = mapContainerRef.current.getBoundingClientRect()
    const containerCenterX = containerRect.width / 2
    const containerCenterY = containerRect.height / 2

    // 计算图片中心在屏幕上的位置（考虑偏移）
    const imageCenterScreenX = containerCenterX + mapOffset.x
    const imageCenterScreenY = containerCenterY + mapOffset.y

    // 计算屏幕坐标相对于图片中心的偏移
    const deltaX = screenCoord.x - imageCenterScreenX
    const deltaY = screenCoord.y - imageCenterScreenY

    // 计算最终图片坐标（考虑缩放）
    return {
      x: imageSize.width / 2 + deltaX / zoom,
      y: imageSize.height / 2 + deltaY / zoom,
    }
  }

  // 处理地图拖动 - 鼠标事件
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMap(true)
    setStartDragPos({ x: e.clientX, y: e.clientY })
  }
  const requestRef = useRef<number | null>(null);
  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMap) return

    // 使用 requestAnimationFrame 来优化性能
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startDragPos.x
        const deltaY = e.clientY - startDragPos.y

        setMapOffset({
          x: mapOffset.x + deltaX,
          y: mapOffset.y + deltaY,
        })

        setStartDragPos({ x: e.clientX, y: e.clientY })
        requestRef.current = null
      });
    }
  }

  const handleMapMouseUp = () => {
    setIsDraggingMap(false)
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  }

  // 处理地图触摸事件
  const handleMapTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为，防止浏览器缩放
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // 单指触摸 - 拖动
      setIsDraggingMap(true)
      setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setPinchDistance(null)
    } else if (e.touches.length === 2) {
      // 双指触摸 - 缩放
      const dist = getDistanceBetweenTouches(e)
      setPinchDistance(dist)
      setInitialZoom(zoom)
      setIsDraggingMap(false)
    }
  }

  const handleMapTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为，防止浏览器缩放
    e.preventDefault();
    
    // 使用 requestAnimationFrame 来优化性能
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        if (e.touches.length === 1 && isDraggingMap) {
          // 单指移动 - 拖动地图
          const deltaX = e.touches[0].clientX - startDragPos.x
          const deltaY = e.touches[0].clientY - startDragPos.y

          setMapOffset({
            x: mapOffset.x + deltaX,
            y: mapOffset.y + deltaY,
          })

          setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        } else if (e.touches.length === 2 && pinchDistance !== null) {
          // 双指移动 - 缩放地图
          const currentDistance = getDistanceBetweenTouches(e)
          const scaleFactor = currentDistance / pinchDistance

          // 计算新的缩放级别
          const newZoom = Math.min(Math.max(initialZoom * scaleFactor, 0.5), 3)
          setZoom(newZoom)
        }
        requestRef.current = null
      });
    }
  }

  const handleMapTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为
    e.preventDefault();
    
    if (e.touches.length < 2) {
      setPinchDistance(null)
    }
    if (e.touches.length === 0) {
      setIsDraggingMap(false)
    }
  }

  // 计算两个触摸点之间的距离
  const getDistanceBetweenTouches = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2))
  }

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3)
    setZoom(newZoom)
  }

  // 处理缩放
  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3))
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5))

  // 计算两点之间的角度
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
  }

  // 罗盘旋转 - 鼠标事件
  const handleCompassMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!compassDialRef.current) return

    e.preventDefault()
    const compassRect = compassDialRef.current.getBoundingClientRect()
    const compassCenterX = compassRect.left + compassRect.width / 2
    const compassCenterY = compassRect.top + compassRect.height / 2

    // 计算初始角度
    const initialAngle = calculateAngle(compassCenterX, compassCenterY, e.clientX, e.clientY)

    compassDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      angle: initialAngle - tempOrientation,
    };

    document.addEventListener("mousemove", handleCompassMouseMove)
    document.addEventListener("mouseup", handleCompassMouseUp)
  }

  const handleCompassMouseMove = (e: MouseEvent) => {
    if (!compassDialRef.current || !compassDragStart) return

    const compassRect = compassDialRef.current.getBoundingClientRect()
    const compassCenterX = compassRect.left + compassRect.width / 2
    const compassCenterY = compassRect.top + compassRect.height / 2

    // 计算当前角度
    const currentAngle = calculateAngle(compassCenterX, compassCenterY, e.clientX, e.clientY)

    // 计算旋转角度差
    let newOrientation = currentAngle - (compassDragStart.current?.angle || 0)

    // 规范化角度到0-360范围
    newOrientation = ((newOrientation % 360) + 360) % 360

    setTempOrientation(newOrientation)
  }

  const handleCompassMouseUp = () => {
    compassDragStart.current = null
    document.removeEventListener("mousemove", handleCompassMouseMove)
    document.removeEventListener("mouseup", handleCompassMouseUp)
  }

  // 罗盘旋转 - 触摸事件
  const handleCompassTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!compassDialRef.current) return

    e.preventDefault()
    const touch = e.touches[0]
    const compassRect = compassDialRef.current.getBoundingClientRect()
    const compassCenterX = compassRect.left + compassRect.width / 2
    const compassCenterY = compassRect.top + compassRect.height / 2

    // 计算初始角度
    const initialAngle = calculateAngle(compassCenterX, compassCenterY, touch.clientX, touch.clientY)

    compassDragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      angle: initialAngle - tempOrientation,
    };
  }

  const handleCompassTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!compassDialRef.current || !compassDragStart) return

    const touch = e.touches[0]
    const compassRect = compassDialRef.current.getBoundingClientRect()
    const compassCenterX = compassRect.left + compassRect.width / 2
    const compassCenterY = compassRect.top + compassRect.height / 2

    // 计算当前角度
    const currentAngle = calculateAngle(compassCenterX, compassCenterY, touch.clientX, touch.clientY)

    // 计算旋转角度差
    let newOrientation = currentAngle - (compassDragStart.current?.angle || 0)

    // 规范化角度到0-360范围
    newOrientation = ((newOrientation % 360) + 360) % 360

    setTempOrientation(newOrientation)
  }

  const handleCompassTouchEnd = () => {
    compassDragStart.current = null
  }

  // 确认罗盘设置
  const confirmCompassSetting = () => {
    setOrientation(tempOrientation)
    setIsSettingOrientation(false)
  }

  // 取消罗盘设置
  const cancelCompassSetting = () => {
    setTempOrientation(orientation)
    setIsSettingOrientation(false)
  }

  // 模拟位置跟踪
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTracking) {
      interval = setInterval(() => {
        // 在实际应用中，这里会使用地理位置API获取真实位置
        // 模拟用户移动 - 在图片坐标系中移动
        const moveDistance = scale / 10 // 每次移动的距离（像素）
        const moveAngle = (heading * Math.PI) / 180 // 移动方向（弧度）

        setUserPosition((prev) => ({
          x: prev.x + moveDistance * Math.cos(moveAngle),
          y: prev.y + moveDistance * Math.sin(moveAngle),
        }))

        // 模拟罗盘方向变化
        setHeading(Math.random() * 360)
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, scale, heading])

  // 检查位置权限状态
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>("未知");

  // 在组件加载时检查位置权限
  useEffect(() => {
    checkLocationPermission();
    
    // 添加一个延迟的权限检查，确保在某些浏览器中能正确触发
    const timer = setTimeout(() => {
      if (locationPermissionStatus === "未知" || locationPermissionStatus === "prompt") {
        console.log("尝试预热位置权限请求");
        // 预热位置请求，可能会触发权限提示
        navigator.geolocation.getCurrentPosition(
          () => console.log("位置预热成功"),
          (err) => console.log("位置预热失败", err.code),
          { timeout: 3000, maximumAge: 0 }
        );
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [locationPermissionStatus]);

  // 检查位置权限状态
  const checkLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationPermissionStatus("不支持");
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermissionStatus(result.state);
        
        // 监听权限变化
        result.addEventListener('change', () => {
          setLocationPermissionStatus(result.state);
        });
      } catch (error) {
        console.error("权限查询失败", error);
        setLocationPermissionStatus("未知");
      }
    } else {
      // 如果不支持permissions API，尝试获取位置来检查权限
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermissionStatus("granted"),
        () => setLocationPermissionStatus("denied"),
        { timeout: 3000 }
      );
    }
  };

  // 请求位置权限
  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      alert("您的设备不支持地理位置功能");
      return;
    }

    // 显示加载状态
    const loadingToast = alert("正在请求位置权限...");
    
    // 强制触发权限请求
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("位置获取成功", position.coords);
        setIsTracking(true);
        setLocationPermissionStatus("granted");
        
        // 使用实际位置数据更新用户位置
        // 这里可以添加将GPS坐标转换为地图坐标的逻辑
        // 暂时保持现有的模拟位置
        
        // 将地图中心移动到用户位置
        centerMapOnUser();
      },
      (error) => {
        console.error("位置获取失败", error.code, error.message);
        setLocationPermissionStatus("denied");
        
        // 根据错误类型提供不同的提示
        if (error.code === 1) { // PERMISSION_DENIED
          alert("位置权限被拒绝，请在浏览器设置中启用位置权限");
        } else if (error.code === 2) { // POSITION_UNAVAILABLE
          alert("位置信息不可用，请确保您的设备已开启GPS");
        } else if (error.code === 3) { // TIMEOUT
          alert("获取位置超时，请检查您的网络连接");
        } else {
          alert("无法获取位置: " + error.message);
        }
      },
      { 
        enableHighAccuracy: true,  // 请求高精度位置
        timeout: 10000,            // 10秒超时
        maximumAge: 0              // 不使用缓存的位置
      }
    );
  };

  // 添加一个新函数，用于将地图中心移动到用户位置
  const centerMapOnUser = () => {
    if (!mapContainerRef.current) return;
    
    // 获取容器尺寸
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;
    
    // 计算用户位置相对于图片中心的偏移（考虑缩放）
    const deltaX = (userPosition.x - imageSize.width / 2) * zoom;
    const deltaY = (userPosition.y - imageSize.height / 2) * zoom;
    
    // 计算需要的地图偏移量，使用户位置显示在屏幕中心
    setMapOffset({
      x: -deltaX,
      y: -deltaY
    });
  };

  // 修改定位按钮的点击处理
  // 在右下角控制按钮部分找到定位按钮，修改其onClick处理函数

  // 完成位置设置
  const completePositionSetting = () => {
    // 设置用户位置为当前屏幕中心点对应的图片坐标
    if (mapContainerRef.current) {
      const containerRect = mapContainerRef.current.getBoundingClientRect()
      const screenCenter: ScreenCoordinate = {
        x: containerRect.left + containerRect.width / 2,
        y: containerRect.top + containerRect.height / 2,
      }

      // 将屏幕中心点转换为图片坐标
      const mapCoord = screenToMapCoordinate(screenCenter)
      setUserPosition(mapCoord)

      console.log("设置位置:", mapCoord)
    }

    setIsSettingPosition(false)
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

  // 打开罗盘设置
  const openCompassSetting = () => {
    setTempOrientation(orientation)
    setIsSettingOrientation(true)
    setSettingsOpen(false)
  }

  // 计算用户位置在屏幕上的坐标
  const userScreenPosition = mapToScreenCoordinate(userPosition)

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* 地图全屏背景 */}
      <div
        ref={mapContainerRef}
        className="fixed inset-0 w-full h-full bg-muted overflow-hidden touch-none"
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMapMouseMove}
        onMouseUp={handleMapMouseUp}
        onMouseLeave={handleMapMouseUp}
        onTouchStart={handleMapTouchStart}
        onTouchMove={handleMapTouchMove}
        onTouchEnd={handleMapTouchEnd}
        onWheel={handleWheel}
      >
        <div
          ref={mapImageRef}
          className="absolute w-full h-full transition-transform duration-300 flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) translate(${mapOffset.x / zoom}px, ${mapOffset.y / zoom}px)`,
            willChange: 'transform', // 提示浏览器优化变换
            transition: isDraggingMap ? 'none' : 'transform 300ms', // 只在非拖动状态下应用过渡效果
          }}
        >
          <Image src={mapImage || "/placeholder.svg"} alt="Map" fill className="object-contain" priority />
        </div>

        {/* 用户位置标记 */}
        {!isSettingPosition && (
          <div
            className="absolute z-10"
            style={{
              left: `${userScreenPosition.x}px`,
              top: `${userScreenPosition.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative">
              {/* 方向指示器 */}
              {isTracking && (
                <div
                  className="absolute -top-5 w-0 h-0 border-l-6 border-r-6 border-b-[12px] border-l-transparent border-r-transparent border-b-blue-500 left-1/2 -ml-1.5 transition-transform"
                  style={{ transform: `rotate(${heading}deg)` }}
                />
              )}

              {/* 用户位置点 - 缩小尺寸 */}
              <div className="w-4 h-4 bg-blue-500 rounded-full relative border-2 border-white shadow-lg flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                <div className="w-2 h-2 bg-blue-600 rounded-full z-10" />
              </div>
            </div>
          </div>
        )}

        {/* 位置设置模式下的中心图钉 - 也适当缩小 */}
        {isSettingPosition && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <MapPin className="h-10 w-10 text-destructive" strokeWidth={3} />
          </div>
        )}

        {/* 方向指示器 - 罗盘覆盖在地图上 - 移到左边并缩小 */}
        <div
          className="absolute top-20 left-4 z-10 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={openCompassSetting}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="relative w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <Compass className="h-8 w-8 text-primary" />
            </div>

            {/* 北方指示 */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ transform: `rotate(${-orientation}deg)` }}
            >
              <ArrowUp className="h-3 w-3 text-destructive" />
              <span className="text-[10px] font-bold">北</span>
            </div>
          </div>
          {/* 增加点击区域 */}
          <div className="absolute inset-0 -m-4"></div>
        </div>

        {/* 比例尺 - 移到左下方 */}
        <div className="absolute bottom-8 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 z-10">
          <div className="w-16 h-1 bg-foreground"></div>
          <span className="text-xs">{scale}米</span>
        </div>
      </div>

      {/* 顶部标题栏 */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center z-20">
        <div className="h-8 w-auto relative -mt-4">
          <Image 
            src="/logo_cha.png" 
            alt="PicTour Logo" 
            width={120} 
            height={32} 
            className="object-contain" 
            priority 
          />
        </div>

        {/* 修改为打开地图按钮 */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1 bg-background/90 active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-4 w-4" /> {/* Use FileText instead of FileOpen */}
            <span className="sm:inline">打开地图</span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </Button>
        </div>
      </div>

      {/* 右下角控制按钮 */}
      <div className="fixed bottom-4 right-4 z-20">
        {/* 位置设置模式下的控制按钮 */}
        {isSettingPosition ? (
          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex gap-2">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={() => setIsSettingPosition(false)}
              className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button 
              variant="default" 
              size="icon" 
              onClick={completePositionSetting}
              className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-end">
            {/* 控制按钮组 */}
            <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full flex flex-col gap-2 shadow-lg">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleZoomIn}
                className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none hover:bg-background/50"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleZoomOut}
                className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none hover:bg-background/50"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                variant={isTracking ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  if (isTracking) {
                    setIsTracking(false);
                  } else {
                    requestLocationPermission();
                  }
                  // 如果已经在跟踪状态，点击按钮也会将地图中心移动到用户位置
                  if (isTracking) {
                    centerMapOnUser();
                  }
                }}
                className={`active:shadow-lg active:scale-95 transition-all duration-75 shadow-none ${isTracking ? "hover:bg-primary/90" : "hover:bg-background/50"}`}
              >
                <Locate className="h-5 w-5" />
              </Button>
              <Button
                variant={settingsOpen ? "default" : "ghost"}
                size="icon"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`active:shadow-lg active:scale-95 transition-all duration-75 shadow-none ${settingsOpen ? "hover:bg-primary/90" : "hover:bg-background/50"}`}
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCompassSetting}
                  className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
                >
                  设置方向
                </Button>
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
                className="w-full active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full active:shadow-lg active:scale-95 transition-all duration-75 shadow-none" 
                onClick={() => setSettingsOpen(false)}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                关闭设置
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 方向设置全屏模式 */}
      {isSettingOrientation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 p-4">
            <h2 className="text-xl font-bold text-white">旋转罗盘设置方向</h2>

            {/* 大型罗盘 */}
            <div
              ref={compassDialRef}
              className="relative w-72 h-72 touch-none"
              onMouseDown={handleCompassMouseDown}
              onTouchStart={handleCompassTouchStart}
              onTouchMove={handleCompassTouchMove}
              onTouchEnd={handleCompassTouchEnd}
            >
              {/* 罗盘外圈 - 可旋转部分 */}
              <div
                className="absolute inset-0 rounded-full border-8 border-primary/70 bg-background/30 backdrop-blur-sm"
                style={{ transform: `rotate(${tempOrientation}deg)` }}
              >
                {/* 罗盘刻度 - 主要方向 */}
                {[0, 90, 180, 270].map((angle) => (
                  <div
                    key={angle}
                    className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-2 h-12 bg-primary"></div>
                    <div className="absolute top-14 text-lg font-bold text-primary">
                      {angle === 0 ? "北" : angle === 90 ? "东" : angle === 180 ? "南" : "西"}
                    </div>
                  </div>
                ))}

                {/* 罗盘刻度 - 次要方向 */}
                {[45, 135, 225, 315].map((angle) => (
                  <div
                    key={angle}
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-1 h-8 bg-primary/70"></div>
                    <div
                      className="absolute top-10 text-sm font-medium text-primary/70 whitespace-nowrap"
                      style={{ transform: `rotate(-${angle}deg)` }}
                    >
                      {angle === 45 ? "东北" : angle === 135 ? "东南" : angle === 225 ? "西南" : "西北"}
                    </div>
                  </div>
                ))}

                {/* 旋转提示 */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary font-bold text-lg"
                  style={{ transform: `rotate(-${tempOrientation}deg)` }}
                >
                  旋转外圈
                </div>
              </div>

              {/* 罗盘中心 - 固定部分 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center z-10">
                <Compass className="h-20 w-20 text-primary" />

                {/* 固定的北方指示 */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <ArrowUp className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </div>

            {/* 当前角度显示 */}
            <div className="text-white text-lg font-medium">
              {Math.round(tempOrientation)}° ({getOrientationName(tempOrientation)})
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-4 w-full max-w-xs">
              <Button 
                variant="outline" 
                className="flex-1 active:shadow-lg transition-shadow duration-100 shadow-none" 
                onClick={cancelCompassSetting}
              >
                取消
              </Button>
              <Button 
                variant="default" 
                className="flex-1 active:shadow-lg transition-shadow duration-100 shadow-none" 
                onClick={confirmCompassSetting}
              >
                确认
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
