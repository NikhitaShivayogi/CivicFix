import axios from 'axios';

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const base = axios.defaults.baseURL || '';
  const origin = base.replace(/\/api\/?$/, '');
  return `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}
