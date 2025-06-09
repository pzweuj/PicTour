import type { MapCoordinate } from "./types"

// GPS坐标类型
export interface GPSCoordinate {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number | null
  speed?: number | null
  timestamp?: number
}

// 参考点类型 - 用于将GPS坐标映射到地图坐标
export interface ReferencePoint {
  mapCoord: MapCoordinate // 地图上的坐标（像素）
  gpsCoord: GPSCoordinate // 对应的GPS坐标（经纬度）
}

// 校准点类型 - 用于两点校准
export interface CalibrationPoint {
  mapCoord: MapCoordinate
  gpsCoord: GPSCoordinate
}

// 计算两个GPS坐标之间的距离（米）
export function calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
  const R = 6371000 // 地球半径（米）
  const lat1 = (coord1.latitude * Math.PI) / 180
  const lat2 = (coord2.latitude * Math.PI) / 180
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 计算从一个GPS坐标到另一个GPS坐标的方位角（度数，相对于正北方向）
export function calculateBearing(start: GPSCoordinate, end: GPSCoordinate): number {
  const startLat = (start.latitude * Math.PI) / 180
  const startLng = (start.longitude * Math.PI) / 180
  const endLat = (end.latitude * Math.PI) / 180
  const endLng = (end.longitude * Math.PI) / 180

  const y = Math.sin(endLng - startLng) * Math.cos(endLat)
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng)
  const bearing = Math.atan2(y, x)

  // 转换为度数并规范化到0-360范围
  return ((bearing * 180) / Math.PI + 360) % 360
}

// 将GPS坐标转换为地图坐标
export function gpsToMapCoordinate(
  currentGPS: GPSCoordinate,
  referencePoint: ReferencePoint,
  mapOrientation: number,
  scale: number,
): MapCoordinate {
  // 计算当前GPS坐标与参考点之间的距离（米）
  const distance = calculateDistance(referencePoint.gpsCoord, currentGPS)

  // 计算当前GPS坐标相对于参考点的方位角
  const bearing = calculateBearing(referencePoint.gpsCoord, currentGPS)

  // 调整方位角，考虑地图方向
  // 地图方向是指地图上的"北"方向相对于真北的角度
  const adjustedBearing = (bearing - mapOrientation + 360) % 360

  // 将距离转换为地图上的像素距离
  // scale是比例尺（米/厘米），需要转换为像素/米
  // 假设1厘米 = 38像素（这是一个估计值，可能需要根据实际情况调整）
  // 公式：pixelsPerMeter = (像素/厘米) / (米/厘米) = 38 / scale
  const pixelsPerMeter = 38 / scale

  // 计算在地图上的x和y偏移（像素）
  const xOffset = distance * Math.sin((adjustedBearing * Math.PI) / 180) * pixelsPerMeter
  const yOffset = distance * Math.cos((adjustedBearing * Math.PI) / 180) * pixelsPerMeter

  // 计算最终的地图坐标
  const result = {
    x: referencePoint.mapCoord.x + xOffset,
    y: referencePoint.mapCoord.y - yOffset, // 注意：y轴在屏幕上是向下的，所以这里是减法
  }

  // 添加调试信息
  console.log("GPS坐标转换详情:", {
    distance: distance.toFixed(2) + "米",
    bearing: bearing.toFixed(2) + "°",
    adjustedBearing: adjustedBearing.toFixed(2) + "°",
    pixelsPerMeter: pixelsPerMeter.toFixed(4),
    xOffset: xOffset.toFixed(2),
    yOffset: yOffset.toFixed(2),
    referencePoint: referencePoint.mapCoord,
    result,
  })

  return result
}

// 获取当前位置的Promise包装
export function getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

// 将GeolocationPosition转换为GPSCoordinate
export function positionToGPSCoordinate(position: GeolocationPosition): GPSCoordinate {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  }
}

// 根据两点校准计算地图方向和比例尺
export function calculateMapOrientationAndScale(
  point1: CalibrationPoint,
  point2: CalibrationPoint,
): { orientation: number; scale: number } {
  // 计算GPS坐标之间的方位角（相对于真北）
  const gpsBearing = calculateBearing(point1.gpsCoord, point2.gpsCoord)

  // 计算地图坐标之间的角度（相对于地图的"上"方向）
  const dx = point2.mapCoord.x - point1.mapCoord.x
  const dy = point2.mapCoord.y - point1.mapCoord.y
  const mapAngle = (Math.atan2(dx, -dy) * 180) / Math.PI // 注意：y轴在屏幕上是向下的，所以用-dy

  // 地图方向 = GPS方位角 - 地图角度
  // 这表示地图的"上"方向相对于真北的角度
  const orientation = (gpsBearing - mapAngle + 360) % 360

  // 计算GPS坐标之间的实际距离（米）
  const gpsDistance = calculateDistance(point1.gpsCoord, point2.gpsCoord)

  // 计算地图坐标之间的像素距离
  const mapDistance = Math.sqrt(dx * dx + dy * dy)

  // 计算比例尺（米/厘米）
  // 假设1厘米 = 38像素
  const pixelsPerCm = 38
  const scale = (gpsDistance / (mapDistance / pixelsPerCm)) * 100

  return { orientation, scale }
}

// 检查两点之间的距离是否足够进行有效校准
export function isCalibrationDistanceSufficient(point1: GPSCoordinate, point2: GPSCoordinate): boolean {
  const distance = calculateDistance(point1, point2)
  // 建议至少移动10米以获得更准确的校准结果
  return distance >= 10
}
