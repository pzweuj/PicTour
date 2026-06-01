import type { MapCoordinate } from "./types"
import type { GPSCoordinate } from "./geo"
import { calculateBearing, calculateDistance } from "./geo"

const ESTIMATED_PIXELS_PER_CM = 38
const MIN_CALIBRATION_DISTANCE_METERS = 10

// 参考点类型 - 用于将GPS坐标映射到地图坐标
export interface ReferencePoint {
  mapCoord: MapCoordinate
  gpsCoord: GPSCoordinate
}

// 校准点类型 - 用于两点校准
export interface CalibrationPoint {
  mapCoord: MapCoordinate
  gpsCoord: GPSCoordinate
}

export interface CalibrationResult {
  orientation: number
  scale: number
  gpsDistance: number
  mapDistance: number
}

// 将GPS坐标转换为地图坐标
export function gpsToMapCoordinate(
  currentGPS: GPSCoordinate,
  referencePoint: ReferencePoint,
  mapOrientation: number,
  scale: number,
): MapCoordinate {
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1
  const distance = calculateDistance(referencePoint.gpsCoord, currentGPS)
  const bearing = calculateBearing(referencePoint.gpsCoord, currentGPS)
  const adjustedBearing = (bearing - mapOrientation + 360) % 360
  const pixelsPerMeter = ESTIMATED_PIXELS_PER_CM / safeScale

  const xOffset = distance * Math.sin((adjustedBearing * Math.PI) / 180) * pixelsPerMeter
  const yOffset = distance * Math.cos((adjustedBearing * Math.PI) / 180) * pixelsPerMeter

  return {
    x: referencePoint.mapCoord.x + xOffset,
    y: referencePoint.mapCoord.y - yOffset,
  }
}

// 根据两点校准计算地图方向和比例尺
export function calculateMapOrientationAndScale(point1: CalibrationPoint, point2: CalibrationPoint): CalibrationResult {
  const gpsBearing = calculateBearing(point1.gpsCoord, point2.gpsCoord)
  const dx = point2.mapCoord.x - point1.mapCoord.x
  const dy = point2.mapCoord.y - point1.mapCoord.y
  const mapAngle = (Math.atan2(dx, -dy) * 180) / Math.PI
  const orientation = (gpsBearing - mapAngle + 360) % 360
  const gpsDistance = calculateDistance(point1.gpsCoord, point2.gpsCoord)
  const mapDistance = Math.sqrt(dx * dx + dy * dy)
  const scale = gpsDistance / (mapDistance / ESTIMATED_PIXELS_PER_CM)

  return { orientation, scale, gpsDistance, mapDistance }
}

// 检查两点之间的距离是否足够进行有效校准
export function isCalibrationDistanceSufficient(point1: GPSCoordinate, point2: GPSCoordinate): boolean {
  return calculateDistance(point1, point2) >= MIN_CALIBRATION_DISTANCE_METERS
}
