"use client"

import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImageIcon, HelpCircle } from "lucide-react"
import { LanguageSwitcher } from "@/components/language/language-switcher"
import { useLanguage } from "@/contexts/language-context"

interface ToolbarProps {
  onOpenMap: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onGuideClick?: () => void // 添加指南按钮点击事件
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenMap, fileInputRef, onGuideClick }) => {
  const { t } = useLanguage()

  return (
    <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center z-20">
      <div className="h-8 w-auto relative -mt-4">
        <Image src="/logo_cha.png" alt="PicTour Logo" width={120} height={32} className="object-contain" priority />
      </div>

      {/* 按钮组 */}
      <div className="flex gap-2 items-center">
        {/* 语言切换器 */}
        <LanguageSwitcher />

        {/* 使用指南按钮 */}
        {onGuideClick && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 active:scale-95 transition-all duration-75 shadow-md"
            onClick={onGuideClick}
            aria-label={t.toolbar.guide}
          >
            <HelpCircle className="h-5 w-5 text-primary" />
          </Button>
        )}

        {/* 打开地图按钮 */}
        <Button
          variant="outline"
          className="flex items-center gap-1 bg-background/90 active:shadow-lg active:scale-95 transition-all duration-75 shadow-none"
          onClick={onOpenMap}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sm:inline">{t.toolbar.openMap}</span>
        </Button>
      </div>
    </div>
  )
}
