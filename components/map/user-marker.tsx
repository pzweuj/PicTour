import type React from "react"
import type { ScreenCoordinate } from "@/lib/types"

interface UserMarkerProps {
  userScreenPosition: ScreenCoordinate
  isTracking: boolean
  heading: number
}

export const UserMarker: React.FC<UserMarkerProps> = ({ userScreenPosition, isTracking, heading }) => {
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${userScreenPosition.x}px`,
        top: `${userScreenPosition.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        {/* 方向指示器 */}
        {isTracking && (
          <div
            className="absolute -top-5 w-0 h-0 border-l-6 border-r-6 border-b-[12px] border-l-transparent border-r-transparent border-b-blue-500 left-1/2 -ml-1.5 transition-transform"
            style={{ transform: `rotate(${heading}deg)` }}
          />
        )}

        {/* 用户位置点 */}
        <div className="w-4 h-4 bg-blue-500 rounded-full relative border-2 border-white shadow-lg flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
          <div className="w-2 h-2 bg-blue-600 rounded-full z-10" />
        </div>
      </div>
    </div>
  )
}

interface PositionMarkerProps {
  isVisible: boolean
}

export const PositionMarker: React.FC<PositionMarkerProps> = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
      {/* 红色点 */}
      <div className="w-4 h-4 rounded-full bg-red-500 shadow-md border-2 border-white relative">
        {/* 脉冲动画效果 */}
        <div className="absolute inset-0 w-full h-full rounded-full border border-red-400 animate-ping"></div>
      </div>
    </div>
  )
}
