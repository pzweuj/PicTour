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
import { useLanguage } from "@/contexts/language-context"

interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage()
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">{t.guide.title}</DialogTitle>
          <DialogDescription>{t.guide.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 第一步：导入地图 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">1</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                {t.guide.step1.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {t.guide.step1.description}
            </p>
          </div>

          {/* 第二步：设置比例尺 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">2</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" />
                {t.guide.step2.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {t.guide.step2.description}
            </p>
          </div>

          {/* 第三步：调整方向 */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <span className="font-semibold text-primary">3</span>
              </div>
              <h3 className="font-medium flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                {t.guide.step3.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {t.guide.step3.description}
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
                {t.guide.step4.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              {t.guide.step4.description}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t.guide.close}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
