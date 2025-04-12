import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Camera, Compass, MapPin, Navigation } from "lucide-react"

export default function GuidePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← 返回首页
            </Button>
          </Link>
        </div>

        <Card className="w-full mb-6">
          <CardHeader>
            <CardTitle>使用指南</CardTitle>
            <CardDescription>了解如何使用PicTour进行景区导航</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="font-medium">步骤 1: 拍摄或导入地图</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                拍摄景区地图或从相册中选择已有的地图图片。确保地图图片清晰可见，并包含比例尺和方位标识。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                <h3 className="font-medium">步骤 2: 校准地图</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                设置地图的方位，确定地图上的北方指向。然后设置比例尺，即地图上1厘米代表实际距离的米数。最后，在地图上标记一个您知道确切位置的参考点。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-medium">步骤 3: 开始导航</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                完成校准后，应用将使用您设备的GPS定位功能在地图上显示您的实时位置。您可以使用缩放控制查看更多细节，使用跟踪按钮开启或关闭位置跟踪。
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <h3 className="font-medium">提示与技巧</h3>
              </div>
              <ul className="text-sm text-muted-foreground pl-7 space-y-1 list-disc ml-4">
                <li>确保您的设备GPS功能已开启</li>
                <li>在开阔区域校准地图可获得更准确的定位</li>
                <li>您可以保存多个地图以便日后使用</li>
                <li>如果定位不准确，尝试重新校准地图</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium">为什么我的位置显示不准确？</h4>
              <p className="text-sm text-muted-foreground">
                位置精度受多种因素影响，包括GPS信号强度、地图校准精度等。尝试在开阔区域重新校准地图，或确保您的设备GPS功能正常工作。
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium">如何提高定位精度？</h4>
              <p className="text-sm text-muted-foreground">
                确保地图校准准确，特别是比例尺和参考点的设置。在地图上标记多个参考点也有助于提高精度。
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-medium">我可以离线使用PicTour吗？</h4>
              <p className="text-sm text-muted-foreground">
                是的，一旦地图被保存，您可以在没有网络连接的情况下使用PicTour进行导航。但GPS定位功能仍需要正常工作。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
