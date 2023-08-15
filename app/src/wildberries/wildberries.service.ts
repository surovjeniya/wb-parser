import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import puppeteer, { Browser, KeyInput, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { DOWNLOADS_DIR, SESSIONS_DIRS } from './config/browser.config';
import {
  copyWithRsync,
  createDownloadsDir,
  createSessionsDir,
  delay,
  getFileLink,
  getNextNumber,
  keyboardPress,
  parseXlsx,
  start,
} from './utils/wildberries.utils';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';
import { waitForDownload } from 'puppeteer-utilz';

@Injectable()
export class WildberriesService {
  private code = null;
  private readonly logger = new Logger(WildberriesService.name);

  // async changeShop(shop_name?: string): Promise<Page> {
  //   const browserIdx = await puppeteer.connect({
  //     browserWSEndpoint: 'ws://nginx-service:80',
  //   });
  //   const page: Page = await newPage();
  //   try {
  //     await page.goto(
  //       'https://seller.wildberries.ru/login/ru/?redirect_url=/',
  //       {
  //         waitUntil: 'load',
  //       },
  //     );
  //     await delay(3000);
  //     await page
  //       .waitForSelector('.ProfileView', { timeout: 15000 })
  //       .catch((error) => {
  //         if (browserIdx !== 0) {
  //           const candidateSessions = SESSIONS_DIRS[browserIdx.toString()];
  //           copyWithRsync(SESSIONS_DIRS[0], candidateSessions);
  //         }
  //         this.logger.error(`changeShop >> ${browserIdx}`, error.message);
  //         throw new InternalServerErrorException('Wait profile view error.');
  //       });
  //     await page.click('.ProfileView', { delay: 1000 });
  //     await delay(3000);
  //     const linkHandlers = await page.$x(
  //       `//span[contains(text(), "${shop_name}")]`,
  //     );
  //     //@ts-ignore
  //     linkHandlers.length && (await linkHandlers[0].click());
  //     await delay(1000);
  //     return page;
  //   } catch (error) {
  //     await page.close();
  //   }
  // }

  async switchBrowser(browser_idx: 'one' | 'two' | 'three'): Promise<Browser> {
    let browser: Browser;
    switch (browser_idx) {
      case 'one':
        browser = await puppeteer.connect({
          browserWSEndpoint: 'ws://browserless_one:3001',
        });
        break;
      case 'two':
        browser = await puppeteer.connect({
          browserWSEndpoint: 'ws://browserless_two:3002',
        });
        break;
      case 'three':
        browser = await puppeteer.connect({
          browserWSEndpoint: 'ws://browserless_three:3003',
        });
        break;
      default:
        break;
    }
    return browser;
  }

  async sendPhoneNumber(
    phone_number: string,
    browser_idx: 'one' | 'two' | 'three',
  ) {
    let content: Awaited<string>;
    const browser = await this.switchBrowser(browser_idx);
    const page: Page = await browser.newPage();
    await page.goto('https://seller.wildberries.ru/login/ru/?redirect_url=/', {
      waitUntil: 'load',
    });
    await page
      .click(
        'img[src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiMwMDM5QTUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4wODY1IDE5Ljk5OTZIOS45MTM1QzkuOTQyMyAxOS45OTk5IDkuOTcxMTMgMjAgOS45OTk5OSAyMEMxMC4wMjg4IDIwIDEwLjA1NzcgMTkuOTk5OSAxMC4wODY1IDE5Ljk5OTZaTTE5LjUzMTIgNi45NjUzM0gwLjQ2ODc1QzEuNzUzNjcgMi45MjYxNCA1LjUzNTExIDAgOS45OTk5OSAwQzE0LjQ2NDkgMCAxOC4yNDYzIDIuOTI2MTQgMTkuNTMxMiA2Ljk2NTMzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0wLjQ0MTQwNiAxMi45NDI0QzEuNjk3NjkgMTcuMDI5MyA1LjUwMjY5IDIwLjAwMDIgMTAuMDAxNiAyMC4wMDAyQzE0LjUwMDUgMjAuMDAwMiAxOC4zMDU1IDE3LjAyOTMgMTkuNTYxNyAxMi45NDI0SDAuNDQxNDA2WiIgZmlsbD0iI0Q1MkExRCIvPgo8L3N2Zz4K"]',
        {
          delay: 100,
        },
      )
      .then(() => page.click('button[value="by"]', { delay: 100 }))
      .then(() =>
        page.click('input[autocomplete="new-password"]', {
          delay: 100,
        }),
      )
      .then(() =>
        page.type('input[autocomplete="new-password"]', phone_number, {
          delay: 100,
        }),
      )
      .then(() =>
        page.click('button[type="submit"]', {
          delay: 500,
        }),
      )
      .then(() => page.click('input[inputmode="numeric"]', { delay: 500 }));
    await delay(15000);
    if (this.code) {
      await keyboardPress(null, this.code.split('') as KeyInput[], page);
      this.code = null;
      await page
        .waitForSelector('.ProfileView', { visible: true, timeout: 60000 })
        .catch((error) => {
          this.logger.error('ProfileView', error.message);
          throw new InternalServerErrorException(
            'Profile selector waiting error.',
          );
        });
      content = await page.content();
      await browser.close();
      return content;
    } else {
      await browser.close();
      throw new UnauthorizedException('Code in empty.');
    }
  }

  async sendCode(code: string): Promise<string> {
    this.code = code;
    return this.code;
  }

  // async goToAdverts({
  //   advert_id,
  //   end_date,
  //   shop_name,
  //   start_date,
  //   with_content,
  //   parse_xlsx,
  // }: GoToAdvertsDto) {
  //   const page = await this.changeShop(shop_name);
  //   try {
  //     const uuid = v4();
  //     const client = await page.target().createCDPSession();
  //     await client.send('Page.setDownloadBehavior', {
  //       behavior: 'allow',
  //       downloadPath: path.join(DOWNLOADS_DIR, uuid),
  //     });
  //     await page.goto(`https://cmp.wildberries.ru/statistics/${advert_id}`, {
  //       waitUntil: 'load',
  //     });
  //     await delay(5000);
  //     await page.waitForSelector('.icon__calendar', { visible: true });
  //     await page.click('.icon__calendar', { delay: 500 });
  //     await delay(2000);
  //     const inputsElements = await page.$$(
  //       '.date-picker__period-calendar__input',
  //     );
  //     await inputsElements[0].click({ count: 3 });
  //     await keyboardPress('Backspace', null, page);
  //     await keyboardPress(null, start_date.split('') as KeyInput[], page);
  //     await inputsElements[1].click({ count: 3 });
  //     await keyboardPress('Backspace', null, page);
  //     await keyboardPress(null, end_date.split('') as KeyInput[], page);
  //     const submitBtn = await page.$x(
  //       `//button[contains(text(), " Применить ")]`,
  //     );
  //     //@ts-ignore
  //     await submitBtn[0].click();
  //     await page.evaluate(() => window.scroll(0, 0));
  //     await page.click('.icon__download');
  //     await waitForDownload(path.join(DOWNLOADS_DIR, uuid));
  //     // await delay(3000);
  //     const fileName = await fs.promises
  //       .readdir(path.join(DOWNLOADS_DIR, uuid), {
  //         withFileTypes: true,
  //       })
  //       .then((data) => {
  //         fs.renameSync(
  //           path.join(DOWNLOADS_DIR, uuid, data[0].name),
  //           path.join(DOWNLOADS_DIR, uuid, 'order.xlsx'),
  //         );
  //         return 'order.xlsx';
  //       })
  //       .catch((error) => {
  //         page.close();
  //         this.logger.error(`${this.goToAdverts.name}`, error.message);
  //         throw new InternalServerErrorException('Download cpm file error.');
  //       });
  //     const fileLink = getFileLink(fileName, uuid);
  //     const content = await page.content();
  //     await page.close();
  //     if (with_content) {
  //       return content;
  //     }
  //     if (parse_xlsx) {
  //       return {
  //         parsedXlsxData:
  //           parse_xlsx &&
  //           (await parseXlsx(path.join(DOWNLOADS_DIR, uuid, fileName))),
  //       };
  //     } else {
  //       return {
  //         fileLink,
  //       };
  //     }
  //   } catch (error) {
  //     this.logger.error(`goToAdverts >> `, error.message);
  //   }
  // }
}
