"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { MapView } from "@/components/map/map-view"
import { MiniCompass } from "@/components/compass/mini-compass"
import { CompassSetting } from "@/components/compass/compass-setting"
import { ControlPanel } from "@/components/controls/control-panel"
import { SettingsPanel } from "@/components/settings/settings-panel"
import { Toolbar } from "@/components/toolbar/toolbar"
import { LocationTracker } from "@/components/location/location-tracker"
import { LocationConfidence, type LocationConfidenceState } from "@/components/location/location-confidence"
import { CalibrationStatus } from "@/components/calibration/calibration-status"
import type { MapCoordinate, ImageSize, MapOffset } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { GuideModal } from "@/components/guide/guide-modal"
import { getContainedImageScale, screenToMapCoordinate } from "@/lib/map-utils"
import {
  calculateMapOrientationAndScale,
  getCurrentPosition,
  isCalibrationDistanceSufficient,
  positionToGPSCoordinate,
  type CalibrationPoint,
} from "@/lib/location-utils"
import { useLanguage } from "@/contexts/language-context"
import { clearSavedMapState, loadSavedMapState, saveMapState } from "@/lib/local-map-store"
import { PrivacyModal } from "@/components/privacy/privacy-modal"

type CalibrationStep = "idle" | "point1" | "point2"

const MAX_MAP_IMAGE_SIZE_BYTES = 15 * 1024 * 1024
const MAX_MAP_IMAGE_PIXELS = 24_000_000
const MAX_MAP_IMAGE_DIMENSION = 8000
const ALLOWED_MAP_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MIN_MAP_SCALE = 1
const MAX_MAP_SCALE = 500
const DEFAULT_MAP_IMAGE = "/placeholder.svg?height=800&width=1200"
const DEFAULT_IMAGE_SIZE: ImageSize = { width: 1200, height: 800 }
const DEFAULT_MAP_POSITION: MapCoordinate = { x: 600, y: 400 }

const normalizeMapScale = (value: number) => {
  if (!Number.isFinite(value)) return MIN_MAP_SCALE
  return Math.min(Math.max(Math.round(value), MIN_MAP_SCALE), MAX_MAP_SCALE)
}

const logClientError = (message: string, error: unknown) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error)
  }
}

const hasValidImageSignature = (bytes: Uint8Array, type: string) => {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }

  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  }

  if (type === "image/webp") {
    return (
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    )
  }

  return false
}

const readImageDimensions = (src: string): Promise<ImageSize> =>
  new Promise((resolve, reject) => {
    const image = new window.Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }
    image.onerror = () => {
      reject(new Error("Unable to decode image."))
    }
    image.src = src
  })

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        resolve(event.target.result)
        return
      }

      reject(new Error("FileReader returned a non-string result."))
    }
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."))
    reader.readAsDataURL(file)
  })

