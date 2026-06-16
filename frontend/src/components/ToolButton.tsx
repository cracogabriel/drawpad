import type { ToolDef } from '../types'

interface Props {
  tool: ToolDef
  active: boolean
  onClick: () => void
}

export function ToolButton({ tool, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={tool.label}
      className={[
        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-100',
        active
          ? 'bg-indigo-500 text-white'
          : 'text-white/55 hover:bg-white/[0.12] hover:text-white',
      ].join(' ')}
    >
      <tool.Icon />
    </button>
  )
}
