import { Injectable } from '@angular/core';
import {
  getDiaryFeed as _getDiaryFeed,
  getDiaryContentById as _getDiaryContentById,
} from '../../api/cms'; // adjust path if needed

export const CDN_WISATA_URL = 'https://cdn.wisata.app';
export const CDN_TWITTER_URL = 'https://pbs.twimg.com';

export const CDN_WISATA_IMG_SIZE = {
  TH: 'th',
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
};

const CDN_TWITTER_IMG_SIZE = {
  THUMB: 'thumb',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  ORIG: 'orig',
};

export function getSizeOptimizedImageUrl(
  originalUrl: string,
  desiredSize: string
): string {
  if (!originalUrl || !desiredSize) return originalUrl;

  try {
    if (originalUrl.includes(CDN_WISATA_URL)) {
      const sizeKey = Object.values(CDN_WISATA_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_WISATA_IMG_SIZE.MD;

      const lastDotIndex = originalUrl.lastIndexOf('.');
      if (lastDotIndex === -1) return originalUrl;

      const baseUrl = originalUrl.substring(0, lastDotIndex);
      const extension = originalUrl.substring(lastDotIndex);
      return `${baseUrl}_${sizeKey}${extension}`;
    }

    if (originalUrl.includes(CDN_TWITTER_URL)) {
      const sizeKey = Object.values(CDN_TWITTER_IMG_SIZE).includes(desiredSize)
        ? desiredSize
        : CDN_TWITTER_IMG_SIZE.MEDIUM;

      const url = new URL(originalUrl);
      url.searchParams.set('name', sizeKey);
      return url.toString();
    }

    return originalUrl;
  } catch (error) {
    console.error('Error optimizing image URL:', error);
    return originalUrl;
  }
}

export function getDiaryContentSEOAttributes(contentData: any) {
  if (!contentData) {
    return { title: '', description: '', image: '' };
  }

  let title = contentData.meta?.title || 'Title';
  let description = contentData.meta?.description || contentData.excerpt || '';
  let image = contentData.meta?.featured_image || contentData.image || '';

  if (!title && contentData.content) {
    const titleMatch = contentData.content.match(/^#\s+(.+)$/m);
    if (titleMatch) title = titleMatch[1].trim();
  }

  if (!description && contentData.content) {
    const cleanContent = contentData.content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .trim();

    const firstParagraph = cleanContent.split('\n\n')[0];
    description = firstParagraph
      ? firstParagraph.substring(0, 160) + '...'
      : '';
  }

  if (!image && contentData.content) {
    const imageMatch =
      contentData.content.match(/!\[.*?\]\((.+?)\)/) ||
      contentData.content.match(/src=["']([^"']+)["']/);
    if (imageMatch) image = imageMatch[1];
  }

  return {
    title: title.trim(),
    description: description.trim(),
    image: image.trim(),
  };
}

export function renderDiaryContent(contentData: any) {
  if (!contentData || !contentData.content) {
    return {
      processedContent: '',
      metadata: {},
      rawContent: '',
    };
  }

  const processedContent = contentData.content;
  const metadata = {
    seo: getDiaryContentSEOAttributes(contentData),
    wordCount: processedContent.split(/\s+/).length,
    readingTime: Math.ceil(processedContent.split(/\s+/).length / 200),
    publishedAt: contentData.published_at,
    updatedAt: contentData.updated_at,
    tags: contentData.tags || [],
    author: contentData.author || {},
  };

  return {
    processedContent,
    metadata,
    rawContent: contentData.content,
  };
}

// ✅ CMS Service Wrapper
@Injectable({ providedIn: 'root' })
export class CmsService {
  getFeed() {
    return _getDiaryFeed();
  }

  getEntry(id: number) {
    return _getDiaryContentById(id);
  }
}
