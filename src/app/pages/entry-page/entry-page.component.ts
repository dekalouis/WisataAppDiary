// Complete entry-page.component.ts
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

      // Load embed scripts after content is rendered
      setTimeout(() => this.loadEmbedScripts(), 500);
    } catch (err) {
      console.error('Error loading entry:', err);
    } finally {
      this.loading = false;
    }
  }

  private preprocessContent(content: string): string {
    if (!content) return '';

    // Convert custom embeds to placeholder divs that we'll replace later
    // Handle TikTok embeds (with potential extra quotes)
    content = content.replace(
      /<TiktokEmbed\s+url="([^"]+)"\s*\/>\s*"?/g,
      '\n\n```embed:tiktok:$1```\n\n'
    );

    // Handle YouTube embeds (with potential title and extra quotes)
    content = content.replace(
      /<YoutubeEmbed\s+url="([^"]+)"\s*(?:title="([^"]*)")?\s*\/>\s*"?/g,
      '\n\n```embed:youtube:$1```\n\n'
    );

    // Handle Instagram embeds (with potential extra quotes)
    content = content.replace(
      /<InstagramEmbed\s+url="([^"]+)"\s*\/>\s*"?/g,
      '\n\n```embed:instagram:$1```\n\n'
    );

    // Handle Twitter embeds (with potential theme and extra quotes)
    content = content.replace(
      /<TwitterEmbed\s+url="([^"]+)"\s*(?:theme="([^"]*)")?\s*\/>\s*"?/g,
      '\n\n```embed:twitter:$1```\n\n'
    );

    console.log('Preprocessed content:', content);
    return content;
  }

  private postprocessHtml(html: string): string {
    if (!html) return '';

    console.log('HTML before postprocessing:', html);

    // Replace TikTok embeds
    html = html.replace(/<code>embed:tiktok:([^<]+)<\/code>/g, (match, url) => {
      console.log('Processing TikTok embed:', url);
      return this.createTikTokEmbed(url);
    });

    // Replace YouTube embeds
    html = html.replace(
      /<code>embed:youtube:([^<]+)<\/code>/g,
      (match, url) => {
        console.log('Processing YouTube embed:', url);
        return this.createYouTubeEmbed(url);
      }
    );

    // Replace Instagram embeds
    html = html.replace(
      /<code>embed:instagram:([^<]+)<\/code>/g,
      (match, url) => {
        console.log('Processing Instagram embed:', url);
        return this.createInstagramEmbed(url);
      }
    );

    // Replace Twitter embeds - simplified to just capture URL
    html = html.replace(
      /<code>embed:twitter:([^<]+)<\/code>/g,
      (match, url) => {
        // Clean up any trailing colons or extra characters
        const cleanUrl = url.replace(/:+$/, '');
        console.log('Processing Twitter embed:', cleanUrl);
        return this.createTwitterEmbed(cleanUrl, 'light');
      }
    );

    console.log('HTML after postprocessing:', html);
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
      <div class="my-6 flex justify-center">
        <div class="w-full max-w-md aspect-[9/16]">
          <iframe 
            src="https://www.tiktok.com/embed/v2/${videoId}"
            class="w-full h-full rounded-lg"
            scrolling="no"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    `;
  }

  private createYouTubeEmbed(url: string): string {
    // YouTube embed expects the full embed URL, not just video ID
    return `
      <div class="my-6">
        <iframe
          src="${url}"
          title="YouTube Video"
          class="w-full h-64 md:h-96 rounded-lg"
          frameborder="0"
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  private createInstagramEmbed(url: string): string {
    return `
<div class="my-6 flex justify-center instagram-embed-container" data-instagram-url="${url}">
  <blockquote
    class="instagram-media"
    data-instgrm-permalink="${url}"
    data-instgrm-version="14"
    style="background: #FFF; border: 0; margin: 0;">
  </blockquote>
</div>
    `;
  }

  private createTwitterEmbed(url: string, theme: string = 'light'): string {
    return `
<div class="my-6 twitter-embed-container" data-twitter-url="${url}">
  <blockquote class="twitter-tweet">
    <a href="${url}"></a>
  </blockquote>
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

  private loadEmbedScripts() {
    console.log('Loading embed scripts...');

    // Load Instagram script
    const instagramEmbeds = document.querySelectorAll(
      '.instagram-embed-container'
    );
    if (instagramEmbeds.length > 0) {
      console.log(`Found ${instagramEmbeds.length} Instagram embeds`);

      if (!(window as any).instgrm) {
        console.log('Loading Instagram script...');
        const igScript = document.createElement('script');
        igScript.src = 'https://www.instagram.com/embed.js';
        igScript.async = true;
        igScript.onload = () => {
          console.log('Instagram script loaded successfully');
          if ((window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        };
        igScript.onerror = () =>
          console.error('Failed to load Instagram script');
        document.head.appendChild(igScript);
      } else {
        console.log('Instagram script already loaded, processing embeds');
        (window as any).instgrm.Embeds.process();
      }
    }

    // Load Twitter script
    const twitterEmbeds = document.querySelectorAll('.twitter-embed-container');
    if (twitterEmbeds.length > 0) {
      console.log(`Found ${twitterEmbeds.length} Twitter embeds`);

      if (!(window as any).twttr) {
        console.log('Loading Twitter script...');
        const twitterScript = document.createElement('script');
        twitterScript.src = 'https://platform.twitter.com/widgets.js';
        twitterScript.async = true;
        twitterScript.charset = 'utf-8';
        twitterScript.onload = () => {
          console.log('Twitter script loaded successfully');
        };
        twitterScript.onerror = () =>
          console.error('Failed to load Twitter script');
        document.head.appendChild(twitterScript);
      } else {
        console.log('Twitter script already loaded, loading widgets');
        (window as any).twttr.widgets.load();
      }
    }
  }
}