export default function Home() {
  const { t } = useLanguage()

  // 状态管理
  const [mapImage, setMapImage] = useState<string>(DEFAULT_MAP_IMAGE)
  const [orientation, setOrientation] = useState(0) // 角度
  const [scale, setScale] = useState(100) // 比例尺：米/厘米
  const [zoom, setZoom] = useState(1) // 缩放级别
  const [heading, setHeading] = useState(0) // 用户朝向
  const [mapOffset, setMapOffset] = useState<MapOffset>({ x: 0, y: 0 }) // 地图偏移量
  const [isSettingPosition, setIsSettingPosition] = useState(false) // 是否正在设置位置
  const [isSettingOrientation, setIsSettingOrientation] = useState(false) // 是否正在设置方向
  const [tempOrientation, setTempOrientation] = useState(0) // 临时方向
  const [settingsOpen, setSettingsOpen] = useState(false) // 是否打开设置面板
  const [imageSize, setImageSize] = useState<ImageSize>(DEFAULT_IMAGE_SIZE) // 图片实际尺寸
  const [userPosition, setUserPosition] = useState<MapCoordinate>(DEFAULT_MAP_POSITION) // 用户在图片上的位置（像素）
  const [referencePosition, setReferencePosition] = useState<MapCoordinate>(DEFAULT_MAP_POSITION) // GPS校准参考点
  const [referenceVersion, setReferenceVersion] = useState(0) // 手动校准版本号
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>("idle") // 两点校准步骤
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]) // 已采集校准点
  const [isCapturingCalibrationPoint, setIsCapturingCalibrationPoint] = useState(false) // 是否正在采集GPS
  const [isGuideOpen, setIsGuideOpen] = useState(false) // 是否打开指引
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false) // 是否打开隐私政策
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false) // 是否已确认隐私政策
  const [hasLoadedSavedState, setHasLoadedSavedState] = useState(false) // 是否已读取本地缓存
  const [isTrackingLocation, setIsTrackingLocation] = useState(false) // 是否正在进行 GPS 定位
  const [locationConfidence, setLocationConfidence] = useState<LocationConfidenceState>({ status: "idle" })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const calibrationCaptureIdRef = useRef(0)
  const isRestoringSavedStateRef = useRef(false)
  const isClearingCacheRef = useRef(false)

  const updateReferencePosition = useCallback((position: MapCoordinate) => {
    setUserPosition(position)
    setReferencePosition(position)
    setReferenceVersion((version) => version + 1)
  }, [])

  const resetMapState = useCallback(() => {
    setMapImage(DEFAULT_MAP_IMAGE)
    setOrientation(0)
    setScale(100)
    setZoom(1)
    setHeading(0)
    setMapOffset({ x: 0, y: 0 })
    setImageSize(DEFAULT_IMAGE_SIZE)
    setUserPosition(DEFAULT_MAP_POSITION)
    setReferencePosition(DEFAULT_MAP_POSITION)
    setReferenceVersion((version) => version + 1)
    setCalibrationPoints([])
    setCalibrationStep("idle")
    setIsSettingPosition(false)
    setIsSettingOrientation(false)
  }, [])

  const acceptPrivacyPolicy = () => {
    localStorage.setItem("pictour-privacy-accepted", "true")
    setHasAcceptedPrivacy(true)
    setIsTrackingLocation(true)
    setIsPrivacyOpen(false)
  }

  const requestPrivacyBeforeLocation = () => {
    if (hasAcceptedPrivacy) return false

    setIsPrivacyOpen(true)
    toast({
      title: "请先确认隐私政策",
      description: "定位只会在本地用于地图换算，确认后才会请求浏览器定位权限。",
    })
    return true
  }

  const clearLocalCache = async () => {
    try {
      isClearingCacheRef.current = true
      await clearSavedMapState()
      resetMapState()
      toast({
        title: "缓存已清理",
        description: "本地保存的地图和校准数据已删除。",
      })
    } catch (error) {
      logClientError("清理缓存失败", error)
      toast({
        title: "清理失败",
        description: "无法删除本地缓存，请稍后重试。",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        isClearingCacheRef.current = false
      }, 0)
    }
  }

  const isCalibrating = calibrationStep !== "idle"

  const getMapCenterCoordinate = () => {
    if (!mapContainerRef.current) return null

    const containerRect = mapContainerRef.current.getBoundingClientRect()
    return screenToMapCoordinate(
      { x: containerRect.width / 2, y: containerRect.height / 2 },
      containerRect,
      imageSize,
      mapOffset,
      zoom,
    )
  }

  const startTwoPointCalibration = () => {
    if (requestPrivacyBeforeLocation()) return

    setIsTrackingLocation(true)
    calibrationCaptureIdRef.current += 1
    setCalibrationPoints([])
    setCalibrationStep("point1")
    setIsSettingPosition(false)
    setSettingsOpen(false)
    toast({
      title: "两点校准已开始",
      description: "请先到达第一个真实地点，并把中心图钉对准地图上的对应位置。",
    })
  }

  const cancelCalibration = () => {
    calibrationCaptureIdRef.current += 1
    setCalibrationPoints([])
    setCalibrationStep("idle")
    setIsCapturingCalibrationPoint(false)
  }

  const getPositionModeHint = () => {
    if (isCapturingCalibrationPoint) return t.controls.capturingLocation
    if (calibrationStep === "point1") return t.controls.calibrationPoint1Hint
    if (calibrationStep === "point2") return t.controls.calibrationPoint2Hint
    return t.controls.positionHint
  }

  const captureCalibrationPoint = async () => {
    if (calibrationStep === "idle" || isCapturingCalibrationPoint) return
    if (requestPrivacyBeforeLocation()) return

    const mapCoord = getMapCenterCoordinate()
    if (!mapCoord) return

    const captureId = ++calibrationCaptureIdRef.current
    setIsCapturingCalibrationPoint(true)

    try {
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      })
      if (captureId !== calibrationCaptureIdRef.current) return

      const calibrationPoint: CalibrationPoint = {
        mapCoord,
        gpsCoord: positionToGPSCoordinate(position),
      }

      if (calibrationStep === "point1") {
        setCalibrationPoints([calibrationPoint])
        setCalibrationStep("point2")
        toast({
          title: "第一个校准点已采集",
          description: "请移动到第二个真实地点，再把中心图钉对准地图上的对应位置。",
        })
        return
      }

      const firstPoint = calibrationPoints[0]
      if (!firstPoint) {
        setCalibrationStep("point1")
        toast({
          title: "校准点缺失",
          description: "请重新采集第一个校准点。",
          variant: "destructive",
        })
        return
      }

      if (!isCalibrationDistanceSufficient(firstPoint.gpsCoord, calibrationPoint.gpsCoord)) {
        toast({
          title: "两个校准点太近",
          description: "请移动至少 10 米后再采集第二个校准点，以提高校准精度。",
          variant: "destructive",
        })
        return
      }

      const result = calculateMapOrientationAndScale(firstPoint, calibrationPoint)
      const calibratedScale = normalizeMapScale(result.scale)

      setOrientation(result.orientation)
      setScale(calibratedScale)
      updateReferencePosition(calibrationPoint.mapCoord)
      setCalibrationPoints([])
      setCalibrationStep("idle")
      setIsSettingPosition(false)

      toast({
        title: "两点校准完成",
        description: `两点距离 ${Math.round(result.gpsDistance)} 米，方向 ${Math.round(result.orientation)}°，比例尺 ${calibratedScale} 米/厘米。`,
      })
    } catch (error) {
      logClientError("两点校准失败", error)
      toast({
        title: "校准失败",
        description: "无法获取 GPS 位置，请确认已授予定位权限并在室外开阔区域重试。",
        variant: "destructive",
      })
    } finally {
      if (captureId === calibrationCaptureIdRef.current) {
        setIsCapturingCalibrationPoint(false)
      }
    }
  }

  // 首次访问时先展示隐私政策
  useEffect(() => {
    const accepted = localStorage.getItem("pictour-privacy-accepted") === "true"
    setHasAcceptedPrivacy(accepted)
    if (!accepted) {
      setIsPrivacyOpen(true)
    } else {
      setIsTrackingLocation(true)
    }
  }, [])

  // 从本地恢复地图和校准数据
  useEffect(() => {
    let cancelled = false

    loadSavedMapState()
      .then((savedState) => {
        if (cancelled) return

        if (savedState) {
          isRestoringSavedStateRef.current = true
          setMapImage(savedState.mapImage)
          setImageSize(savedState.imageSize)
          setOrientation(savedState.orientation)
          setScale(normalizeMapScale(savedState.scale))
          setUserPosition(savedState.referencePosition)
          setReferencePosition(savedState.referencePosition)
          setReferenceVersion((version) => version + 1)
        }
      })
      .catch((error) => {
        logClientError("读取本地地图缓存失败", error)
      })
      .finally(() => {
        if (!cancelled) setHasLoadedSavedState(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // 自动保存地图和校准数据到本地 IndexedDB
  useEffect(() => {
    if (!hasLoadedSavedState || isClearingCacheRef.current) return

    if (mapImage === DEFAULT_MAP_IMAGE) return

    const timer = setTimeout(() => {
      saveMapState({
        mapImage,
        imageSize,
        orientation,
        scale,
        referencePosition,
        updatedAt: Date.now(),
      }).catch((error) => {
        logClientError("保存本地地图缓存失败", error)
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [
    hasLoadedSavedState,
    imageSize,
    mapImage,
    orientation,
    referencePosition,
    scale,
  ])

  // 首次确认隐私政策后自动打开指引
  useEffect(() => {
    if (!hasAcceptedPrivacy) return

    const hasSeenGuide = localStorage.getItem("pictour-guide-seen")
    if (!hasSeenGuide) {
      // 延迟一秒打开指引，让页面先加载完成
      const timer = setTimeout(() => {
        setIsGuideOpen(true)
        localStorage.setItem("pictour-guide-seen", "true")
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [hasAcceptedPrivacy])

  // 初始化tempOrientation
  useEffect(() => {
    setTempOrientation(orientation)
  }, [orientation, isSettingOrientation])

  // 加载图片时获取图片尺寸
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      const newImageSize = { width: img.width, height: img.height }
      const newUserPosition = { x: img.width / 2, y: img.height / 2 }



      setImageSize(newImageSize)
      if (isRestoringSavedStateRef.current) {
        isRestoringSavedStateRef.current = false
        setMapOffset({ x: 0, y: 0 })
        return
      }

      // 初始化用户位置在图片中心
      updateReferencePosition(newUserPosition)

      // 重置地图偏移，确保图片居中显示
      setMapOffset({ x: 0, y: 0 })
    }
    img.onerror = () => {
      isRestoringSavedStateRef.current = false
    }
    img.src = mapImage
  }, [mapImage, updateReferencePosition])

  // 处理文件上传
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const file = input.files?.[0]

    if (!file) return

    try {
      if (!ALLOWED_MAP_IMAGE_TYPES.has(file.type)) {
        toast({
          title: "无法导入地图",
          description: "请上传 JPG、PNG 或 WebP 格式的图片。",
          variant: "destructive",
        })
        return
      }

      if (file.size > MAX_MAP_IMAGE_SIZE_BYTES) {
        toast({
          title: "无法导入地图",
          description: "图片不能超过 15MB，请压缩后重试。",
          variant: "destructive",
        })
        return
      }

      const signature = new Uint8Array(await file.slice(0, 16).arrayBuffer())
      if (!hasValidImageSignature(signature, file.type)) {
        toast({
          title: "无法导入地图",
          description: "图片内容与文件格式不一致，请换一张图片重试。",
          variant: "destructive",
        })
        return
      }

      const objectUrl = URL.createObjectURL(file)
      try {
        const dimensions = await readImageDimensions(objectUrl)
        const totalPixels = dimensions.width * dimensions.height

        if (
          dimensions.width > MAX_MAP_IMAGE_DIMENSION ||
          dimensions.height > MAX_MAP_IMAGE_DIMENSION ||
          totalPixels > MAX_MAP_IMAGE_PIXELS
        ) {
          toast({
            title: "无法导入地图",
            description: "图片尺寸过大，请压缩到 8000 像素以内或 2400 万像素以内后重试。",
            variant: "destructive",
          })
          return
        }
      } finally {
        URL.revokeObjectURL(objectUrl)
      }

      const dataUrl = await readFileAsDataUrl(file)
      setMapImage(dataUrl)
      setZoom(1)
      setMapOffset({ x: 0, y: 0 })
    } catch (error) {
      logClientError("地图读取失败", error)
      toast({
        title: "地图读取失败",
        description: "无法读取该图片文件，请换一张图片重试。",
        variant: "destructive",
      })
    } finally {
      input.value = ""
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

  // 只有确认隐私政策并启用定位后，才读取浏览器权限状态。
  useEffect(() => {
    if (!hasAcceptedPrivacy || !isTrackingLocation) {
      setLocationConfidence({ status: "idle" })
      return
    }

    if (!navigator.geolocation) {
      setLocationConfidence({
        status: "error",
        message: "您的浏览器不支持地理位置功能。",
      })
      return
    }

    let cancelled = false
    let permissionStatus: PermissionStatus | null = null
    let handlePermissionChange: (() => void) | null = null

    const syncLocationPermission = async () => {
      if (!navigator.permissions || !navigator.permissions.query) {
        return
      }

      try {
        const result = await navigator.permissions.query({ name: "geolocation" as PermissionName })
        if (cancelled) return

        permissionStatus = result

        handlePermissionChange = () => {
          if (result.state === "denied") {
            setIsTrackingLocation(false)
            setLocationConfidence({
              status: "error",
              message: "用户拒绝了位置请求。",
            })
          }
        }

        result.addEventListener("change", handlePermissionChange)
      } catch (error) {
        logClientError("权限查询失败", error)
      }
    }

    syncLocationPermission()

    return () => {
      cancelled = true

      if (permissionStatus && handlePermissionChange) {
        permissionStatus.removeEventListener("change", handlePermissionChange)
      }
    }
  }, [hasAcceptedPrivacy, isTrackingLocation])

  // 将地图中心移动到用户位置
  const centerMapOnUser = () => {
    if (!mapContainerRef.current) return

    // 获取容器尺寸
    const containerRect = mapContainerRef.current.getBoundingClientRect()
    const displayScale = getContainedImageScale(containerRect, imageSize) * zoom

    // 计算用户位置相对于图片中心的偏移（考虑缩放）
    const deltaX = (userPosition.x - imageSize.width / 2) * displayScale
    const deltaY = (userPosition.y - imageSize.height / 2) * displayScale

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

  // 处理定位按钮点击
  const handleLocateClick = () => {
    if (requestPrivacyBeforeLocation()) return

    if (!isTrackingLocation) {
      setIsTrackingLocation(true)
      setLocationConfidence({ status: "requesting", message: "正在请求定位权限" })
      return
    }

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
    if (error.includes("拒绝") || error.toLowerCase().includes("denied")) {
      setIsTrackingLocation(false)
    }
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
        isSettingPosition={isSettingPosition || isCalibrating}
        isTracking={isTrackingLocation}
        heading={heading}
        userPosition={userPosition}
        imageSize={imageSize}
        scale={scale}
        onMapOffsetChange={setMapOffset}
        onZoomChange={setZoom}
        mapContainerRef={mapContainerRef as React.RefObject<HTMLDivElement>}
      />

      {/* 小型罗盘 */}
      <MiniCompass orientation={orientation} onClick={openCompassSetting} />

      {/* 顶部工具栏 */}
      <Toolbar
        onOpenMap={openMapFileSelect}
        onGuideClick={() => setIsGuideOpen(true)}
        onPrivacyClick={() => setIsPrivacyOpen(true)}
        onClearCacheClick={clearLocalCache}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 使用指南弹窗 */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* 隐私政策弹窗 */}
      <PrivacyModal isOpen={isPrivacyOpen} onAccept={acceptPrivacyPolicy} />

      {/* 定位可信度 */}
      {hasAcceptedPrivacy && <LocationConfidence state={locationConfidence} />}

      {/* 两点校准状态 */}
      {isCalibrating && (
        <CalibrationStatus
          step={calibrationStep === "point1" ? "point1" : "point2"}
          points={calibrationPoints}
          isCapturing={isCapturingCalibrationPoint}
          onRestart={startTwoPointCalibration}
        />
      )}

      {/* 控制面板 */}
      <ControlPanel
        isSettingPosition={isSettingPosition || isCalibrating}
        settingsOpen={settingsOpen}
        positionHint={getPositionModeHint()}
        isConfirming={isCapturingCalibrationPoint}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={handleLocateClick}
        onSettings={() => setSettingsOpen(!settingsOpen)}
        onCancelPositionSetting={() => {
          if (isCalibrating) {
            cancelCalibration()
            return
          }
          setIsSettingPosition(false)
        }}
        onConfirmPositionSetting={() => {
          if (isCalibrating) {
            captureCalibrationPoint()
            return
          }

          const mapCoord = getMapCenterCoordinate()
          if (!mapCoord) return

          // 更新用户位置
          updateReferencePosition(mapCoord)
          setIsSettingPosition(false)

          toast({
            title: "位置已设置",
            description: "您的位置已在地图上更新",
          })
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
        onStartCalibration={startTwoPointCalibration}
        onScaleChange={(value) => setScale(normalizeMapScale(value[0]))}
        onScaleInputChange={(value) => setScale(normalizeMapScale(value))}
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

      {/* 位置跟踪器 */}
      <LocationTracker
        isTracking={isTrackingLocation}
        referencePosition={referencePosition}
        referenceVersion={referenceVersion}
        orientation={orientation}
        scale={scale}
        imageSize={imageSize}
        onLocationUpdate={handleLocationUpdate}
        onError={handleLocationError}
        onStatusChange={setLocationConfidence}
      />

      {/* 消息提示器 */}
      <Toaster />
    </main>
  )
}
