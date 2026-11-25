import type { CSSProperties } from 'react'

export type AssetIconProps = {
  src: string
  size?: number
  glyphWidth?: number
  alt?: string
  className?: string
  style?: CSSProperties
}

export function AssetIcon({
  src,
  size = 16,
  glyphWidth,
  alt = '',
  className = '',
  style,
}: AssetIconProps) {
  return (
    <span
      className={`asset-icon inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <img
        src={src}
        alt={alt}
        width={glyphWidth ?? size}
        height={glyphWidth != null ? undefined : size}
        style={glyphWidth != null ? { width: glyphWidth, height: 'auto' } : undefined}
      />
    </span>
  )
}
