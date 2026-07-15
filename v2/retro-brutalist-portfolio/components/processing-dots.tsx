"use client"

import { useEffect, useState } from "react"

export function ProcessingDots({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev + 1) % 4)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`processing-dots ${className}`} aria-hidden="true">
      {".".repeat(count)}
    </span>
  )
}

export function ProcessingText({
  children,
  className = "",
}: {
  children: string
  className?: string
}) {
  const base = children.replace(/\.{3}\s*$/, "")

  return (
    <span className={className}>
      {base}
      <ProcessingDots />
    </span>
  )
}
