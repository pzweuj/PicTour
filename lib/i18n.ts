// 支持的语言类型
export type Language = 'zh' | 'en'

// 翻译文本接口
export interface Translations {
  // 应用基本信息
  app: {
    title: string
    description: string
  }
  
  // 导航和工具栏
  toolbar: {
    openMap: string
    guide: string
    language: string
  }
  
  // 控制面板
  controls: {
    zoomIn: string
    zoomOut: string
    locate: string
    settings: string
    cancel: string
    confirm: string
    positionHint: string
  }
  
  // 罗盘相关
  compass: {
    north: string
    south: string
    east: string
    west: string
    northeast: string
    northwest: string
    southeast: string
    southwest: string
    rotateHint: string
    clickToConfirm: string
    currentDirection: string
  }
  
  // 设置面板
  settings: {
    title: string
    orientation: string
    scale: string
    position: string
    setPosition: string
    setOrientation: string
    currentScale: string
    meters: string
    scaleLabel: string
    scaleUnit: string
    actualScale: string
    positionHint: string
    closeSettings: string
    scaleChanges: string
  }
  
  // 位置和定位
  location: {
    locating: string
    located: string
    locationError: string
    permissionDenied: string
    positionUnavailable: string
    timeout: string
    unknownError: string
    noGeolocation: string
    positionSet: string
    positionUpdated: string
  }
  
  // 指南
  guide: {
    title: string
    subtitle: string
    step1: {
      title: string
      description: string
    }
    step2: {
      title: string
      description: string
    }
    step3: {
      title: string
      description: string
    }
    step4: {
      title: string
      description: string
    }
    close: string
    next: string
    previous: string
  }
  
  // 消息提示
  messages: {
    mapLoaded: string
    positionSet: string
    orientationSet: string
    locatedToPosition: string
  }
}

// 中文翻译
export const zhTranslations: Translations = {
  app: {
    title: "PicTour",
    description: "地图导览应用"
  },
  
  toolbar: {
    openMap: "导入地图",
    guide: "使用指南",
    language: "语言"
  },
  
  controls: {
    zoomIn: "放大",
    zoomOut: "缩小", 
    locate: "定位到当前位置",
    settings: "设置",
    cancel: "取消",
    confirm: "确认",
    positionHint: "将地图移动到您当前的位置，然后点击确认"
  },
  
  compass: {
    north: "北",
    south: "南",
    east: "东", 
    west: "西",
    northeast: "东北",
    northwest: "西北",
    southeast: "东南",
    southwest: "西南",
    rotateHint: "旋转调整方向",
    clickToConfirm: "点击空白区域确认设置",
    currentDirection: "当前方向"
  },
  
  settings: {
    title: "设置",
    orientation: "地图方向",
    scale: "比例尺",
    position: "位置",
    setPosition: "设置位置",
    setOrientation: "设置方向",
    currentScale: "当前比例尺",
    meters: "米",
    scaleLabel: "比例尺 (米/厘米)",
    scaleUnit: "米/厘米",
    actualScale: "当前实际比例尺",
    positionHint: "点击按钮后，拖动地图使图钉指向您的当前位置",
    closeSettings: "关闭设置",
    scaleChanges: "(随缩放变化)"
  },
  
  location: {
    locating: "正在定位...",
    located: "定位成功",
    locationError: "位置跟踪错误",
    permissionDenied: "用户拒绝了位置请求",
    positionUnavailable: "位置信息不可用",
    timeout: "获取位置请求超时",
    unknownError: "未知错误",
    noGeolocation: "您的浏览器不支持地理位置功能",
    positionSet: "位置已设置",
    positionUpdated: "您的位置已在地图上更新"
  },
  
  guide: {
    title: "使用指南",
    subtitle: "按照以下步骤设置您的地图导览",
    step1: {
      title: "导入地图",
      description: "点击顶部的\"导入地图\"按钮，选择您要使用的地图图片文件。"
    },
    step2: {
      title: "设置比例尺",
      description: "点击右下角的设置按钮，调整比例尺以匹配地图的实际比例。"
    },
    step3: {
      title: "调整方向",
      description: "点击右上角的罗盘，旋转调整地图方向与实际方向一致。"
    },
    step4: {
      title: "设置当前位置",
      description: "点击右下角的设置按钮，选择\"设置当前位置\"，然后在地图上标记您的位置。"
    },
    close: "我知道了",
    next: "下一步",
    previous: "上一步"
  },
  
  messages: {
    mapLoaded: "地图加载完成",
    positionSet: "位置已设置",
    orientationSet: "方向已设置",
    locatedToPosition: "已定位到当前位置"
  }
}

// 英文翻译
export const enTranslations: Translations = {
  app: {
    title: "PicTour",
    description: "Map Navigation App"
  },
  
  toolbar: {
    openMap: "Import Map",
    guide: "Guide",
    language: "Language"
  },
  
  controls: {
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    locate: "Locate Current Position", 
    settings: "Settings",
    cancel: "Cancel",
    confirm: "Confirm",
    positionHint: "Move the map to your current location, then click confirm"
  },
  
  compass: {
    north: "North",
    south: "South", 
    east: "East",
    west: "West",
    northeast: "Northeast",
    northwest: "Northwest", 
    southeast: "Southeast",
    southwest: "Southwest",
    rotateHint: "Rotate to adjust direction",
    clickToConfirm: "Click outside to confirm settings",
    currentDirection: "Current Direction"
  },
  
  settings: {
    title: "Settings",
    orientation: "Map Orientation",
    scale: "Scale",
    position: "Position",
    setPosition: "Set Position",
    setOrientation: "Set Orientation",
    currentScale: "Current Scale",
    meters: "meters",
    scaleLabel: "Scale (meters/cm)",
    scaleUnit: "meters/cm",
    actualScale: "Current actual scale",
    positionHint: "After clicking the button, drag the map to point the pin to your current location",
    closeSettings: "Close Settings",
    scaleChanges: "(changes with zoom)"
  },
  
  location: {
    locating: "Locating...",
    located: "Located Successfully", 
    locationError: "Location Tracking Error",
    permissionDenied: "User denied location request",
    positionUnavailable: "Position information unavailable",
    timeout: "Location request timeout",
    unknownError: "Unknown error",
    noGeolocation: "Your browser doesn't support geolocation",
    positionSet: "Position Set",
    positionUpdated: "Your position has been updated on the map"
  },
  
  guide: {
    title: "User Guide",
    subtitle: "Follow these steps to set up your map navigation",
    step1: {
      title: "Import Map",
      description: "Click the \"Import Map\" button at the top to select the map image file you want to use."
    },
    step2: {
      title: "Set Scale",
      description: "Click the settings button in the bottom-right corner and adjust the scale to match the actual scale of the map."
    },
    step3: {
      title: "Adjust Direction",
      description: "Click the compass in the top-right corner and rotate to align the map direction with reality."
    },
    step4: {
      title: "Set Current Position",
      description: "Click the settings button in the bottom-right corner, select \"Set Position\", and then mark your location on the map."
    },
    close: "Got it",
    next: "Next",
    previous: "Previous"
  },
  
  messages: {
    mapLoaded: "Map loaded successfully",
    positionSet: "Position set",
    orientationSet: "Orientation set", 
    locatedToPosition: "Located to current position"
  }
}

// 翻译映射
export const translations = {
  zh: zhTranslations,
  en: enTranslations
}

// 获取翻译文本的辅助函数
export function getTranslation(language: Language): Translations {
  return translations[language]
}
