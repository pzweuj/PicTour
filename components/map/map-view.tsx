"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import type { MapCoordinate, ScreenCoordinate, ImageSize, MapOffset } from "@/lib/types"
import { mapToScreenCoordinate, screenToMapCoordinate, getDistanceBetweenTouches } from "@/lib/map-utils"
import { UserMarker, PositionMarker } from "./user-marker"

interface MapViewProps {
  mapImage: string
  zoom: number
  mapOffset: MapOffset
  isSettingPosition: boolean
  isTracking: boolean
  heading: number
  userPosition: MapCoordinate
  imageSize: ImageSize
  onMapOffsetChange: (offset: MapOffset) => void
  onZoomChange: (zoom: number) => void
  onUserPositionSet: (position: MapCoordinate) => void
}

export const MapView: React.FC<MapViewProps> = ({
  mapImage,
  zoom,
  mapOffset,
  isSettingPosition,
  isTracking,
  heading,
  userPosition,
  imageSize,
  onMapOffsetChange,
  onZoomChange,
  onUserPositionSet,
}) => {
  const [isDraggingMap, setIsDraggingMap] = useState(false)
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 })
  const [pinchDistance, setPinchDistance] = useState<number | null>(null)
  const [initialZoom, setInitialZoom] = useState<number>(1)

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapImageRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number | null>(null)

  // 计算用户位置在屏幕上的坐标
  const userScreenPosition = mapContainerRef.current
    ? mapToScreenCoordinate(userPosition, mapContainerRef.current.getBoundingClientRect(), imageSize, mapOffset, zoom)
    : { x: 0, y: 0 }

  // 处理地图拖动 - 鼠标事件
  const handleMapMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingMap(true)
    setStartDragPos({ x: e.clientX, y: e.clientY })
  }

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingMap) return

    // 使用 requestAnimationFrame 来优化性能
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startDragPos.x
        const deltaY = e.clientY - startDragPos.y

        onMapOffsetChange({
          x: mapOffset.x + deltaX,
          y: mapOffset.y + deltaY,
        })

        setStartDragPos({ x: e.clientX, y: e.clientY })
        requestRef.current = null
      })
    }
  }

  const handleMapMouseUp = () => {
    setIsDraggingMap(false)
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
  }

  // 处理地图触摸事件
  const handleMapTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为，防止浏览器缩放
    e.preventDefault()

    if (e.touches.length === 1) {
      // 单指触摸 - 拖动
      setIsDraggingMap(true)
      setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setPinchDistance(null)
    } else if (e.touches.length === 2) {
      // 双指触摸 - 缩放
      const dist = getDistanceBetweenTouches(e.touches[0] as Touch, e.touches[1] as Touch)
      setPinchDistance(dist)
      setInitialZoom(zoom)
      setIsDraggingMap(false)
    }
  }

  const handleMapTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为，防止浏览器缩放
    e.preventDefault()

    // 使用 requestAnimationFrame 来优化性能
    if (!requestRef.current) {
      requestRef.current = requestAnimationFrame(() => {
        if (e.touches.length === 1 && isDraggingMap) {
          // 单指移动 - 拖动地图
          const deltaX = e.touches[0].clientX - startDragPos.x
          const deltaY = e.touches[0].clientY - startDragPos.y

          onMapOffsetChange({
            x: mapOffset.x + deltaX,
            y: mapOffset.y + deltaY,
          })

          setStartDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
        } else if (e.touches.length === 2 && pinchDistance !== null) {
          // 双指移动 - 缩放地图
          const currentDistance = getDistanceBetweenTouches(e.touches[0] as Touch, e.touches[1] as Touch)
          const scaleFactor = currentDistance / pinchDistance

          // 计算新的缩放级别
          const newZoom = Math.min(Math.max(initialZoom * scaleFactor, 0.5), 3)
          onZoomChange(newZoom)
        }
        requestRef.current = null
      })
    }
  }

  const handleMapTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    // 阻止默认行为
    e.preventDefault()

    if (e.touches.length < 2) {
      setPinchDistance(null)
    }
    if (e.touches.length === 0) {
      setIsDraggingMap(false)
    }
  }

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3)
    onZoomChange(newZoom)
  }

  // 完成位置设置
  const completePositionSetting = () => {
    // 设置用户位置为当前屏幕中心点对应的图片坐标
    if (mapContainerRef.current && isSettingPosition) {
      const containerRect = mapContainerRef.current.getBoundingClientRect()
      const screenCenter: ScreenCoordinate = {
        x: containerRect.left + containerRect.width / 2,
        y: containerRect.top + containerRect.height / 2,
      }

      // 将屏幕中心点转换为图片坐标
      const mapCoord = screenToMapCoordinate(screenCenter, containerRect, imageSize, mapOffset, zoom)
      onUserPositionSet(mapCoord)
    }
  }

  // 清理事件监听器
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // 如果处于位置设置模式，监听位置设置完成
  useEffect(() => {
    if (isSettingPosition) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          completePositionSetting()
        } else if (e.key === "Escape") {
          // 可以添加取消设置的回调
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isSettingPosition, mapOffset, zoom])

  return (
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
          willChange: "transform", // 提示浏览器优化变换
          transition: isDraggingMap ? "none" : "transform 300ms", // 只在非拖动状态下应用过渡效果
        }}
      >
        <Image src={mapImage || "/placeholder.svg"} alt="Map" fill className="object-contain" priority />
      </div>

      {/* 用户位置标记 */}
      {!isSettingPosition && (
        <UserMarker userScreenPosition={userScreenPosition} isTracking={isTracking} heading={heading} />
      )}

      {/* 位置设置模式下的中心图钉 */}
      <PositionMarker isVisible={isSettingPosition} />

      {/* 比例尺 - 左下方 */}
      <div className="absolute bottom-8 left-4 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 z-10">
        <div className="w-16 h-1 bg-foreground"></div>
        <span className="text-xs">{Math.round(100 / zoom)}米</span>
      </div>
    </div>
  )
}
