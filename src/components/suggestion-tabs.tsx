'use client'

import { useState } from 'react'
import { Sparkles, BookOpen, Code, Lightbulb } from 'lucide-react'
import { Button } from './ui/button'

const SUGGESTIONS = {
  Create: [
    { icon: <Sparkles size={16} />, text: 'SaaS landing page wireframe' },
    { icon: <Sparkles size={16} />, text: 'E-commerce checkout flow' },
    { icon: <Sparkles size={16} />, text: 'Give me productivity app ideas' },
    { icon: <Sparkles size={16} />, text: 'Write a blog about AI trends' },
  ],
  Explore: [
    { icon: <BookOpen size={16} />, text: 'Web dev trends 2025' },
    { icon: <BookOpen size={16} />, text: 'Serverless pros & cons' },
    { icon: <BookOpen size={16} />, text: 'New JS/TS features' },
    { icon: <BookOpen size={16} />, text: 'Tech career paths' },
  ],
  Code: [
    { icon: <Code size={16} />, text: 'E-commerce user flow' },
    { icon: <Code size={16} />, text: 'API endpoint plan' },
    { icon: <Code size={16} />, text: 'User flow diagram' },
    { icon: <Code size={16} />, text: 'Design REST API' },
  ],
  Learn: [
    { icon: <Lightbulb size={16} />, text: 'AI prompting basics' },
    { icon: <Lightbulb size={16} />, text: 'UX writing tips' },
    { icon: <Lightbulb size={16} />, text: 'Prompt engineering 101' },
    { icon: <Lightbulb size={16} />, text: 'Good microcopy rules' },
  ],
}


const TABS = [
  { label: 'Create', icon: Sparkles },
  { label: 'Explore', icon: BookOpen },
  { label: 'Code', icon: Code },
  { label: 'Learn', icon: Lightbulb },
]

export const SuggestionTabs = ({
  onSubmit,
}: {
  onSubmit: (val: string) => void
}) => {
  const [activeTab, setActiveTab] = useState('Create')

  return (
    <div className="w-full text-center">
      <div className="mb-3 flex flex-wrap justify-center gap-2">
        {TABS.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            onClick={() => setActiveTab(label)}
            className="flex h-full flex-col items-center gap-1 rounded-xl border px-4 py-2 font-medium text-sm sm:flex-row sm:px-3 sm:py-3"
          >
            <Icon size={14} />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-rows-2 items-center gap-2 sm:grid-cols-2">
        {SUGGESTIONS[activeTab as keyof typeof SUGGESTIONS].map(({ icon, text }, i) => (
          <Button
            key={i}
            onClick={() => onSubmit(text)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm"
          >
            <span className="text-center">{icon}</span>
            <span className="text-center">{text}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
