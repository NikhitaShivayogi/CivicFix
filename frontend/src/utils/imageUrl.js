import axios from 'axios';

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const normalizedPath = imageUrl.replace(/\\/g, '/');
  const uploadsIndex = normalizedPath.lastIndexOf('/uploads/');
  const webPath = uploadsIndex >= 0 ? normalizedPath.slice(uploadsIndex) : normalizedPath;
  const base = axios.defaults.baseURL || '';
  const origin = base.replace(/\/api\/?$/, '');
  return `${origin}${webPath.startsWith('/') ? '' : '/'}${webPath}`;
}

export function getReportImageUrls(report) {
  const imageUrls = [
    ...(Array.isArray(report?.images) ? report.images : []),
    report?.imageUrl,
  ];

  return [...new Set(imageUrls.filter(Boolean).map(resolveImageUrl))];
}
