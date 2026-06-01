import type { Language } from './i18n'

export {
  calculateAngle,
  getContainedImageScale,
  getDistanceBetweenTouches,
  mapToScreenCoordinate,
  screenToMapCoordinate,
} from "./map-coordinates"

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
