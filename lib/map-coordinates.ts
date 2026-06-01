import type { ImageSize, MapCoordinate, MapOffset, ScreenCoordinate } from "./types"

// 计算 object-contain 图片在容器中的缩放比例。
export const getContainedImageScale = (containerRect: DOMRect, imageSize: ImageSize): number => {
  if (imageSize.width <= 0 || imageSize.height <= 0 || containerRect.width <= 0 || containerRect.height <= 0) {
    return 1
  }

  return Math.min(containerRect.width / imageSize.width, containerRect.height / imageSize.height)
}

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
  const visualScale = getContainedImageScale(containerRect, imageSize) * zoom

  const imageCenterScreenX = containerCenterX + mapOffset.x
  const imageCenterScreenY = containerCenterY + mapOffset.y
  const deltaX = (mapCoord.x - imageSize.width / 2) * visualScale
  const deltaY = (mapCoord.y - imageSize.height / 2) * visualScale

  return {
    x: imageCenterScreenX + deltaX,
    y: imageCenterScreenY + deltaY,
  }
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
  const visualScale = getContainedImageScale(containerRect, imageSize) * zoom

  const imageCenterScreenX = containerCenterX + mapOffset.x
  const imageCenterScreenY = containerCenterY + mapOffset.y
  const deltaX = screenCoord.x - imageCenterScreenX
  const deltaY = screenCoord.y - imageCenterScreenY

  return {
    x: imageSize.width / 2 + deltaX / visualScale,
    y: imageSize.height / 2 + deltaY / visualScale,
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
