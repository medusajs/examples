"use client"

import { CheckCircle } from "@medusajs/icons"
import { clx, Heading } from "@medusajs/ui"
import { useRouter } from "next/navigation"

type CardProps = {
  title: string
  isActive: boolean
  isDone: boolean
  path: string
  children: React.ReactNode
}

export const Card = ({
  title,
  isActive,
  isDone,
  path,
  children
}: CardProps) => {
  const router = useRouter()

  return (
    <div className={clx(
      "bg-ui-bg-base rounded-lg py-4 px-6 w-full",
      "flex gap-4 flex-col shadow-elevation-card-rest",
      !isActive && "cursor-pointer"
    )}
    onClick={() => {
      if (isActive) {
        return
      }
      
      router.push(path)
    }}
    >
      <Heading level="h2" className="flex justify-between items-center">
        <span>{title}</span>
        {isDone && <CheckCircle className="text-ui-tag-green-icon" />}
      </Heading>
      {isActive && children}
    </div>
  )
}