"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'
import type { Language } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ]

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="active:shadow-lg active:scale-95 transition-all duration-75 shadow-none hover:bg-background/50"
        title={t.toolbar.language}
      >
        <Languages className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 语言选择菜单 */}
          <div className="absolute top-full right-0 mt-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50 min-w-[140px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
