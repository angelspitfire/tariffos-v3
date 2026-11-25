/** One part of a multi-modal product description (chat input channel). */
export interface DescriptionPart {
  type: 'text' | 'image';
  text?: string;
  image?: string;
  url?: string;
  data?: string;
  mimeType?: string;
}

export type ProductDescriptionInput = string | DescriptionPart[];
