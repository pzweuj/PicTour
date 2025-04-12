import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import MapCalibration from "@/components/map-calibration"

export default function CalibratePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/new-map">
            <Button variant="ghost" size="sm">
              ← 返回
            </Button>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>校准地图</CardTitle>
            <CardDescription>设置地图方位、比例尺和参考点</CardDescription>
          </CardHeader>
          <CardContent>
            <MapCalibration />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
