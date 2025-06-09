"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Compass } from "lucide-react"
import { getOrientationName } from "@/lib/map-utils"

interface CompassSettingProps {
  tempOrientation: number
  setTempOrientation: (value: number) => void
  onConfirm: () => void
}

export const CompassSetting: React.FC<CompassSettingProps> = ({ tempOrientation, setTempOrientation, onConfirm }) => {
  const compassDialRef = useRef<HTMLDivElement>(null)
  const compassContainerRef = useRef<HTMLDivElement>(null)

  // 跟踪上一次鼠标/触摸位置
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)

  // 跟踪累积旋转角度
  const [cumulativeRotation, setCumulativeRotation] = useState(tempOrientation)

  // 初始化角度
  useEffect(() => {
    setCumulativeRotation(tempOrientation)
  }, [tempOrientation])

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!compassDialRef.current) return

    const rect = compassDialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    lastPositionRef.current = { x: e.clientX, y: e.clientY }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // 处理鼠标移动事件
  const handleMouseMove = (e: MouseEvent) => {
    if (!compassDialRef.current || !lastPositionRef.current) return

    const rect = compassDialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // 计算上一个位置和当前位置相对于中心的角度
    const lastAngle = Math.atan2(lastPositionRef.current.y - centerY, lastPositionRef.current.x - centerX)
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX)

    // 计算角度变化（弧度）
    let angleDelta = currentAngle - lastAngle

    // 将角度变化转换为度数
    angleDelta = angleDelta * (180 / Math.PI)

    // 更新累积旋转角度
    setCumulativeRotation((prev) => {
      const newRotation = prev + angleDelta

      // 更新规范化角度（0-360范围）用于显示和最终设置
      const normalizedAngle = ((newRotation % 360) + 360) % 360
      setTempOrientation(normalizedAngle)

      return newRotation
    })

    // 更新上一次位置
    lastPositionRef.current = { x: e.clientX, y: e.clientY }
  }

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    lastPositionRef.current = null
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // 处理触摸开始事件
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!compassDialRef.current || e.touches.length !== 1) return

    const touch = e.touches[0]
    lastPositionRef.current = { x: touch.clientX, y: touch.clientY }
  }

  // 处理触摸移动事件
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!compassDialRef.current || !lastPositionRef.current || e.touches.length !== 1) return

    const touch = e.touches[0]
    const rect = compassDialRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // 计算上一个位置和当前位置相对于中心的角度
    const lastAngle = Math.atan2(lastPositionRef.current.y - centerY, lastPositionRef.current.x - centerX)
    const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX)

    // 计算角度变化（弧度）
    let angleDelta = currentAngle - lastAngle

    // 将角度变化转换为度数
    angleDelta = angleDelta * (180 / Math.PI)

    // 更新累积旋转角度
    setCumulativeRotation((prev) => {
      const newRotation = prev + angleDelta

      // 更新规范化角度（0-360范围）用于显示和最终设置
      const normalizedAngle = ((newRotation % 360) + 360) % 360
      setTempOrientation(normalizedAngle)

      return newRotation
    })

    // 更新上一次位置
    lastPositionRef.current = { x: touch.clientX, y: touch.clientY }
  }

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    lastPositionRef.current = null
  }

  // 处理点击罗盘外部区域
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (compassContainerRef.current && !compassContainerRef.current.contains(e.target as Node)) {
      onConfirm()
    }
  }

  // 清理事件监听器
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // 获取显示用的角度（0-360范围）
  const displayAngle = Math.round(((tempOrientation % 360) + 360) % 360)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={handleOutsideClick}>
      <div
        ref={compassContainerRef}
        className="relative"
        onClick={(e) => e.stopPropagation()} // 防止点击罗盘区域触发外部点击事件
      >
        {/* 大型罗盘 */}
        <div
          ref={compassDialRef}
          className="relative w-80 h-80 touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 罗盘背景 - 静态部分 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl border-4 border-slate-200/70 overflow-hidden">
            {/* 添加微妙的同心圆纹理 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[95%] h-[95%] rounded-full border border-slate-200/50"></div>
              <div className="absolute w-[85%] h-[85%] rounded-full border border-slate-200/40"></div>
              <div className="absolute w-[75%] h-[75%] rounded-full border border-slate-200/30"></div>
              <div className="absolute w-[65%] h-[65%] rounded-full border border-slate-200/20"></div>
            </div>

            {/* 添加微妙的光泽效果 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-70"></div>
          </div>

          {/* 罗盘外圈 - 可旋转部分 */}
          <div className="absolute inset-0 rounded-full" style={{ transform: `rotate(${cumulativeRotation}deg)` }}>
            {/* 罗盘刻度 */}
            <div className="absolute inset-0 rounded-full">
              {/* 主要方向刻度 - 东南西北 */}
              {[0, 90, 180, 270].map((angle) => (
                <div
                  key={angle}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div
                    className={`absolute top-0 w-2 h-14 ${angle === 0 ? "bg-red-500" : "bg-blue-600"} left-1/2 -translate-x-1/2 rounded-b-sm`}
                  ></div>
                  <div
                    className={`absolute top-16 text-lg font-bold ${angle === 0 ? "text-red-500" : "text-blue-600"} left-1/2 -translate-x-1/2 whitespace-nowrap`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
                  >
                    {angle === 0 ? "北" : angle === 90 ? "东" : angle === 180 ? "南" : "西"}
                  </div>
                  <div
                    className={`absolute top-20 text-xs ${angle === 0 ? "text-red-400" : "text-blue-400"} left-1/2 -translate-x-1/2`}
                  >
                    {angle === 0 ? "N" : angle === 90 ? "E" : angle === 180 ? "S" : "W"}
                  </div>
                </div>
              ))}

              {/* 次要方向刻度 - 东北、东南、西南、西北 */}
              {[45, 135, 225, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="absolute top-0 w-1.5 h-10 bg-blue-500/80 left-1/2 -translate-x-1/2 rounded-b-sm"></div>
                  <div
                    className="absolute top-12 text-sm font-medium text-blue-500/80 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    style={{ textShadow: "0 1px 1px rgba(0,0,0,0.05)" }}
                  >
                    {angle === 45 ? "东北" : angle === 135 ? "东南" : angle === 225 ? "西南" : "西北"}
                  </div>
                  <div
                    className="absolute top-16 text-xs text-blue-400/70 left-1/2 -translate-x-1/2"
                  >
                    {angle === 45 ? "NE" : angle === 135 ? "SE" : angle === 225 ? "SW" : "NW"}
                  </div>
                </div>
              ))}

              {/* 30度刻度 */}
              {[30, 60, 120, 150, 210, 240, 300, 330].map((angle) => (
                <div
                  key={angle}
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <div className="absolute top-0 w-1 h-7 bg-blue-400/60 left-1/2 -translate-x-1/2"></div>
                  <div className="absolute top-8 text-xs font-medium text-blue-400/70 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    {angle}°
                  </div>
                </div>
              ))}

              {/* 细分刻度 - 每10度一个 */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10
                // 跳过已有的刻度位置
                if (angle % 30 !== 0) {
                  return (
                    <div
                      key={`tick-${angle}`}
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div className="absolute top-0 w-0.5 h-5 bg-blue-300/50 left-1/2 -translate-x-1/2"></div>
                    </div>
                  )
                }
                return null
              })}

              {/* 度数刻度环 */}
              <div className="absolute inset-[10%] rounded-full border-2 border-blue-100"></div>
            </div>

            {/* 添加旋转指示器 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-[16px] border-l-transparent border-r-transparent border-b-red-500 mx-auto"></div>
            </div>
          </div>

          {/* 罗盘中心 - 固定部分 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white shadow-lg flex items-center justify-center z-10 border-4 border-slate-200">
            <div className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
              <div className="relative">
                <Compass className="h-24 w-24 text-blue-500 opacity-40" />
                {/* 添加当前角度数字显示 */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-2xl font-bold text-blue-600">
                  {displayAngle}°
                </div>
              </div>
            </div>

            {/* 添加微妙的光泽效果 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/60 to-transparent opacity-80"></div>
          </div>

          {/* 添加旋转提示 */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-blue-50 px-4 py-2 rounded-full text-base text-blue-600 shadow-md border border-blue-100 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin-slow"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
            </svg>
            旋转调整方向
          </div>
        </div>

        {/* 当前角度显示 */}
        <div className="flex flex-col items-center gap-1 mt-4">
          <div className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
            <span>{displayAngle}°</span>
            <span className="text-lg text-slate-100">({getOrientationName(displayAngle)})</span>
          </div>
          <div className="text-base text-white bg-blue-600/80 px-4 py-2 rounded-full mt-2 shadow-lg">
            点击空白区域确认设置
          </div>
        </div>
      </div>
    </div>
  )
}
