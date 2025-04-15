"use client"

import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImageIcon, Compass, MapPin, Ruler } from "lucide-react"

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">使用指南</DialogTitle>
          <DialogDescription>按照以下步骤设置您的地图导览</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 第一步：打开地图 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">1</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                打开地图
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              点击顶部的"打开地图"按钮，选择您要使用的地图图片文件。
            </p>
          </div>

          {/* 第二步：设定方位 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">2</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                设定方位
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              点击右上角的罗盘图标，旋转罗盘使其与地图的北方向一致。
            </p>
          </div>

          {/* 第三步：设定比例尺 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">3</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                设定比例尺
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              点击右下角的设置按钮，调整比例尺数值使其与地图实际比例相符。
            </p>
          </div>

          {/* 第四步：设置当前位置 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">4</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                设置当前位置
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              点击右下角的设置按钮，选择"设置当前位置"，然后在地图上标记您的位置。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>我知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
