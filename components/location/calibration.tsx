"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, ArrowRight, X, AlertTriangle } from "lucide-react"
import type { CalibrationPoint, GPSCoordinate } from "@/lib/location-utils"
import { positionToGPSCoordinate, calculateDistance, isCalibrationDistanceSufficient } from "@/lib/location-utils"
import type { MapCoordinate } from "@/lib/types"

interface CalibrationProps {
  onComplete: (orientation: number, scale: number) => void
  onCancel: () => void
  onSetMapPoint: (callback: (point: MapCoordinate) => void) => void
}

export const Calibration: React.FC<CalibrationProps> = ({ onComplete, onCancel, onSetMapPoint }) => {
  // 校准状态
  const [step, setStep] = useState<"initial" | "point1" | "moving" | "point2" | "calculating">("initial")
  // 校准点
  const [point1, setPoint1] = useState<CalibrationPoint | null>(null)
  const [point2, setPoint2] = useState<CalibrationPoint | null>(null)
  // 当前GPS位置
  const [currentGPS, setCurrentGPS] = useState<GPSCoordinate | null>(null)
  // 移动距离
  const [movedDistance, setMovedDistance] = useState<number>(0)
  // 错误信息
  const [error, setError] = useState<string | null>(null)

  // 监听位置变化
  useEffect(() => {
    if (step === "moving" && point1 && currentGPS) {
      const distance = calculateDistance(point1.gpsCoord, currentGPS)
      setMovedDistance(distance)
    }
  }, [currentGPS, point1, step])

  // 开始位置监听
  useEffect(() => {
    let watchId: number | null = null

    if (step === "moving" || step === "point1" || step === "point2") {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const gpsCoord = positionToGPSCoordinate(position)
          setCurrentGPS(gpsCoord)
          setError(null)
        },
        (err) => {
          console.error("位置监听错误:", err)
          setError(`获取位置失败: ${getGeolocationErrorMessage(err)}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        },
      )
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [step])

  // 开始校准
  const startCalibration = async () => {
    try {
      setStep("point1")
      setError(null)
    } catch (err) {
      console.error("开始校准失败:", err)
      setError("无法启动校准过程，请确保已授予位置权限。")
    }
  }

  // 设置第一个点
  const setFirstPoint = () => {
    if (!currentGPS) {
      setError("无法获取当前位置，请确保GPS已开启。")
      return
    }

    // 请求用户在地图上标记当前位置
    onSetMapPoint((mapCoord) => {
      setPoint1({
        mapCoord,
        gpsCoord: currentGPS,
      })
      setStep("moving")
    })
  }

  // 设置第二个点
  const setSecondPoint = () => {
    if (!currentGPS || !point1) {
      setError("无法获取当前位置或第一个点未设置。")
      return
    }

    // 检查移动距离是否足够
    if (!isCalibrationDistanceSufficient(point1.gpsCoord, currentGPS)) {
      setError("移动距离不足，请至少移动10米以获得准确的校准结果。")
      return
    }

    // 请求用户在地图上标记当前位置
    onSetMapPoint((mapCoord) => {
      setPoint2({
        mapCoord,
        gpsCoord: currentGPS,
      })
      setStep("calculating")

      // 计算方向和比例尺
      calculateResults()
    })
  }

  // 计算结果
  const calculateResults = () => {
    if (!point1 || !point2) {
      setError("校准点数据不完整，无法计算结果。")
      return
    }

    try {
      // 导入计算函数
      import("@/lib/location-utils").then(({ calculateMapOrientationAndScale }) => {
        const { orientation, scale } = calculateMapOrientationAndScale(point1, point2)

        // 完成校准
        onComplete(orientation, scale)
      })
    } catch (err) {
      console.error("计算校准结果失败:", err)
      setError("计算校准结果失败，请重试。")
    }
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-5 w-5" />
              <h3 className="font-medium">两点校准</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              通过两点校准可以自动计算地图的方向和比例尺。您需要在地图上标记两个点，并在实际环境中从第一个点移动到第二个点。
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </div>
                <p className="text-sm">在地图上标记您的当前位置</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </div>
                <p className="text-sm">沿直线移动一段距离（至少10米）</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </div>
                <p className="text-sm">在地图上标记您的新位置</p>
              </div>
            </div>
            <Button onClick={startCalibration} className="w-full">
              开始校准
            </Button>
          </div>
        )

      case "point1":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h3 className="font-medium">设置第一个点</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              请在地图上标记您的当前位置。确保您站在一个容易识别的位置，以便稍后能够准确地在地图上标记。
            </p>
            {currentGPS && (
              <div className="rounded-md bg-muted p-2 text-xs">
                <div>纬度: {currentGPS.latitude.toFixed(6)}</div>
                <div>经度: {currentGPS.longitude.toFixed(6)}</div>
                <div>精度: {currentGPS.accuracy ? `±${currentGPS.accuracy.toFixed(1)}米` : "未知"}</div>
              </div>
            )}
            <Button onClick={setFirstPoint} className="w-full" disabled={!currentGPS}>
              标记当前位置
            </Button>
          </div>
        )

      case "moving":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ArrowRight className="h-5 w-5" />
              <h3 className="font-medium">移动到第二个点</h3>
            </div>
            <p className="text-sm text-muted-foreground">请沿直线移动至少10米的距离。移动距离越远，校准结果越准确。</p>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold">{movedDistance.toFixed(1)}米</div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${movedDistance >= 10 ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min((movedDistance / 20) * 100, 100)}%` }}
                ></div>
              </div>
              {movedDistance < 10 && (
                <div className="flex items-center gap-1 text-xs text-amber-500">
                  <AlertTriangle className="h-3 w-3" />
                  <span>请至少移动10米以获得准确结果</span>
                </div>
              )}
            </div>
            <Button
              onClick={setSecondPoint}
              className="w-full"
              disabled={movedDistance < 5}
              variant={movedDistance >= 10 ? "default" : "outline"}
            >
              标记第二个点
            </Button>
          </div>
        )

      case "point2":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <h3 className="font-medium">设置第二个点</h3>
            </div>
            <p className="text-sm text-muted-foreground">请在地图上标记您的当前位置。</p>
            {currentGPS && (
              <div className="rounded-md bg-muted p-2 text-xs">
                <div>纬度: {currentGPS.latitude.toFixed(6)}</div>
                <div>经度: {currentGPS.longitude.toFixed(6)}</div>
                <div>精度: {currentGPS.accuracy ? `±${currentGPS.accuracy.toFixed(1)}米` : "未知"}</div>
              </div>
            )}
            <Button onClick={setSecondPoint} className="w-full" disabled={!currentGPS}>
              标记当前位置
            </Button>
          </div>
        )

      case "calculating":
        return (
          <div className="space-y-4 flex flex-col items-center justify-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm">正在计算校准结果...</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-[90%] max-w-md">
        <CardContent className="p-4 space-y-4">
          {renderStepContent()}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {step !== "initial" && step !== "calculating" && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                取消校准
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 获取地理位置错误的友好消息
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "用户拒绝了位置请求。"
    case error.POSITION_UNAVAILABLE:
      return "位置信息不可用。"
    case error.TIMEOUT:
      return "获取位置请求超时。"
    default:
      return "未知错误。"
  }
}
