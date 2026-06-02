"use client"

import type React from "react"
import { Database, MapPin, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PrivacyModalProps {
  isOpen: boolean
  onAccept: () => void
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onAccept }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-lg"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            隐私政策
          </DialogTitle>
          <DialogDescription>
            PicTour 只在您的设备本地处理地图和定位数据，不会上传到服务器。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <div className="flex gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="font-medium">地图和校准数据仅保存在本地</div>
              <p className="text-muted-foreground">
                导入的地图图片、方向、比例尺和校准点会保存在当前浏览器的 IndexedDB 中，方便下次打开继续使用。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="font-medium">定位只用于本地计算</div>
              <p className="text-muted-foreground">
                GPS 位置只用于把您的当前位置换算到图片地图上，不会被发送、同步或分享。
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-3 text-muted-foreground">
            您可以随时使用顶部的清理缓存按钮删除本地保存的地图和校准数据。语言偏好和是否已阅读隐私政策会继续保存在本地。
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onAccept}>我知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
