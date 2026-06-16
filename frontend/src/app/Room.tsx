import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Stage, Layer, Line, Circle, Rect } from 'react-konva'
import { useActionCable } from '../hooks/useActionCable'
import { FigureShape } from '../components/FigureShape'
import { Toolbar } from '../components/Toolbar'
import { fetchRoom } from '../services/drawingService'
import { figuresMatch } from '../utils/figures'
import type { Figure, FigureType, CurrentLine, PreviewShape, BrushData, CircleData, RectangleData } from '../types'

interface ServerFigureEvent {
  event: string
  figure_id: number
  figure_type: FigureType
  data: BrushData | CircleData | RectangleData
}

export default function Room() {
  const { roomName } = useParams<{ roomName: string }>()
  const navigate = useNavigate()

  const [confirmedFigures, setConfirmedFigures] = useState<Figure[]>([])
  const pendingRef = useRef<Figure[]>([])
  const [pendingRender, setPendingRender] = useState<Figure[]>([])

  const [currentLine, setCurrentLine] = useState<CurrentLine | null>(null)
  const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null)

  const [tool, setTool] = useState<FigureType>('brush')
  const [color, setColor] = useState('#111111')
  const [strokeWidth, setStrokeWidth] = useState(5)
  const [isConnected, setIsConnected] = useState(false)

  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const stageRef = useRef<{ getPointerPosition: () => { x: number; y: number } | null } | null>(null)
  const wasConnected = useRef(false)

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const loadFigures = useCallback(async () => {
    if (!roomName) return
    try {
      const figures = await fetchRoom(roomName)
      setConfirmedFigures(figures)
    } catch (err) {
      console.error('[drawpad] failed to load figures:', err)
    }
  }, [roomName])

  useEffect(() => {
    loadFigures()
  }, [loadFigures])

  useEffect(() => {
    const onResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const addPending = (figure: Figure) => {
    const next = [...pendingRef.current, figure]
    pendingRef.current = next
    setPendingRender([...next])
  }

  const confirmFigure = useCallback((serverData: ServerFigureEvent) => {
    const incoming: Figure = {
      id: serverData.figure_id,
      figure_type: serverData.figure_type,
      data: serverData.data,
    }

    const matchIdx = pendingRef.current.findIndex(p => figuresMatch(p, incoming))
    if (matchIdx !== -1) {
      const next = pendingRef.current.filter((_, i) => i !== matchIdx)
      pendingRef.current = next
      setPendingRender([...next])
    }

    setConfirmedFigures(prev => [...prev, incoming])
  }, [])

  const { perform } = useActionCable({
    url: '/cable',
    channelParams: { channel: 'DrawingChannel', room_id: roomName ?? '' },
    onConnected: () => {
      if (wasConnected.current) {
        loadFigures()
        pendingRef.current = []
        setPendingRender([])
      }
      wasConnected.current = true
      setIsConnected(true)
    },
    onDisconnected: () => setIsConnected(false),
    onReceived: (data) => {
      const event = data as unknown as ServerFigureEvent
      if (event.event === 'new_figure') confirmFigure(event)
    },
  })

  const getPos = () => stageRef.current?.getPointerPosition() ?? { x: 0, y: 0 }

  const handlePointerDown = () => {
    isDrawing.current = true
    const pos = getPos()
    startPos.current = pos

    if (tool === 'brush') {
      setCurrentLine({ points: [pos.x, pos.y], color, strokeWidth })
    }
  }

  const handlePointerMove = () => {
    if (!isDrawing.current) return
    const pos = getPos()

    if (tool === 'brush') {
      setCurrentLine(prev =>
        prev ? { ...prev, points: [...prev.points, pos.x, pos.y] } : prev
      )
    } else if (tool === 'circle') {
      const dx = pos.x - startPos.current.x
      const dy = pos.y - startPos.current.y
      setPreviewShape({
        type: 'circle',
        x: startPos.current.x,
        y: startPos.current.y,
        radius: Math.sqrt(dx * dx + dy * dy),
        color,
      })
    } else if (tool === 'rectangle') {
      setPreviewShape({
        type: 'rectangle',
        x: Math.min(pos.x, startPos.current.x),
        y: Math.min(pos.y, startPos.current.y),
        width: Math.abs(pos.x - startPos.current.x),
        height: Math.abs(pos.y - startPos.current.y),
        color,
      })
    }
  }

  const handlePointerUp = () => {
    if (!isDrawing.current) return
    isDrawing.current = false

    if (tool === 'brush' && currentLine?.points && currentLine.points.length > 4) {
      const figure: Figure = {
        figure_type: 'brush',
        data: { color: currentLine.color, strokeWidth: currentLine.strokeWidth, points: currentLine.points },
      }
      addPending(figure)
      perform('draw', { room_id: roomName, figure_type: 'brush', data: figure.data })
    } else if (tool === 'circle' && (previewShape?.radius ?? 0) > 4) {
      const figure: Figure = {
        figure_type: 'circle',
        data: { color: previewShape!.color, x: previewShape!.x, y: previewShape!.y, radius: previewShape!.radius! },
      }
      addPending(figure)
      perform('draw', { room_id: roomName, figure_type: 'circle', data: figure.data })
    } else if (tool === 'rectangle' && (previewShape?.width ?? 0) > 4 && (previewShape?.height ?? 0) > 4) {
      const figure: Figure = {
        figure_type: 'rectangle',
        data: {
          color: previewShape!.color,
          x: previewShape!.x,
          y: previewShape!.y,
          width: previewShape!.width!,
          height: previewShape!.height!,
        },
      }
      addPending(figure)
      perform('draw', { room_id: roomName, figure_type: 'rectangle', data: figure.data })
    }

    setCurrentLine(null)
    setPreviewShape(null)
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Stage
        ref={stageRef as React.RefObject<never>}
        width={stageSize.width}
        height={stageSize.height}
        style={{ background: '#ffffff', cursor: 'crosshair', display: 'block' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <Layer>
          {confirmedFigures.map((f, i) => (
            <FigureShape key={`c-${f.id ?? i}`} figure={f} />
          ))}
          {pendingRender.map((f, i) => (
            <FigureShape key={`p-${i}`} figure={f} />
          ))}
          {currentLine && (
            <Line
              points={currentLine.points}
              stroke={currentLine.color}
              strokeWidth={currentLine.strokeWidth}
              tension={0.4}
              lineCap="round"
              lineJoin="round"
            />
          )}
          {previewShape?.type === 'circle' && (
            <Circle
              x={previewShape.x}
              y={previewShape.y}
              radius={previewShape.radius}
              stroke={previewShape.color}
              strokeWidth={2}
              fill="transparent"
              dash={[6, 4]}
            />
          )}
          {previewShape?.type === 'rectangle' && (
            <Rect
              x={previewShape.x}
              y={previewShape.y}
              width={previewShape.width}
              height={previewShape.height}
              stroke={previewShape.color}
              strokeWidth={2}
              fill="transparent"
              dash={[6, 4]}
            />
          )}
        </Layer>
      </Stage>

      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
      />

      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 py-3.5 pointer-events-none z-[100]">
        <button
          onClick={() => navigate('/')}
          title="Voltar ao início"
          className="text-[13px] font-semibold tracking-[0.08em] text-[#d0d0d0] hover:text-[#888] pointer-events-auto transition-colors duration-150"
        >
          drawpad
        </button>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className="w-[7px] h-[7px] rounded-full flex-shrink-0 transition-all duration-300"
            style={{
              background: isConnected ? '#22c55e' : '#d1d5db',
              boxShadow: isConnected ? '0 0 6px rgba(34,197,94,0.6)' : 'none',
            }}
          />
          <span className="text-xs font-normal text-[#b0b0b0] tracking-[0.03em]">
            {roomName}
          </span>
        </div>
      </div>
    </div>
  )
}
