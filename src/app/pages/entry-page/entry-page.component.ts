// // src/app/pages/entry-page/entry-page.component.ts
// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, RouterModule } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { MarkdownModule } from 'ngx-markdown';
// import { CmsService } from '../services/cms.service';
// import { renderDiaryContent } from '../../../utils/cms.js';

// @Component({
//   selector: 'app-entry-page',
//   standalone: true,
//   imports: [CommonModule, RouterModule, MarkdownModule],
//   templateUrl: './entry-page.component.html',
//   styleUrls: ['./entry-page.component.css'],
// })
// export class EntryPageComponent implements OnInit {
//   entry: any;
//   content = '';
//   metadata: any = null;
//   loading = true;

//   constructor(private route: ActivatedRoute, private cmsService: CmsService) {}

//   async ngOnInit() {
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     if (!id) return;

//     try {
//       const entryData = await this.cmsService.getEntry(id);
//       const entry = Array.isArray(entryData) ? entryData[0] : entryData;
//       this.entry = entry;

//       const { processedContent, metadata } = renderDiaryContent(entry);
//       this.content = processedContent;
//       this.metadata = metadata;
//     } catch (err) {
//       console.error(err);
//     } finally {
//       this.loading = false;
//     }
//   }
// }
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownModule, MarkdownService } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CmsService } from '../services/cms.service';
import { renderDiaryContent } from '../../../utils/cms.js';

@Component({
  selector: 'app-entry-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MarkdownModule],
  templateUrl: './entry-page.component.html',
  styleUrls: ['./entry-page.component.css'],
})
export class EntryPageComponent implements OnInit {
  entry: any;
  content = '';
  processedHtml: SafeHtml = '';
  metadata: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private cmsService: CmsService,
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    try {
      const entryData = await this.cmsService.getEntry(id);
      const entry = Array.isArray(entryData) ? entryData[0] : entryData;
      this.entry = entry;

      const { processedContent, metadata } = renderDiaryContent(entry);

      // Process content and render to HTML
      const cleanedContent = this.preprocessContent(processedContent);
      const htmlContent = await this.markdownService.parse(cleanedContent);
      const finalHtml = this.postprocessHtml(htmlContent);

      this.processedHtml = this.sanitizer.bypassSecurityTrustHtml(finalHtml);
      this.metadata = metadata;
    } catch (err) {
      console.error('Error loading entry:', err);
    } finally {
      this.loading = false;
    }
  }

  private preprocessContent(content: string): string {
    if (!content) return '';

    // Convert custom embeds to placeholder divs that we'll replace later
    content = content.replace(
      /<TiktokEmbed\s+url="([^"]+)"\s*\/>/g,
      '```embed:tiktok:$1```'
    );

    content = content.replace(
      /<YoutubeEmbed\s+url="([^"]+)"\s*\/>/g,
      '```embed:youtube:$1```'
    );

    content = content.replace(
      /<TwitterEmbed\s+url="([^"]+)"\s*(?:theme="([^"]+)")?\s*\/>/g,
      '```embed:twitter:$1:$2```'
    );

    return content;
  }

  private postprocessHtml(html: string): string {
    if (!html) return '';

    // Replace TikTok embeds
    html = html.replace(/<code>embed:tiktok:([^<]+)<\/code>/g, (match, url) =>
      this.createTikTokEmbed(url)
    );

    // Replace YouTube embeds
    html = html.replace(/<code>embed:youtube:([^<]+)<\/code>/g, (match, url) =>
      this.createYouTubeEmbed(url)
    );

    // Replace Twitter embeds
    html = html.replace(
      /<code>embed:twitter:([^:]+):?([^<]*)<\/code>/g,
      (match, url, theme) => this.createTwitterEmbed(url, theme || 'light')
    );

    return html;
  }

  private createTikTokEmbed(url: string): string {
    const videoId = this.extractTikTokVideoId(url);
    if (!videoId) {
      return `
        <div class="embed-fallback bg-gray-100 p-4 rounded-lg my-4 text-center">
          <p class="text-gray-600 mb-2">TikTok Video</p>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">
            View on TikTok
          </a>
        </div>
      `;
    }

    return `
      <div class="tiktok-embed my-6 flex justify-center">
        <div class="bg-gray-50 rounded-lg overflow-hidden" style="max-width: 325px; width: 100%;">
          <div style="position: relative; padding-bottom: 177.78%; height: 0;">
            <iframe 
              src="https://www.tiktok.com/embed/v2/${videoId}"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>
    `;
  }

  private createYouTubeEmbed(url: string): string {
    const videoId = this.extractYouTubeVideoId(url);
    if (!videoId) {
      return `
        <div class="embed-fallback bg-gray-100 p-4 rounded-lg my-4 text-center">
          <p class="text-gray-600 mb-2">YouTube Video</p>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">
            View on YouTube
          </a>
        </div>
      `;
    }

    return `
      <div class="youtube-embed bg-gray-50 rounded-lg overflow-hidden my-6">
        <div style="position: relative; padding-bottom: 56.25%; height: 0;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}"
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy">
          </iframe>
        </div>
      </div>
    `;
  }

  private createTwitterEmbed(url: string, theme: string = 'light'): string {
    // For Twitter, we'll use a simple link since embedding requires external scripts
    return `
      <div class="twitter-embed bg-gray-50 border border-gray-200 rounded-lg p-4 my-6 max-w-md mx-auto">
        <div class="flex items-center mb-3">
          <svg class="w-5 h-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          <span class="text-gray-600 font-medium">X (Twitter) Post</span>
        </div>
        <a href="${url}" target="_blank" rel="noopener noreferrer" 
           class="text-blue-600 hover:text-blue-800 underline block">
          View on X/Twitter →
        </a>
      </div>
    `;
  }

  private extractTikTokVideoId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/.*\/video\/(\d+)/,
      /tiktok\.com\/@.*\/video\/(\d+)/,
      /vm\.tiktok\.com\/(\w+)/,
      /vt\.tiktok\.com\/(\w+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
