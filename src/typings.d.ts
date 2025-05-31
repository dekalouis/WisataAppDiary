declare module '../../../api/cms' {
  export function getDiaryFeed(): Promise<any>;
  export function getDiaryContentById(id: number): Promise<any>;
}
