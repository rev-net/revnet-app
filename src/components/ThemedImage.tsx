// components/ThemedImage.tsx (or any suitable path)
'use client';

import Image, { type ImageProps } from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ThemedImageProps extends Omit<ImageProps, 'src'> {
  lightSrc: string;
  darkSrc: string;
}

const ThemedImage = (props: ThemedImageProps) => {
  const { lightSrc, darkSrc, alt, ...rest } = props;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on the client before resolving theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration errors and layout shifts,
  // you can render a placeholder or the light image until mounted and theme is resolved.
  // Or, if image dimensions are fixed, a simple div with those dimensions.
  if (!mounted) {
    // Option 1: Render nothing until mounted (might cause layout shift if size isn't reserved)
    // return null;

    // Option 2: Render a placeholder span with dimensions to reserve space
    // return <span style={{ display: 'inline-block', width: props.width, height: props.height }} />;
    
    // Option 3: Render the light image by default (server will render this too)
    // next-themes script will apply 'dark' class quickly, then this component will re-render
    // with the dark image if needed. This might cause a very brief flash of the light image.
    return <Image src={lightSrc} alt={alt} {...rest} />;
  }

  const src = resolvedTheme === 'dark' ? darkSrc : lightSrc;

  return <Image src={src} alt={alt} {...rest} />;
};

export default ThemedImage;