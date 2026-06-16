import { Line, Circle, Rect } from 'react-konva'
import type { Figure, BrushData, CircleData, RectangleData } from '../types'

interface Props {
  figure: Figure
}

export function FigureShape({ figure }: Props) {
  const { figure_type, data } = figure
  if (!data) return null

  if (figure_type === 'brush') {
    const d = data as BrushData
    if (!d.points || d.points.length <= 2) return null
    return (
      <Line
        points={d.points}
        stroke={d.color}
        strokeWidth={d.strokeWidth ?? 2}
        tension={0.4}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation="source-over"
      />
    )
  }

  if (figure_type === 'circle') {
    const d = data as CircleData
    if ((d.radius ?? 0) <= 0) return null
    return (
      <Circle
        x={d.x}
        y={d.y}
        radius={d.radius}
        stroke={d.color}
        strokeWidth={2}
        fill="transparent"
      />
    )
  }

  if (figure_type === 'rectangle') {
    const d = data as RectangleData
    if ((d.width ?? 0) <= 0 || (d.height ?? 0) <= 0) return null
    return (
      <Rect
        x={d.x}
        y={d.y}
        width={d.width}
        height={d.height}
        stroke={d.color}
        strokeWidth={2}
        fill="transparent"
      />
    )
  }

  return null
}
