import { useEffect, useState } from 'react';
import { isAuthApiImage, loadAuthedImage } from '@/lib/imageAuth';

export interface AuthedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

/**
 * Drop-in para <img> que carrega imagens do endpoint autenticado
 * (/api/animals/images/...) usando o Bearer token e servindo via blob URL.
 * Para qualquer outra URL (placeholder, blob:, data:, externas) renderiza
 * a imagem normalmente.
 */
const AuthedImage = ({ src, fallbackSrc = '/placeholder.svg', onError, ...rest }: AuthedImageProps) => {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(
    isAuthApiImage(src) ? undefined : src,
  );

  useEffect(() => {
    let active = true;

    if (!isAuthApiImage(src)) {
      setResolvedSrc(src);
      return;
    }

    setResolvedSrc(undefined);
    loadAuthedImage(src as string)
      .then((objectUrl) => {
        if (active) {
          setResolvedSrc(objectUrl);
        }
      })
      .catch(() => {
        if (active) {
          setResolvedSrc(fallbackSrc);
        }
      });

    return () => {
      active = false;
    };
  }, [src, fallbackSrc]);

  return (
    <img
      {...rest}
      src={resolvedSrc ?? fallbackSrc}
      onError={(event) => {
        if (event.currentTarget.src !== window.location.origin + fallbackSrc
          && !event.currentTarget.src.endsWith(fallbackSrc)) {
          event.currentTarget.src = fallbackSrc;
        }
        onError?.(event);
      }}
    />
  );
};

export default AuthedImage;
