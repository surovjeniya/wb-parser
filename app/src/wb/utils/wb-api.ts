import axios from 'axios';
import { WbAdvertInfo } from '../interface/get-adver-info-from-wb.interface';

class WbAPi {
  async getAdvertFullStat(
    advert_id: string,
    x_supplier_id_external: string,
    wbauid: string,
    wb_token: string,
  ) {
    try {
      const { data } = await axios.get<WbAdvertInfo>(
        `https://cmp.wildberries.ru/backend/api/v3/fullstat/${advert_id}`,
        {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-control': ' no-store',
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie: `_wbauid=${wbauid}; x-supplier-id-external=${x_supplier_id_external}; WBToken=${wb_token}`,
            Host: 'cmp.wildberries.ru',
            Referer: `https://cmp.wildberries.ru/statistics/${advert_id}`,
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'X-User-Id': 120013941,
            'sec-ch-ua':
              'Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'macOS',
          },
        },
      );
      return data;
    } catch (error) {
      console.log(error.message);
    }
  }
}

export const wbApiInstance = new WbAPi();
