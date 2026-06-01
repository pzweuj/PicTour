// GPS坐标类型
export interface GPSCoordinate {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number | null
  speed?: number | null
  timestamp?: number
}

// 计算两个GPS坐标之间的距离（米）
export function calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
  const R = 6371000
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

  return ((bearing * 180) / Math.PI + 360) % 360
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
