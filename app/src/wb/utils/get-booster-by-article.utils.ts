import { IBoosterStat } from '../interface/get-adver-info-from-wb.interface';

export interface IContentData {
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
  avg_position: number;
}

export const getBoostersData = (
  contentData: IContentData[],
  boosterData: IBoosterStat[],
) => {
  const result = [];
  for (let i = 0; i < contentData.length; i++) {
    const item = { ...contentData[i], avg_position: 0 };
    if (boosterData.length) {
      for (let j = 0; j < boosterData.length; j++) {
        if (item.nmId === boosterData[j].nm) {
          item.avg_position = boosterData[j].avg_position;
        }
      }
    }
    result.push(item);
  }
  return result;
};
