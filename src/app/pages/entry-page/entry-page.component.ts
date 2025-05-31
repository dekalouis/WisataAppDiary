// src/app/pages/entry-page/entry-page.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
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
  metadata: any = null;
  loading = true;

  constructor(private route: ActivatedRoute, private cmsService: CmsService) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    try {
      const entryData = await this.cmsService.getEntry(id);
      const entry = Array.isArray(entryData) ? entryData[0] : entryData;
      this.entry = entry;

      const { processedContent, metadata } = renderDiaryContent(entry);
      this.content = processedContent;
      this.metadata = metadata;
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}
