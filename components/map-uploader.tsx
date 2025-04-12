"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function MapUploader() {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setSelectedImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    // 在实际应用中，这里会调用设备相机API
    // 为了演示，我们使用一个模拟的延迟和示例图片
    setIsLoading(true)
    setTimeout(() => {
      setSelectedImage("/placeholder.svg?height=400&width=300")
      setIsLoading(false)
    }, 1500)
  }

  const handleContinue = () => {
    // 在实际应用中，这里会保存图片到状态管理或本地存储
    // 然后导航到校准页面
    router.push("/calibrate")
  }

  return (
    <div className="flex flex-col gap-6">
      {!selectedImage ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            <Button onClick={handleCameraCapture} className="h-24 flex flex-col gap-2" disabled={isLoading}>
              <Camera className="h-6 w-6" />
              <span>{isLoading ? "拍摄中..." : "拍摄地图"}</span>
            </Button>

            <div className="relative h-24">
              <Button
                variant="outline"
                className="h-full w-full flex flex-col gap-2"
                onClick={() => document.getElementById("map-upload")?.click()}
              >
                <Upload className="h-6 w-6" />
                <span>从相册选择</span>
              </Button>
              <input type="file" id="map-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">请确保地图图片清晰可见，并包含比例尺和方位标识</p>
        </>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <div className="relative w-full aspect-[3/4] max-h-[400px] overflow-hidden rounded-md border">
            <Image src={selectedImage || "/placeholder.svg"} alt="Selected map" fill className="object-contain" />
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              重新选择
            </Button>
            <Button onClick={handleContinue}>继续校准</Button>
          </div>
        </div>
      )}
    </div>
  )
}
