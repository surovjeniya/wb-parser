export type ICardRating = Root2[];

export interface Root2 {
  nm_id: number;
  response_code: number;
  rating: number;
  errors: Error[];
}

export interface Error {
  field: string;
  details?: string[];
  image_details?: ImageDetail[];
}

export interface ImageDetail {
  file: string;
  messages: string[];
}
