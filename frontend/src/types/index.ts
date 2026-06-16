export type FigureType = 'brush' | 'circle' | 'rectangle'

export interface BrushData {
  points: number[]
  color: string
  strokeWidth: number
}

export interface CircleData {
  x: number
  y: number
  radius: number
  color: string
}

export interface RectangleData {
  x: number
  y: number
  width: number
  height: number
  color: string
}

export type FigureData = BrushData | CircleData | RectangleData

export interface Figure {
  id?: number
  figure_type: FigureType
  data: FigureData
}

export interface PreviewShape {
  type: 'circle' | 'rectangle'
  x: number
  y: number
  radius?: number
  width?: number
  height?: number
  color: string
}

export interface CurrentLine {
  points: number[]
  color: string
  strokeWidth: number
}

export interface ToolDef {
  id: FigureType
  label: string
  Icon: React.FC
}

export interface StrokeSize {
  value: number
  dot: number
}

export interface ActionCableOptions {
  url: string
  channelParams: Record<string, string>
  onReceived?: (data: Record<string, unknown>) => void
  onConnected?: () => void
  onDisconnected?: () => void
}
