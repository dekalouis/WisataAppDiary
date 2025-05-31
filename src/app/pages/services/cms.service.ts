import { Injectable } from '@angular/core';
import { getDiaryFeed, getDiaryContentById } from '../../api/cms';

@Injectable({ providedIn: 'root' })
export class CmsService {
  getFeed() {
    return getDiaryFeed();
  }

  getEntry(id: number) {
    return getDiaryContentById(id);
  }
}
