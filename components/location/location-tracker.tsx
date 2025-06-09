"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { GPSCoordinate, ReferencePoint } from "@/lib/location-utils"
import { getCurrentPosition, positionToGPSCoordinate, gpsToMapCoordinate, calculateDistance } from "@/lib/location-utils"
import type { MapCoordinate } from "@/lib/types"

interface LocationTrackerProps {
  isTracking: boolean
  userPosition: MapCoordinate
  orientation: number
  scale: number
  imageSize: { width: number; height: number }
  onLocationUpdate: (newPosition: MapCoordinate, heading: number) => void
  onError: (error: string) => void
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  isTracking,
  userPosition,
  orientation,
  scale,
  imageSize,
  onLocationUpdate,
  onError,
}) => {
  // 存储参考点（用户设置的初始位置和对应的GPS坐标）
  const [referencePoint, setReferencePoint] = useState<ReferencePoint | null>(null)
  // 存储最新的GPS坐标
  const [currentGPS, setCurrentGPS] = useState<GPSCoordinate | null>(null)
  // 存储位置监听器ID
  const watchIdRef = useRef<number | null>(null)
  // 添加一个标志，表示是否已初始化参考点
  const [isReferenceInitialized, setIsReferenceInitialized] = useState(false)
  // 添加一个标志，表示是否已经请求过位置权限
  const hasRequestedPermission = useRef(false)

  // 初始化参考点
  useEffect(() => {
    if (isTracking && !isReferenceInitialized && !hasRequestedPermission.current && imageSize.width > 0) {
      // 添加一个小延迟，确保所有状态都已更新
      const timer = setTimeout(() => {
        hasRequestedPermission.current = true
        initializeReferencePoint()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isTracking, isReferenceInitialized, imageSize])

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
  const initializeReferencePoint = async () => {
    try {
      // 获取当前GPS位置
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })

      const gpsCoord = positionToGPSCoordinate(position)

      // 使用图片中心作为参考点的地图坐标，确保定位点在屏幕中心
      const centerMapCoord = {
        x: imageSize.width / 2,
        y: imageSize.height / 2,
      }



      // 创建参考点
      setReferencePoint({
        mapCoord: centerMapCoord, // 使用图片中心作为参考点
        gpsCoord, // 对应的GPS坐标
      })

      setCurrentGPS(gpsCoord)
      setIsReferenceInitialized(true) // 标记参考点已初始化

      // 立即更新用户位置到参考点位置，确保初始化时定位点在正确位置
      onLocationUpdate(centerMapCoord, gpsCoord.heading || 0)


    } catch (error) {
      console.error("初始化参考点失败:", error)
      onError("无法获取您的位置，请确保已授予位置权限。")
    }
  }

  // 开始位置跟踪
  const startTracking = () => {
    if (watchIdRef.current !== null) {
      stopTracking()
    }

    if (!navigator.geolocation) {
      onError("您的浏览器不支持地理位置功能。")
      return
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const gpsCoord = positionToGPSCoordinate(position)
          setCurrentGPS(gpsCoord)
        },
        (error) => {
          console.error("位置跟踪错误:", error)
          onError(`位置跟踪错误: ${getGeolocationErrorMessage(error)}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        },
      )
    } catch (error) {
      console.error("启动位置跟踪失败:", error)
      onError("启动位置跟踪失败。")
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

  // 当方向、比例尺或图片尺寸发生变化时，重置参考点
  useEffect(() => {
    if (isTracking && isReferenceInitialized) {
      // 重置参考点初始化状态，以便在下次跟踪时重新初始化
      setIsReferenceInitialized(false)
      hasRequestedPermission.current = false
      console.log("图片尺寸或设置变化，重置参考点")
    }
  }, [orientation, scale, imageSize.width, imageSize.height])

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
