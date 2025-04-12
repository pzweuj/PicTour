import { Button } from "@/components/ui/button"
import Link from "next/link"
import MapNavigation from "@/components/map-navigation"

export default function NavigationPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-0">
      <div className="w-full h-full relative">
        <div className="absolute top-4 left-4 z-10">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              ← 返回首页
            </Button>
          </Link>
        </div>

        <MapNavigation />
      </div>
    </main>
  )
}
