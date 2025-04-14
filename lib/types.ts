// 图片坐标类型
export interface MapCoordinate {
  x: number // 图片上的x坐标（像素）
  y: number // 图片上的y坐标（像素）
}

// 屏幕坐标类型
export interface ScreenCoordinate {
  x: number // 屏幕上的x坐标（像素）
  y: number // 屏幕上的y坐标（像素）
}

// 图片尺寸类型
export interface ImageSize {
  width: number
  height: number
}

// 地图偏移类型
export interface MapOffset {
  x: number
  y: number
}

// 罗盘拖动开始状态
export interface CompassDragState {
  x: number
  y: number
  angle: number
}
