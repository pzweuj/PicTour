import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import SavedMaps from "@/components/saved-maps"

export default function MyMapsPage() {
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
            <CardTitle>我的地图</CardTitle>
            <CardDescription>管理您保存的景区地图</CardDescription>
          </CardHeader>
          <CardContent>
            <SavedMaps />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
