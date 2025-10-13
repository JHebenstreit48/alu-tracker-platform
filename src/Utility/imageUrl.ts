export const withImageUrl = (rel?: string): string => {
  if (!rel) return '';
  const base = process.env.IMG_CDN_BASE ?? '';
  return `${base}${rel.startsWith('/') ? '' : '/'}${rel}`;
};

const sanitize = (s: string) =>
  s.replace(/[\s']/g, '')
   .replace(/&/g, 'and')
   .replace(/[^A-Za-z0-9_-]/g, '');

export const buildCarImagePath = (brand: string, file: string): string => {
  const letter = brand?.[0]?.toUpperCase() ?? '_';
  const folder = sanitize(brand);
  return `/images/cars/${letter}/${folder}/${file}`;
};