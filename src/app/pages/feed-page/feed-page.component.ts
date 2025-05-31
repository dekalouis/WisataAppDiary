import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService } from '../services/cms.service';
import {
  getDiaryContentSEOAttributes,
  getSizeOptimizedImageUrl,
  CDN_WISATA_IMG_SIZE,
} from '../../../utils/cms.js';

@Component({
  standalone: true,
  selector: 'app-feed-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './feed-page.component.html',
  styleUrls: ['./feed-page.component.css'],
})
export class FeedPageComponent {
  diaryEntries: any[] = [];
  loading = true;

  constructor(private cmsService: CmsService) {}

  async ngOnInit() {
    try {
      const entries = await this.cmsService.getFeed();
      this.diaryEntries = entries;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  getExcerpt(content: string, maxLength = 150): string {
    if (!content) return '';
    const cleanText = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .trim();
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText;
  }

  getFirstImage(content: string): string | null {
    if (!content) return null;
    const imageMatch =
      content.match(/!\[.*?\]\((.+?)\)/) ||
      content.match(/src=["']([^"']+)["']/);
    return imageMatch
      ? getSizeOptimizedImageUrl(imageMatch[1], CDN_WISATA_IMG_SIZE.SM)
      : null;
  }

  getSEO(entry: any) {
    return getDiaryContentSEOAttributes(entry);
  }

  getReadingTime(content: string): number {
    return Math.ceil((content?.split(' ') || []).length / 200);
  }
}
