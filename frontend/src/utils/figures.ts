import type { Figure, BrushData, CircleData, RectangleData } from '../types'

export function figuresMatch(local: Figure, server: Figure): boolean {
  if (local.figure_type !== server.figure_type) return false
  const a = local.data
  const b = server.data
  if (!a || !b) return false

  if (local.figure_type === 'brush') {
    const da = a as BrushData
    const db = b as BrushData
    return (
      da.color === db.color &&
      da.strokeWidth === db.strokeWidth &&
      JSON.stringify(da.points) === JSON.stringify(db.points)
    )
  }
  if (local.figure_type === 'circle') {
    const da = a as CircleData
    const db = b as CircleData
    return (
      da.color === db.color &&
      Math.abs((da.x ?? 0) - (db.x ?? 0)) < 0.5 &&
      Math.abs((da.y ?? 0) - (db.y ?? 0)) < 0.5 &&
      Math.abs((da.radius ?? 0) - (db.radius ?? 0)) < 0.5
    )
  }
  if (local.figure_type === 'rectangle') {
    const da = a as RectangleData
    const db = b as RectangleData
    return (
      da.color === db.color &&
      Math.abs((da.x ?? 0) - (db.x ?? 0)) < 0.5 &&
      Math.abs((da.y ?? 0) - (db.y ?? 0)) < 0.5 &&
      Math.abs((da.width ?? 0) - (db.width ?? 0)) < 0.5 &&
      Math.abs((da.height ?? 0) - (db.height ?? 0)) < 0.5
    )
  }
  return false
}
