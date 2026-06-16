interface Props {
  color: string
  active: boolean
  onClick: () => void
}

export function ColorSwatch({ color, active, onClick }: Props) {
  const isWhite = color === '#ffffff'
  return (
    <button
      onClick={onClick}
      title={color}
      className={[
        'w-[22px] h-[22px] rounded-full transition-transform duration-100',
        'hover:scale-[1.18]',
        active ? 'scale-[1.06]' : 'scale-100',
        isWhite ? 'border border-white/20' : '',
      ].join(' ')}
      style={{
        background: color,
        outline: active ? `2.5px solid ${isWhite ? '#aaa' : color}` : 'none',
        outlineOffset: 2.5,
      }}
    />
  )
}
