'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = '/assets/default-avatar.png',
  alt = 'Imagen',
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc)
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src)

  // Derive state from props synchronously to avoid useEffect setState warning
  if (src !== prevSrc) {
    setPrevSrc(src)
    setImgSrc(src || fallbackSrc)
  }

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...props}
    />
  )
}
