"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Language, Translations } from '@/lib/i18n'
import { getTranslation } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('zh')
  const [t, setTranslations] = useState<Translations>(getTranslation('zh'))

  // 从localStorage加载保存的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('pictour-language') as Language
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage)
      setTranslations(getTranslation(savedLanguage))
    }
  }, [])

  // 更新语言设置
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    setTranslations(getTranslation(newLanguage))
    localStorage.setItem('pictour-language', newLanguage)
    
    // 更新HTML lang属性
    document.documentElement.lang = newLanguage === 'zh' ? 'zh-CN' : 'en'
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
