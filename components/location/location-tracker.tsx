"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { GPSCoordinate, ReferencePoint } from "@/lib/location-utils"
import { getCurrentPosition, positionToGPSCoordinate, gpsToMapCoordinate, calculateDistance } from "@/lib/location-utils"
import type { MapCoordinate } from "@/lib/types"
import type { LocationConfidenceState } from "./location-confidence"

interface LocationTrackerProps {
  isTracking: boolean
  referencePosition: MapCoordinate
  referenceVersion: number
  orientation: number
  scale: number
  imageSize: { width: number; height: number }
  onLocationUpdate: (newPosition: MapCoordinate, heading: number) => void
  onError: (error: string) => void
  onStatusChange?: (state: LocationConfidenceState) => void
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  isTracking,
  referencePosition,
  referenceVersion,
  orientation,
  scale,
  imageSize,
  onLocationUpdate,
  onError,
  onStatusChange,
}) => {
  // 存储参考点（用户设置的初始位置和对应的GPS坐标）
  const [referencePoint, setReferencePoint] = useState<ReferencePoint | null>(null)
  // 存储最新的GPS坐标
  const [currentGPS, setCurrentGPS] = useState<GPSCoordinate | null>(null)
  // 存储位置监听器ID
  const watchIdRef = useRef<number | null>(null)
  // 防止较慢的定位请求覆盖较新的校准点
  const referenceRequestIdRef = useRef(0)

  // 初始化参考点
  useEffect(() => {
    if (!isTracking || imageSize.width <= 0 || imageSize.height <= 0) return

    // 添加一个小延迟，确保手动校准位置和图片尺寸状态都已更新
    const timer = setTimeout(() => {
      initializeReferencePoint(referencePosition)
    }, 100)

    return () => clearTimeout(timer)
  }, [isTracking, imageSize.width, imageSize.height, referenceVersion])

  // 当跟踪状态改变时，开始或停止位置监听
  useEffect(() => {
    if (isTracking) {
      startTracking()
    } else {
      stopTracking()
    }

    return () => {
      stopTracking()
    }
  }, [isTracking])

  // 当获取到新的GPS坐标时，更新地图位置
  useEffect(() => {
    if (isTracking && referencePoint && currentGPS) {
      updateMapPosition()
    }
  }, [currentGPS, referencePoint, orientation, scale, isTracking])

  // 初始化参考点
  const initializeReferencePoint = async (mapCoord: MapCoordinate) => {
    const requestId = ++referenceRequestIdRef.current

    try {
      onStatusChange?.({ status: "requesting", message: "正在获取 GPS 参考点" })
      // 获取当前GPS位置
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })

      const gpsCoord = positionToGPSCoordinate(position)

      if (requestId !== referenceRequestIdRef.current) return

      // 创建参考点
      setReferencePoint({
        mapCoord, // 使用用户手动校准的位置作为参考点
        gpsCoord, // 对应的GPS坐标
      })

      setCurrentGPS(gpsCoord)
      onStatusChange?.({
        status: "tracking",
        accuracy: gpsCoord.accuracy,
        updatedAt: gpsCoord.timestamp || Date.now(),
      })

      // 立即更新用户位置到参考点位置，确保初始化时定位点在正确位置
      onLocationUpdate(mapCoord, gpsCoord.heading || 0)


    } catch (error) {
      console.error("初始化参考点失败:", error)
      const message = "无法获取您的位置，请确保已授予位置权限。"
      onStatusChange?.({ status: "error", message })
      onError(message)
    }
  }

  // 开始位置跟踪
  const startTracking = () => {
    if (watchIdRef.current !== null) {
      stopTracking()
    }

    if (!navigator.geolocation) {
      const message = "您的浏览器不支持地理位置功能。"
      onStatusChange?.({ status: "error", message })
      onError(message)
      return
    }

    try {
      onStatusChange?.({ status: "requesting", message: "正在监听 GPS 位置" })
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const gpsCoord = positionToGPSCoordinate(position)
          setCurrentGPS(gpsCoord)
          onStatusChange?.({
            status: "tracking",
            accuracy: gpsCoord.accuracy,
            updatedAt: gpsCoord.timestamp || Date.now(),
          })
        },
        (error) => {
          console.error("位置跟踪错误:", error)
          const message = `位置跟踪错误: ${getGeolocationErrorMessage(error)}`
          onStatusChange?.({ status: "error", message })
          onError(message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        },
      )
    } catch (error) {
      console.error("启动位置跟踪失败:", error)
      const message = "启动位置跟踪失败。"
      onStatusChange?.({ status: "error", message })
      onError(message)
    }
  }

  // 停止位置跟踪
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }

  // 更新地图位置
  const updateMapPosition = () => {
    if (!referencePoint || !currentGPS) return

    try {
      // 计算当前GPS坐标与参考点之间的距离
      const distance = calculateDistance(referencePoint.gpsCoord, currentGPS)

      // 如果距离很小（小于5米），认为用户没有移动，保持在参考点位置
      if (distance < 5) {
        console.log("GPS变化很小，保持在参考点位置:", distance, "米")
        // 获取方向（如果可用）
        const heading = currentGPS.heading !== null && currentGPS.heading !== undefined ? currentGPS.heading : 0
        // 保持在参考点的地图坐标
        onLocationUpdate(referencePoint.mapCoord, heading)
        return
      }

      // 将GPS坐标转换为地图坐标
      const newMapPosition = gpsToMapCoordinate(currentGPS, referencePoint, orientation, scale)

      // 获取方向（如果可用）
      const heading = currentGPS.heading !== null && currentGPS.heading !== undefined ? currentGPS.heading : 0

      // 更新用户位置
      onLocationUpdate(newMapPosition, heading)

      console.log("位置已更新:", {
        gps: currentGPS,
        map: newMapPosition,
        heading,
        distance: distance + "米",
      })
    } catch (error) {
      console.error("更新地图位置失败:", error)
    }
  }

  // 组件不渲染任何UI元素
  return null
}

// 获取地理位置错误的友好消息
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "用户拒绝了位置请求。"
    case error.POSITION_UNAVAILABLE:
      return "位置信息不可用。"
    case error.TIMEOUT:
      return "获取位置请求超时。"
    default:
      return "未知错误。"
  }
}
