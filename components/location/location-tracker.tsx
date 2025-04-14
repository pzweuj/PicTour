"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { GPSCoordinate, ReferencePoint } from "@/lib/location-utils"
import { getCurrentPosition, positionToGPSCoordinate, gpsToMapCoordinate } from "@/lib/location-utils"
import type { MapCoordinate } from "@/lib/types"

interface LocationTrackerProps {
  isTracking: boolean
  userPosition: MapCoordinate
  orientation: number
  scale: number
  onLocationUpdate: (newPosition: MapCoordinate, heading: number) => void
  onError: (error: string) => void
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({
  isTracking,
  userPosition,
  orientation,
  scale,
  onLocationUpdate,
  onError,
}) => {
  // 存储参考点（用户设置的初始位置和对应的GPS坐标）
  const [referencePoint, setReferencePoint] = useState<ReferencePoint | null>(null)
  // 存储最新的GPS坐标
  const [currentGPS, setCurrentGPS] = useState<GPSCoordinate | null>(null)
  // 存储位置监听器ID
  const watchIdRef = useRef<number | null>(null)

  // 初始化参考点
  useEffect(() => {
    if (isTracking && !referencePoint) {
      initializeReferencePoint()
    }
  }, [isTracking, referencePoint])

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

      // 创建参考点
      setReferencePoint({
        mapCoord: userPosition, // 用户在地图上设置的当前位置
        gpsCoord, // 对应的GPS坐标
      })

      setCurrentGPS(gpsCoord)

      console.log("参考点已初始化:", {
        mapCoord: userPosition,
        gpsCoord,
      })
    } catch (error) {
      console.error("初始化参考点失败:", error)
      onError("无法获取您的位置，请确保已授予位置权限。")
      stopTracking()
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
          stopTracking()
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
      })
    } catch (error) {
      console.error("更新地图位置失败:", error)
    }
  }

  // 重置参考点
  const resetReferencePoint = () => {
    setReferencePoint(null)
    if (isTracking) {
      initializeReferencePoint()
    }
  }

  // 当用户位置、方向或比例尺发生变化时，重置参考点
  useEffect(() => {
    if (isTracking && referencePoint) {
      resetReferencePoint()
    }
  }, [userPosition, orientation, scale])

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
