"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, MoreVertical, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// 模拟保存的地图数据
const mockMaps = [
  { id: 1, name: "欢乐谷景区地图", date: "2023-04-15", image: "/placeholder.svg?height=200&width=150" },
  { id: 2, name: "故宫博物院", date: "2023-05-22", image: "/placeholder.svg?height=200&width=150" },
  { id: 3, name: "颐和园", date: "2023-06-10", image: "/placeholder.svg?height=200&width=150" },
]

export default function SavedMaps() {
  const router = useRouter()
  const { toast } = useToast()
  const [maps, setMaps] = useState(mockMaps)

  const handleNavigate = (id: number) => {
    // 在实际应用中，这里会加载特定地图的数据
    router.push("/navigation")
  }

  const handleDelete = (id: number) => {
    setMaps(maps.filter((map) => map.id !== id))
    toast({
      title: "地图已删除",
      description: "地图已成功删除",
    })
  }

  const handleEdit = (id: number) => {
    // 在实际应用中，这里会导航到编辑页面
    toast({
      title: "编辑地图",
      description: "地图编辑功能即将推出",
    })
  }

  return  => {
    // 在实际应用中，这里会导航到编辑页面
    toast({
      title: "编辑地图",
      description: "地图编辑功能即将推出",
    })
  }

  return (
    (
    <div className="flex flex-col gap-4">\
      {maps.length > 0 ? (
        maps.map((map) => (
          <Card key={map.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image 
                    src={map.image || "/placeholder.svg"} 
                    alt={map.name} 
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <h3 className="font-medium">{map.name}</h3>
                  <p className="text-sm text-muted-foreground">保存于 {map.date}</p>
                </div>
                <div className="flex gap-2 p-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleNavigate(map.id)}
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(map.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>编辑</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(map.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>删除</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">您还没有保存任何地图</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push("/new-map")}
          >
            添加新地图
          </Button>
        </div>
      )}
    </div>
  )
}
