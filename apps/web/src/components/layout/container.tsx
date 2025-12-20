import * as React from "react"

import { cn } from "@/lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full" | string
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const

function Container({
  className,
  maxWidth = "xl",
  ...props
}: ContainerProps) {
  const isPresetMaxWidth =
    typeof maxWidth === "string" && maxWidth in maxWidthClasses
  const maxWidthClass = isPresetMaxWidth
    ? maxWidthClasses[maxWidth as keyof typeof maxWidthClasses]
    : undefined

  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidthClass, className)}
      style={
        !isPresetMaxWidth && typeof maxWidth === "string"
          ? { maxWidth }
          : undefined
      }
      {...props}
    />
  )
}

export { Container }

