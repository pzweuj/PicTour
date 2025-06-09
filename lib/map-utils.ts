import type { MapCoordinate, ScreenCoordinate, ImageSize, MapOffset } from "./types"

// 坐标转换：图片坐标 -> 屏幕坐标
export const mapToScreenCoordinate = (
  mapCoord: MapCoordinate,
  containerRect: DOMRect,
  imageSize: ImageSize,
  mapOffset: MapOffset,
  zoom: number,
): ScreenCoordinate => {
  const containerCenterX = containerRect.width / 2
  const containerCenterY = containerRect.height / 2

  // 计算图片中心在屏幕上的位置（考虑偏移）
  const imageCenterScreenX = containerCenterX + mapOffset.x
  const imageCenterScreenY = containerCenterY + mapOffset.y

  // 计算图片坐标相对于图片中心的偏移（考虑缩放）
  const deltaX = (mapCoord.x - imageSize.width / 2) * zoom
  const deltaY = (mapCoord.y - imageSize.height / 2) * zoom

  // 计算最终屏幕坐标
  const result = {
    x: imageCenterScreenX + deltaX,
    y: imageCenterScreenY + deltaY,
  }



  return result
}

// 坐标转换：屏幕坐标 -> 图片坐标
export const screenToMapCoordinate = (
  screenCoord: ScreenCoordinate,
  containerRect: DOMRect,
  imageSize: ImageSize,
  mapOffset: MapOffset,
  zoom: number,
): MapCoordinate => {
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

// 计算两点之间的角度
export const calculateAngle = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
}

// 计算两个触摸点之间的距离
export const getDistanceBetweenTouches = (touch1: Touch, touch2: Touch): number => {
  return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2))
}

import type { Language } from './i18n'

// 计算方向名称
export const getOrientationName = (angle: number, language: Language = 'zh'): string => {
  // 规范化角度到0-360范围
  const normalizedAngle = ((angle % 360) + 360) % 360

  const directions = {
    zh: {
      north: "正北",
      northeast: "东北",
      east: "正东",
      southeast: "东南",
      south: "正南",
      southwest: "西南",
      west: "正西",
      northwest: "西北"
    },
    en: {
      north: "North",
      northeast: "Northeast",
      east: "East",
      southeast: "Southeast",
      south: "South",
      southwest: "Southwest",
      west: "West",
      northwest: "Northwest"
    }
  }

  const dir = directions[language]

  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return dir.north
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return dir.northeast
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return dir.east
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return dir.southeast
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return dir.south
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return dir.southwest
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return dir.west
  return dir.northwest
}
