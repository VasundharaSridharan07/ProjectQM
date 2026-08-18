export type AssetIconProps = {
  src: string
  size?: number
  alt?: string
  className?: string
}

export function AssetIcon({ src, size = 16, alt = '', className = '' }: AssetIconProps) {
  return (
    <span
      className={`asset-icon inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img src={src} alt={alt} width={size} height={size} />
    </span>
  )
}
