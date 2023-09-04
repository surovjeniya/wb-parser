export interface ICardDetail {
  state: number;
  params: Params;
  data: Data;
}

export interface Params {
  version: number;
  curr: string;
  spp: number;
}

export interface Data {
  products: Product[];
}

export interface Product {
  id: number;
  root: number;
  kindId: number;
  subjectId: number;
  subjectParentId: number;
  name: string;
  brand: string;
  brandId: number;
  siteBrandId: number;
  supplierId: number;
  priceU: number;
  salePriceU: number;
  logisticsCost: number;
  sale: number;
  extended: Extended;
  saleConditions: number;
  returnCost: number;
  pics: number;
  rating: number;
  reviewRating: number;
  feedbacks: number;
  volume: number;
  isNew: boolean;
  colors: Color[];
  promotions: number[];
  sizes: Size[];
  diffPrice: boolean;
  time1: number;
  time2: number;
  wh: number;
}

export interface Extended {
  clientSale: number;
  clientPriceU: number;
}

export interface Color {
  name: string;
  id: number;
}

export interface Size {
  name: string;
  origName: string;
  rank: number;
  optionId: number;
  returnCost: number;
  stocks: Stock[];
  time1: number;
  time2: number;
  wh: number;
  sign: string;
}

export interface Stock {
  wh: number;
  qty: number;
  time1: number;
  time2: number;
}
