"use client"

import type React from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GuideButtonProps {
  onClick: () => void
}

export const GuideButton: React.FC<GuideButtonProps> = ({ onClick }) => {
  // 将按钮从左上角移到右上角，避免遮挡logo
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-21 z-30 rounded-full w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 active:scale-95 transition-all duration-75 shadow-md"
      onClick={onClick}
      aria-label="使用指南"
    >
      <HelpCircle className="h-5 w-5 text-primary" />
    </Button>
  )
}
