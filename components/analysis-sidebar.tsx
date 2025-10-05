"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface AnalysisSidebarProps {
  selectedLocation: { lat: number; lng: number } | null
  activeTab: string
  selectedDate: string
  hotspotsVisible?: boolean
  onHotspotsToggle?: () => void
}

export default function AnalysisSidebar({ 
  selectedLocation, 
  activeTab, 
  selectedDate,
  hotspotsVisible = false,
  onHotspotsToggle
}: AnalysisSidebarProps) {
  
  // Mock data generation based on location and tab
  const generateAnalysisData = () => {
    if (!selectedLocation) return null
    
    const { lat, lng } = selectedLocation
    
    // Simulate different metrics based on location and data type
    const tchibSupport = Math.random() > 0.7 ? "No data" : (Math.random() * 100).toFixed(1)
    const shsrRisk = Math.random() > 0.6 ? "—" : (Math.random() * 100).toFixed(1) + "%"
    
    // Simulate factor contributions
    const factors = [
      { name: "Sea Surface Temperature", value: (15 + Math.random() * 15).toFixed(1) + "°C", impact: Math.random() > 0.5 ? "positive" : "negative" },
      { name: "Chlorophyll-a Concentration", value: (Math.random() * 2).toFixed(2) + " mg/m³", impact: Math.random() > 0.5 ? "positive" : "negative" },
      { name: "Eddy Kinetic Energy", value: (Math.random() * 500).toFixed(0) + " cm²/s²", impact: Math.random() > 0.5 ? "positive" : "negative" },
      { name: "Depth", value: (Math.random() * 4000).toFixed(0) + " m", impact: "neutral" },
    ]
    
    return {
      tchibSupport,
      shsrRisk,
      factors,
      coordinates: `${lat.toFixed(3)}°N, ${Math.abs(lng).toFixed(3)}°W`
    }
  }
  
  const analysisData = generateAnalysisData()
  
  if (!selectedLocation || !analysisData) {
    return (
      <div className="w-80 bg-card border-l border-border p-6">
        <h2 className="text-xl font-bold mb-4">Analysis</h2>
        <p className="text-muted-foreground text-center py-8">
          Click on the map to analyze a location
        </p>
      </div>
    )
  }
  
  return (
    <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold mb-2">Analysis</h2>
          <p className="text-sm text-muted-foreground">{analysisData.coordinates}</p>
        </div>
        
        {/* Main Metrics */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm">TCHI Support Score</h3>
              <Badge variant={analysisData.tchibSupport === "No data" ? "secondary" : "default"}>
                {activeTab === "probability" ? "Primary" : "Secondary"}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {analysisData.tchibSupport === "No data" ? analysisData.tchibSupport : analysisData.tchibSupport}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-sm">SHSR Risk</h3>
              <Badge variant={analysisData.shsrRisk === "—" ? "secondary" : "destructive"}>
                {activeTab === "risk" ? "Primary" : "Secondary"}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {analysisData.shsrRisk}
            </div>
          </Card>
        </div>
        
        <Separator />
        
        {/* Factor Contributions */}
        <div>
          <h3 className="font-semibold mb-3">Factor contributions</h3>
          {Math.random() > 0.3 ? (
            <div className="space-y-3">
              {analysisData.factors.map((factor, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{factor.name}</div>
                    <div className="text-xs text-muted-foreground">{factor.value}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    factor.impact === "positive" ? "bg-green-500" :
                    factor.impact === "negative" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No factor data available for this location.
            </p>
          )}
        </div>
        
        <Separator />
        
        {/* Time-series Section */}
        <div>
          <h3 className="font-semibold mb-3">Time-series</h3>
          <p className="text-sm text-muted-foreground mb-4">No data available</p>
          
          {/* Simulation Button */}
          <Button variant="outline" className="w-full mb-4">
            Run Mako-Sense Simulation
          </Button>
          
          {/* Hotspots Toggle */}
          {onHotspotsToggle && (
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={onHotspotsToggle}
            >
              {hotspotsVisible ? "Hide Hotspots" : "Show Hotspots"}
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground">
            Hotspots {hotspotsVisible ? "visible" : "hidden"}
          </div>
        </div>
        
        {/* Data Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Data from: {selectedDate}</p>
            <p>Sources: NASA PODAAC, CMEMS, OceanData</p>
            <p>Model: SharkScope TCHI v2.1</p>
          </div>
        </div>
      </div>
    </div>
  )
}