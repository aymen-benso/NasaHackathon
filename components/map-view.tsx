"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface MapViewProps {
  onLocationSelect: (lat: number, lng: number) => void
  activeTab: string
  hotspotsVisible: boolean
}

export default function MapView({ onLocationSelect, activeTab, hotspotsVisible }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [markers, setMarkers] = useState<Array<{ lat: number; lng: number }>>([])

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "#4a9fb5")
    gradient.addColorStop(0.3, "#3a8fa5")
    gradient.addColorStop(0.7, "#2a7f95")
    gradient.addColorStop(1, "#1a6f85")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw simplified landmasses (North Atlantic region)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    ctx.fillStyle = "#2d3748"
    ctx.strokeStyle = "#1a202c"
    ctx.lineWidth = 1.5 / zoom

    // Greenland
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.35, canvas.height * 0.15)
    ctx.lineTo(canvas.width * 0.45, canvas.height * 0.12)
    ctx.lineTo(canvas.width * 0.5, canvas.height * 0.18)
    ctx.lineTo(canvas.width * 0.48, canvas.height * 0.35)
    ctx.lineTo(canvas.width * 0.4, canvas.height * 0.38)
    ctx.lineTo(canvas.width * 0.32, canvas.height * 0.3)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Iceland
    ctx.beginPath()
    ctx.arc(canvas.width * 0.52, canvas.height * 0.35, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Norway/Scandinavia
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.6, canvas.height * 0.25)
    ctx.lineTo(canvas.width * 0.68, canvas.height * 0.2)
    ctx.lineTo(canvas.width * 0.72, canvas.height * 0.3)
    ctx.lineTo(canvas.width * 0.7, canvas.height * 0.45)
    ctx.lineTo(canvas.width * 0.62, canvas.height * 0.5)
    ctx.lineTo(canvas.width * 0.58, canvas.height * 0.4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // UK/Ireland
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.52, canvas.height * 0.52)
    ctx.lineTo(canvas.width * 0.56, canvas.height * 0.48)
    ctx.lineTo(canvas.width * 0.58, canvas.height * 0.55)
    ctx.lineTo(canvas.width * 0.55, canvas.height * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Eastern Canada/Labrador
    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.15, canvas.height * 0.3)
    ctx.lineTo(canvas.width * 0.25, canvas.height * 0.28)
    ctx.lineTo(canvas.width * 0.28, canvas.height * 0.4)
    ctx.lineTo(canvas.width * 0.22, canvas.height * 0.5)
    ctx.lineTo(canvas.width * 0.12, canvas.height * 0.45)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
    ctx.lineWidth = 0.5 / zoom
    for (let i = 0; i < 10; i++) {
      // Latitude lines
      ctx.beginPath()
      ctx.moveTo(0, (canvas.height / 10) * i)
      ctx.lineTo(canvas.width, (canvas.height / 10) * i)
      ctx.stroke()

      // Longitude lines
      ctx.beginPath()
      ctx.moveTo((canvas.width / 10) * i, 0)
      ctx.lineTo((canvas.width / 10) * i, canvas.height)
      ctx.stroke()
    }

    if (hotspotsVisible) {
      const hotspots = [
        { x: 0.4, y: 0.3, intensity: 0.8 },
        { x: 0.35, y: 0.45, intensity: 0.6 },
        { x: 0.5, y: 0.4, intensity: 0.9 },
        { x: 0.28, y: 0.35, intensity: 0.7 },
        { x: 0.45, y: 0.5, intensity: 0.5 },
      ]

      hotspots.forEach((spot) => {
        // Outer glow
        const outerGradient = ctx.createRadialGradient(
          canvas.width * spot.x,
          canvas.height * spot.y,
          0,
          canvas.width * spot.x,
          canvas.height * spot.y,
          80,
        )
        outerGradient.addColorStop(0, `rgba(251, 191, 36, ${spot.intensity * 0.4})`)
        outerGradient.addColorStop(0.5, `rgba(251, 191, 36, ${spot.intensity * 0.2})`)
        outerGradient.addColorStop(1, "rgba(251, 191, 36, 0)")
        ctx.fillStyle = outerGradient
        ctx.beginPath()
        ctx.arc(canvas.width * spot.x, canvas.height * spot.y, 80, 0, Math.PI * 2)
        ctx.fill()

        // Inner bright core
        const innerGradient = ctx.createRadialGradient(
          canvas.width * spot.x,
          canvas.height * spot.y,
          0,
          canvas.width * spot.x,
          canvas.height * spot.y,
          30,
        )
        innerGradient.addColorStop(0, `rgba(245, 158, 11, ${spot.intensity * 0.8})`)
        innerGradient.addColorStop(1, `rgba(251, 191, 36, ${spot.intensity * 0.3})`)
        ctx.fillStyle = innerGradient
        ctx.beginPath()
        ctx.arc(canvas.width * spot.x, canvas.height * spot.y, 30, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    markers.forEach((marker) => {
      const x = ((marker.lng + 180) / 360) * canvas.width
      const y = ((90 - marker.lat) / 180) * canvas.height

      // Outer glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 16)
      glowGradient.addColorStop(0, "rgba(6, 182, 212, 0.6)")
      glowGradient.addColorStop(1, "rgba(6, 182, 212, 0)")
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fill()

      // Marker circle
      ctx.fillStyle = "#06b6d4"
      ctx.strokeStyle = "#0891b2"
      ctx.lineWidth = 2 / zoom
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Inner highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
      ctx.beginPath()
      ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()
  }, [zoom, pan, hotspotsVisible, markers])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert pixel coordinates to lat/lng (simplified)
    const lng = (x / rect.width) * 360 - 180
    const lat = 90 - (y / rect.height) * 180

    setMarkers([...markers, { lat, lng }])
    onLocationSelect(lat, lng)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />

      <div className="absolute left-6 top-24 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/95 text-lg font-semibold text-foreground shadow-lg backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/50 bg-card/95 text-lg font-semibold text-foreground shadow-lg backdrop-blur-md transition-all hover:border-primary/50 hover:bg-card hover:text-primary"
        >
          −
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-[1000] rounded-lg border border-border/50 bg-card/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-md">
        500 km
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] text-xs font-medium text-muted-foreground">
        🇺🇦 Leaflet | © OSM contributors
      </div>
    </div>
  )
}
