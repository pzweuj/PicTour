"use client"

import type React from "react"
import { Compass } from "lucide-react"

interface MiniCompassProps {
  orientation: number
  onClick: () => void
}

export const MiniCompass: React.FC<MiniCompassProps> = ({ orientation, onClick }) => {
  return (
    <div
      className="absolute top-24 right-4 z-10 cursor-pointer hover:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95 p-4"
      onClick={onClick}
      style={{ touchAction: "manipulation" }}
    >
      <div className="relative w-12 h-12 bg-background/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-primary/20 overflow-hidden">
        {/* 罗盘背景 - 更精致的渐变 */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-95"></div>
        </div>

        {/* 罗盘外圈 */}
        <div className="absolute inset-0.5 rounded-full border-2 border-slate-200/70"></div>

        {/* 罗盘刻度 - 这部分应该随着orientation旋转 */}
        <div
          className="absolute inset-0 rounded-full transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${orientation}deg)` }}
        >
          {/* 罗盘刻度 - 主要方向 */}
          {[0, 90, 180, 270].map((angle) => (
            <div
              key={angle}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div
                className={`absolute top-0 w-0.5 h-2 ${angle === 0 ? "bg-red-500" : "bg-primary/80"} left-1/2 -translate-x-1/2`}
              ></div>
              <div
                className={`absolute top-2 text-[6px] font-bold ${angle === 0 ? "text-red-500" : "text-primary/80"} left-1/2 -translate-x-1/2`}
              >
                {angle === 0 ? "N" : angle === 90 ? "E" : angle === 180 ? "S" : angle === 270 ? "W" : ""}
              </div>
            </div>
          ))}

          {/* 次要方向刻度 */}
          {[45, 135, 225, 315].map((angle) => (
            <div
              key={angle}
              className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute top-0 w-0.5 h-1.5 bg-primary/50 left-1/2 -translate-x-1/2"></div>
            </div>
          ))}

          {/* 添加更多细分刻度 */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = i * 15
            // 跳过已有主要和次要刻度的位置
            if (angle % 45 !== 0) {
              return (
                <div
                  key={`tick-${angle}`}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="absolute top-0 w-[1px] h-1 bg-primary/30 left-1/2 -translate-x-1/2"></div>
                </div>
              )
            }
            return null
          })}
        </div>

        {/* 罗盘中心 - 更精致的设计 */}
        <div className="relative w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center z-10 border border-slate-200">
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
            <Compass className="h-3.5 w-3.5 text-blue-600" />
          </div>
        </div>

        {/* 添加微妙的光泽效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent opacity-60 pointer-events-none"></div>
      </div>
    </div>
  )
}
