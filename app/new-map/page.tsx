import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import MapUploader from "@/components/map-uploader"

export default function NewMapPage() {
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>添加新地图</CardTitle>
            <CardDescription>拍摄或上传景区地图图片</CardDescription>
          </CardHeader>
          <CardContent>
            <MapUploader />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
