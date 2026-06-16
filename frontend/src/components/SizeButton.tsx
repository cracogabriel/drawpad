import type { StrokeSize } from '../types'

interface Props {
  size: StrokeSize
  active: boolean
  onClick: () => void
}

export function SizeButton({ size, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={`${size.value}px`}
      className={[
        'w-10 h-[30px] rounded-lg flex items-center justify-center',
        'transition-colors duration-100 hover:bg-white/[0.08]',
        active ? 'opacity-100' : 'opacity-40',
      ].join(' ')}
    >
      <div
        className="rounded-full bg-white flex-shrink-0"
        style={{ width: size.dot, height: size.dot }}
      />
    </button>
  )
}
