export type LayoutType = 'A' | 'B' | 'C' | 'D';

export interface SlideContent {
  id: number;
  layout: LayoutType;
  chapter?: string;
  title: string;
  subTitle?: string;
  body?: string;
  enBody?: string;
  prompts: string[];
  images: string[]; // Placeholders
}
