"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"

interface ToolbarProps {
  onOpenMap: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenMap, fileInputRef }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center z-20">
      <div className="h-8 w-auto relative -mt-4">
        <Image src="/logo_cha.png" alt="PicTour Logo" width={120} height={32} className="object-contain" priority />
      </div>

      {/* 打开地图按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex items-center gap-1 bg-background/90 active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
          onClick={onOpenMap}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sm:inline">打开地图</span>
        </Button>
      </div>
    </div>
  )
}
