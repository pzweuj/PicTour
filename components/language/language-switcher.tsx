"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  const handleToggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh'
    setLanguage(newLanguage)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleLanguage}
      className="rounded-full w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90 active:scale-95 transition-all duration-75 shadow-md"
      title={t.toolbar.language}
    >
      <span className="text-sm font-medium">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </Button>
  )
}
