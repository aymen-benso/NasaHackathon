"use client"

import React, { useCallback, useRef, useState, useEffect } from 'react'
// @ts-ignore - react-map-gl types issue with React 19
import Map, { MapRef, Layer, Source } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import chroma from 'chroma-js'
import { useTheme } from 'next-themes'

interface OceanographicMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  activeTab: string
  hotspotsVisible: boolean
  selectedDate?: string
}

// Mock oceanographic data - in real app this would come from NASA/CMEMS APIs
const generateMockOceanData = (dataType: 'tchi' | 'shsr' | 'sst') => {
  const features = []
  
  // Generate a grid of data points across the North Atlantic
  for (let lat = 30; lat <= 70; lat += 2) {
    for (let lng = -80; lng <= 20; lng += 2) {
      let value: number
      
      // Simulate different data patterns
      switch (dataType) {
        case 'tchi':
          // Higher values near Gulf Stream and warmer waters
          value = Math.random() * 0.8 + 0.2 + (lat < 45 ? 0.3 : 0)
          break
        case 'shsr':
          // Risk higher in coastal areas and known shark habitats
          value = Math.random() * 0.6 + (lng > -40 && lat > 40 ? 0.4 : 0.1)
          break
        case 'sst':
          // Temperature gradient from south to north
          value = 25 - (lat - 30) * 0.5 + Math.random() * 5
          break
        default:
          value = Math.random()
      }
      
      features.push({
        type: 'Feature',
        properties: { value: Math.max(0, Math.min(1, value)) },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      })
    }
  }
  
  return {
    type: 'FeatureCollection',
    features
  }
}

// Color scales for different data types
const colorScales = {
  tchi: chroma.scale(['#000080', '#0066cc', '#00ccff', '#66ff99', '#ffff00', '#ff6600', '#ff0000']),
  shsr: chroma.scale(['#001f3f', '#7FDBFF', '#FFDC00', '#FF851B', '#FF4136']),
  sst: chroma.scale(['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'])
}

export default function OceanographicMap({ 
  onLocationSelect, 
  activeTab, 
  hotspotsVisible,
  selectedDate 
}: OceanographicMapProps) {
  const mapRef = useRef<MapRef>(null)
  const { theme } = useTheme()
  const [viewState, setViewState] = useState({
    longitude: -30,
    latitude: 50,
    zoom: 3,
    pitch: 0,
    bearing: 0
  })
  
  const [hoveredFeature, setHoveredFeature] = useState<any>(null)
  const [oceanData, setOceanData] = useState<any>(null)

  // Load ocean data based on active tab
  useEffect(() => {
    const dataType = activeTab === 'risk' ? 'shsr' : 
                    activeTab === 'probability' ? 'tchi' : 'sst'
    setOceanData(generateMockOceanData(dataType as any))
  }, [activeTab, selectedDate])

  // Get map style based on theme
  const getMapStyle = () => {
    if (theme === 'light') {
      return 'mapbox://styles/mapbox/light-v11'
    }
    return 'mapbox://styles/mapbox/dark-v11'
  }

  const onClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat
    onLocationSelect(lat, lng)
  }, [onLocationSelect])

  const onHover = useCallback((event: any) => {
    const feature = event.features?.[0]
    setHoveredFeature(feature || null)
  }, [])

  // Create heatmap layer
  const heatmapLayer: any = {
    id: 'oceanographic-heatmap',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'value'], 0, 0, 1, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
      'heatmap-opacity': 0.7
    }
  }

  // Create circle layer for data points
  const circleLayer: any = {
    id: 'oceanographic-circles',
    type: 'circle',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 8, 8],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        0, '#313695',
        0.2, '#4575b4',
        0.4, '#74add1',
        0.6, '#fee090',
        0.8, '#f46d43',
        1, '#a50026'
      ],
      'circle-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.8],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1
    }
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        onClick={onClick}
        onMouseMove={onHover}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        mapStyle={getMapStyle()}
        interactiveLayerIds={['oceanographic-circles']}
        cursor="crosshair"
      >
        {oceanData && (
          <Source id="oceanographic-data" type="geojson" data={oceanData}>
            <Layer {...heatmapLayer} />
            <Layer {...circleLayer} />
          </Source>
        )}
        
        {/* Hotspots layer - placeholder for now */}
        {hotspotsVisible && (
          <Source
            id="hotspots"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'High Risk Zone 1' },
                  geometry: { type: 'Point', coordinates: [-40, 45] }
                },
                {
                  type: 'Feature', 
                  properties: { name: 'High Risk Zone 2' },
                  geometry: { type: 'Point', coordinates: [-60, 35] }
                }
              ]
            }}
          >
            <Layer
              id="hotspots-layer"
              type="circle"
              paint={{
                'circle-radius': 15,
                'circle-color': '#ff0000',
                'circle-opacity': 0.6,
                'circle-stroke-color': '#ffffff',
                'circle-stroke-width': 2
              }}
            />
          </Source>
        )}
      </Map>

      {/* Data value tooltip */}
      {hoveredFeature && (
        <div 
          className="absolute z-10 bg-background/90 border border-border text-foreground p-2 rounded pointer-events-none text-sm backdrop-blur-sm"
          style={{ 
            left: hoveredFeature.x || 0, 
            top: hoveredFeature.y || 0,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold">
            {activeTab === 'risk' ? 'SHSR Risk' : 
             activeTab === 'probability' ? 'TCHI Score' : 'Sea Surface Temp'}
          </div>
          <div>
            Value: {(hoveredFeature.properties?.value * 100).toFixed(1)}
            {activeTab === 'risk' ? '%' : activeTab === 'probability' ? '' : '°C'}
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 border border-border text-foreground p-3 rounded text-sm backdrop-blur-sm">
        <div className="font-semibold mb-2">
          {activeTab === 'risk' ? 'SHSR Risk Level' : 
           activeTab === 'probability' ? 'TCHI Probability' : 'Sea Surface Temperature'}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs">Low</span>
          <div className="w-20 h-3 bg-gradient-to-r from-blue-800 via-yellow-400 to-red-600"></div>
          <span className="text-xs">High</span>
        </div>
      </div>

      {/* Coordinates display */}
      <div className="absolute top-4 right-4 bg-background/90 border border-border text-foreground p-2 rounded text-xs font-mono backdrop-blur-sm">
        {viewState.latitude.toFixed(3)}°N, {Math.abs(viewState.longitude).toFixed(3)}°W
      </div>
    </div>
  )
}