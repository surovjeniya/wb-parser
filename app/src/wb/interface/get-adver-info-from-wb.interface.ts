export interface WbAdvertInfo {
  httpStatus: number;
  error: string;
  code: number;
  totalCount: number;
  pageCount: number;
  content: Content;
}

export interface IBoosterStat {
  date: string;
  nm: number;
  avg_position: number;
}

export interface Content {
  advertId: number;
  begin: string;
  end: string;
  days: Day[];
  views: number;
  clicks: number;
  frq: number;
  unique_users: number;
  ctr: number;
  cpc: number;
  sum: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
  detailed: boolean;
  boosterStats: IBoosterStat[];
}

export interface Day {
  date: string;
  apps: App[];
  views: number;
  clicks: number;
  frq: number;
  unique_users: number;
  ctr: number;
  cpc: number;
  sum: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
}

export interface App {
  appType: number;
  nm: Nm[];
  views: number;
  clicks: number;
  frq: number;
  unique_users: number;
  ctr: number;
  cpc: number;
  sum: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
}

export interface Nm {
  nmId: number;
  name: string;
  views: number;
  clicks: number;
  frq: number;
  unique_users: number;
  ctr: number;
  cpc: number;
  sum: number;
  atbs: number;
  orders: number;
  cr: number;
  shks: number;
  sum_price: number;
}
