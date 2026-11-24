import manifest from '../data/responsiveImages.json';

const images: Record<string, { width: number; height: number; srcSet: string }> = manifest;

/** Unknown CMS/upload URLs retain their original rendering and URL. */
export function responsiveImage(src: string, sizes: string) {
  const path = src.replace(/^https:\/\/(?:www\.)?amaanity\.com(?=\/)/, '');
  const image = images[path];
  return { ...(image ? { ...image, sizes } : {}), decoding: 'async' as const };
}
