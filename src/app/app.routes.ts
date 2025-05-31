import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { FeedPageComponent } from './pages/feed-page/feed-page.component';
import { EntryPageComponent } from './pages/entry-page/entry-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: FeedPageComponent },
      { path: 'diary/:id', component: EntryPageComponent },
    ],
  },
];
