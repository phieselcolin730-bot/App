"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], onValueChange, max = 100, min = 0, step = 1, disabled = false, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const isDragging = React.useRef(false)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const handlePointerDown = (event: React.PointerEvent) => {
      if (disabled) return
      
      isDragging.current = true
      const slider = sliderRef.current
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const newValues = [Math.max(min, Math.min(max, steppedValue))]
      
      setInternalValue(newValues)
      onValueChange?.(newValues)

      // Handle pointer capture for dragging
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    const handlePointerMove = (event: React.PointerEvent) => {
      if (disabled || !isDragging.current) return

      const slider = sliderRef.current
      if (!slider) return

      const rect = slider.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const newValue = min + percentage * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const newValues = [Math.max(min, Math.min(max, steppedValue))]
      
      setInternalValue(newValues)
      onValueChange?.(newValues)
    }

    const handlePointerUp = (event: React.PointerEvent) => {
      isDragging.current = false
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const percentage = ((internalValue[0] - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
          <div
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }