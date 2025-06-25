"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Sun, Sparkles } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

const themes = [
  { name: "light", icon: Sun },
  { name: "dark", icon: Moon },
  { name: "glass", icon: Sparkles },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)

  const handleThemeChange = (newTheme: "light" | "dark" | "glass") => {
    setTheme(newTheme)
    setIsExpanded(false)
  }


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [switcherRef])


  const MainIcon = themes.find((t) => t.name === theme)?.icon || Sparkles

  return (
    <div ref={switcherRef} className="relative flex items-center justify-end">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: "auto", opacity: 1, marginRight: "0.5rem" }}
            exit={{ width: 0, opacity: 0, marginRight: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex items-center gap-2 overflow-hidden"
          >
            {themes.map((t) => (
              <Button
                key={t.name}
                variant={theme === t.name ? "default" : "outline"}
                size="icon"
                onClick={() => handleThemeChange(t.name as "light" | "dark" | "glass")}
                aria-label={`Switch to ${t.name} theme`}
                className="rounded-tr-xl"
              >
                <t.icon className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label="Toggle theme selection"
        className="rounded-tr-xl"
      >
        <MainIcon className="h-[1.2rem] w-[1.2rem] transition-transform duration-300" />
      </Button>
    </div>
  )
}