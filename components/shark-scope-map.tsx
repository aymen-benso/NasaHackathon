"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnalysisSidebar from "@/components/analysis-sidebar"
import PacketDecoder from "@/components/packet-decoder"
import { ThemeToggle } from "@/components/theme-toggle"

const OceanographicMap = dynamic(() => import("@/components/oceanographic-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[oklch(0.75_0.05_200)]">
      <p className="text-foreground">Loading map...</p>
    </div>
  ),
})

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export default function SharkScopeMap() {
  const [selectedDate, setSelectedDate] = useState("2025-09-05")
  const [activeTab, setActiveTab] = useState("risk")
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [hotspotsVisible, setHotspotsVisible] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold tracking-tight text-primary">SHARK</div>
            <div className="text-2xl font-bold tracking-tight text-foreground">SCOPE</div>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-1 text-sm font-semibold tracking-wide text-foreground">
            <span>BIO</span>
            <span className="text-primary">NAUTS</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/80 backdrop-blur-sm">
            <TabsTrigger
              value="risk"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Risk
            </TabsTrigger>
            <TabsTrigger
              value="probability"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Probability
            </TabsTrigger>
            <TabsTrigger
              value="hotspots"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Hotspots
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Info
            </TabsTrigger>
            <TabsTrigger
              value="credits"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Credits
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Export PNG
            </TabsTrigger>
            <TabsTrigger
              value="track"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Show Shark Track
            </TabsTrigger>
            <TabsTrigger
              value="decoder"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Packet Decoder
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map Section */}
        <div className="relative flex-1">
          <div className="absolute left-1/2 top-6 z-[1000] flex -translate-x-1/2 items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 bg-card/95 p-0 backdrop-blur-md hover:bg-card/100 hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronLeftIcon />
            </Button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-lg border border-border/50 bg-card/95 px-4 text-sm font-medium text-foreground backdrop-blur-md shadow-lg transition-all hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              size="sm"
              variant="secondary"
              className="h-10 w-10 bg-card/95 p-0 backdrop-blur-md hover:bg-card/100 hover:border-primary/50 transition-all shadow-lg"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              size="sm"
              className="h-10 bg-primary/90 px-4 text-primary-foreground backdrop-blur-md hover:bg-primary shadow-lg transition-all"
            >
              <PlayIcon />
              <span className="ml-2 font-medium">Play</span>
            </Button>
          </div>

          {/* Main Content */}
          {activeTab === 'decoder' ? (
            <div className="flex-1 overflow-y-auto p-6">
              <PacketDecoder />
            </div>
          ) : (
            <>
              {/* Map */}
              <OceanographicMap
                onLocationSelect={(lat: number, lng: number) => setSelectedLocation({ lat, lng })}
                activeTab={activeTab}
                hotspotsVisible={hotspotsVisible}
                selectedDate={selectedDate}
              />

              <div className="absolute bottom-8 left-1/2 z-[1000] w-[600px] -translate-x-1/2">
                <Card className="border-border/50 bg-card/95 p-5 backdrop-blur-md shadow-2xl">
                  <p className="mb-3 text-sm font-semibold text-foreground">Available data dates</p>
                  <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                  <p className="mt-3 text-center text-sm font-medium text-muted-foreground">Sep 5, 2025</p>
                </Card>
              </div>
            </>
          )}
        </div>

        <AnalysisSidebar 
          selectedLocation={selectedLocation}
          activeTab={activeTab}
          selectedDate={selectedDate}
          hotspotsVisible={hotspotsVisible}
          onHotspotsToggle={() => setHotspotsVisible(!hotspotsVisible)}
        />
      </div>

      <footer className="border-t border-border/50 bg-card/50 px-6 py-3 text-xs text-muted-foreground backdrop-blur-sm">
        <span className="font-medium">SharkScope</span> by Team Bionauts. Click here for License & Usage
      </footer>
    </div>
  )
}
