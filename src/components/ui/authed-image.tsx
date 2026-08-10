export interface AuthedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackSrc?: string;
}

/**
 * <img> com fallback para placeholder quando a imagem falha.
 *
 * O endpoint /api/animals/images/{id} e publico e cacheavel, entao a tag carrega
 * a URL direto: o CDN e o cache do browser servem a imagem sem passar pelo backend.
 * Antes o binario era baixado via fetch + Bearer e servido como blob URL, o que
 * impedia qualquer cache (de borda ou de browser) entre carregamentos de pagina.
 */
const AuthedImage = ({ src, fallbackSrc = '/placeholder.svg', onError, ...rest }: AuthedImageProps) => (
  <img
    {...rest}
    src={src || fallbackSrc}
    loading={rest.loading ?? 'lazy'}
    decoding={rest.decoding ?? 'async'}
    onError={(event) => {
      if (event.currentTarget.src !== window.location.origin + fallbackSrc
        && !event.currentTarget.src.endsWith(fallbackSrc)) {
        event.currentTarget.src = fallbackSrc;
      }
      onError?.(event);
    }}
  />
);

export default AuthedImage;
