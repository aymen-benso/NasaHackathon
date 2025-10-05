"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface PacketData {
  timestamp: string
  latitude: number
  longitude: number
  battery: number
  firmware: string
  flags: string
  preyCode: string
  confidence: number
  raw: string
}

export default function PacketDecoder() {
  const [hexInput, setHexInput] = useState("")
  const [decodedData, setDecodedData] = useState<PacketData | null>(null)
  const [error, setError] = useState("")

  const decodePacket = () => {
    setError("")
    
    // Validate hex input
    const cleanHex = hexInput.replace(/\s/g, "").toLowerCase()
    if (!/^[0-9a-f]{64}$/.test(cleanHex)) {
      setError("Invalid hex format. Please enter exactly 32 bytes (64 hex characters).")
      return
    }

    try {
      // Mock decoding logic - in real implementation this would parse actual telemetry
      const bytes = cleanHex.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
      
      // Simulate timestamp (first 4 bytes as Unix timestamp)
      const timestamp = new Date((bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) * 1000)
      
      // Simulate coordinates (bytes 4-11 as lat/lng)
      const latRaw = (bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7])
      const lngRaw = (bytes[8] << 24 | bytes[9] << 16 | bytes[10] << 8 | bytes[11])
      const latitude = (latRaw / 10000000) - 90 // Convert to decimal degrees
      const longitude = (lngRaw / 10000000) - 180
      
      // Simulate other fields
      const battery = bytes[12] // Battery percentage
      const firmware = `${bytes[13]}.${bytes[14]}.${bytes[15]}`
      const flags = bytes[16].toString(2).padStart(8, '0') // Binary flags
      const preyCode = bytes[17].toString(16).toUpperCase().padStart(2, '0')
      const confidence = bytes[18] // Confidence score
      
      setDecodedData({
        timestamp: timestamp.toISOString(),
        latitude: Math.max(-90, Math.min(90, latitude)),
        longitude: Math.max(-180, Math.min(180, longitude)),
        battery,
        firmware,
        flags,
        preyCode,
        confidence,
        raw: cleanHex
      })
    } catch (err) {
      setError("Failed to decode packet. Please check the hex format.")
    }
  }

  const loadSamplePacket = () => {
    // Sample packet with realistic data
    const sampleHex = "66f2a1c0d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2"
    setHexInput(sampleHex)
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Packet Decoder</h2>
        <p className="text-sm text-muted-foreground">
          Decode 32-byte hexadecimal telemetry packets from shark tracking devices
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="hex-input">Hexadecimal Packet (32 bytes)</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="hex-input"
                placeholder="Enter 64 hex characters (e.g., 66f2a1c0d5e6f7a8...)"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className="font-mono text-sm"
                maxLength={64}
              />
              <Button onClick={loadSamplePacket} variant="outline" size="sm">
                Sample
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {hexInput.replace(/\s/g, "").length}/64 characters
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
              {error}
            </div>
          )}
          
          <Button onClick={decodePacket} className="w-full">
            Decode Packet
          </Button>
        </div>
      </Card>

      {/* Decoded Data */}
      {decodedData && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Decoded Telemetry Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">TIMESTAMP</Label>
                <div className="font-mono text-sm">
                  {new Date(decodedData.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">COORDINATES</Label>
                <div className="font-mono text-sm">
                  {decodedData.latitude.toFixed(6)}°N, {Math.abs(decodedData.longitude).toFixed(6)}°W
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">BATTERY LEVEL</Label>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-sm">{decodedData.battery}%</div>
                  <Badge variant={decodedData.battery > 50 ? "default" : decodedData.battery > 20 ? "secondary" : "destructive"}>
                    {decodedData.battery > 50 ? "Good" : decodedData.battery > 20 ? "Low" : "Critical"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">FIRMWARE VERSION</Label>
                <div className="font-mono text-sm">{decodedData.firmware}</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">STATUS FLAGS</Label>
                <div className="font-mono text-sm">{decodedData.flags}</div>
                <div className="text-xs text-muted-foreground">
                  {decodedData.flags[0] === '1' && "GPS Lock, "}
                  {decodedData.flags[1] === '1' && "Depth Sensor, "}
                  {decodedData.flags[2] === '1' && "Temperature, "}
                  {decodedData.flags[3] === '1' && "Accelerometer"}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">PREY CODE</Label>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-sm">0x{decodedData.preyCode}</div>
                  <Badge variant="outline">
                    {decodedData.preyCode === "FF" ? "Unknown" : 
                     decodedData.preyCode === "01" ? "Fish" :
                     decodedData.preyCode === "02" ? "Seal" :
                     decodedData.preyCode === "03" ? "Tuna" : "Other"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">CONFIDENCE SCORE</Label>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-sm">{decodedData.confidence}/255</div>
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-2 bg-green-500 rounded"
                      style={{ width: `${(decodedData.confidence / 255) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <Label className="text-xs text-muted-foreground">RAW HEX DATA</Label>
            <div className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
              {decodedData.raw.match(/.{8}/g)?.join(" ") || decodedData.raw}
            </div>
          </div>
        </Card>
      )}
      
      {/* Info */}
      <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-sm mb-2">Packet Structure</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Bytes 0-3: Unix timestamp</div>
          <div>• Bytes 4-7: Latitude (signed 32-bit)</div>
          <div>• Bytes 8-11: Longitude (signed 32-bit)</div>
          <div>• Byte 12: Battery level (0-100%)</div>
          <div>• Bytes 13-15: Firmware version (major.minor.patch)</div>
          <div>• Byte 16: Status flags (8 bits)</div>
          <div>• Byte 17: Prey detection code</div>
          <div>• Byte 18: Confidence score (0-255)</div>
          <div>• Bytes 19-31: Reserved/checksum</div>
        </div>
      </Card>
    </div>
  )
}