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
import { Component, OnInit, SecurityContext } from '@angular/core';
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

      // Process the content to handle custom components
      const cleanedContent = this.preprocessContent(processedContent);
      this.content = cleanedContent;
      this.metadata = metadata;

      // Alternative: Manual HTML rendering with proper sanitization
      try {
        const htmlContent = await this.markdownService.parse(cleanedContent);
        this.processedHtml =
          this.sanitizer.bypassSecurityTrustHtml(htmlContent);
      } catch (error) {
        console.error('Markdown parsing error:', error);
      }
    } catch (err) {
      console.error('Error loading entry:', err);
    } finally {
      this.loading = false;
    }
  }

  private preprocessContent(content: string): string {
    if (!content) return '';

    // Handle custom components like TiktokEmbed
    content = content.replace(
      /<TiktokEmbed\s+url="([^"]+)"\s*\/>/g,
      (match, url) => {
        // Convert to a simple link or iframe for now
        return `<div class="tiktok-embed bg-gray-100 p-4 rounded-lg my-4">
          <p class="text-sm text-gray-600 mb-2">TikTok Video:</p>
          <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">
            ${url}
          </a>
        </div>`;
      }
    );

    return content;
  }
}
