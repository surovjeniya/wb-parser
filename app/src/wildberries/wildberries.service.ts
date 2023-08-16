import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
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
  downloadXlsx,
  findFileOnServer,
  getFileLink,
  getNextNumber,
  keyboardPress,
  parseXlsx,
  start,
} from './utils/wildberries.utils';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';
import { waitForDownload } from 'puppeteer-utilz';
import axios from 'axios';

@Injectable()
export class WildberriesService {
  private code = null;
  private readonly logger = new Logger(WildberriesService.name);

  async changeShop(shop_name?: string): Promise<Page> {
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://nginx-service:80',
    });
    const page: Page = await browser.newPage();
    try {
      await page.goto(
        'https://seller.wildberries.ru/login/ru/?redirect_url=/',
        {
          waitUntil: 'load',
        },
      );
      await delay(3000);
      await page
        .waitForSelector('.ProfileView', { timeout: 15000 })
        .catch((error) => {
          browser.close();
          this.logger.error(`changeShop >> `, error.message);
          throw new InternalServerErrorException('Wait profile view error.');
        });
      await page.click('.ProfileView', { delay: 1000 });
      await delay(3000);
      const linkHandlers = await page.$x(
        `//span[contains(text(), "${shop_name}")]`,
      );
      //@ts-ignore
      linkHandlers.length && (await linkHandlers[0].click());
      await delay(1000);
      return page;
    } catch (error) {
      await page.browser().close();
    }
  }

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
          browser.close();
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

  async goToAdverts({
    advert_id,
    end_date,
    shop_name,
    start_date,
    with_content,
    parse_xlsx,
  }: GoToAdvertsDto) {
    const page = await this.changeShop(shop_name);
    const pagesCount = await page.browser().pages();
    console.log('----', pagesCount.length);
    if (pagesCount.length > 2) {
      await page.browser().close();
      throw new InternalServerErrorException('Too many pages.Try again.');
    }

    try {
      const uuid = v4();
      const client = await page.target().createCDPSession();

      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: `${process.env.WORKSPACE_DIR}/${uuid}`,
      });
      await page.goto(`https://cmp.wildberries.ru/statistics/${advert_id}`, {
        waitUntil: 'load',
      });
      await delay(5000);

      await page.waitForSelector('.icon__calendar', { visible: true });
      await page.click('.icon__calendar', { delay: 500 });
      await delay(2000);
      const inputsElements = await page.$$(
        '.date-picker__period-calendar__input',
      );

      await inputsElements[0].click({ count: 3 });
      await keyboardPress('Backspace', null, page);
      await keyboardPress(null, start_date.split('') as KeyInput[], page);
      await inputsElements[1].click({ count: 3 });
      await keyboardPress('Backspace', null, page);
      await keyboardPress(null, end_date.split('') as KeyInput[], page);

      const submitBtn = await page.$x(
        `//button[contains(text(), " Применить ")]`,
      );

      //@ts-ignore
      await submitBtn[0].click();
      await page.evaluate(() => window.scroll(0, 0));
      await page.click('.icon__download');
      await page
        .waitForNavigation({
          waitUntil: 'networkidle0',
          timeout: 5000,
        })
        .catch((e) => console.log(e.message));
      await page.browser().close();
      const fileLink = await findFileOnServer(uuid);
      let filePath;
      if (fileLink) {
        filePath = await downloadXlsx(fileLink);
        console.log(filePath);
        // const parserXlsx = await parseXlsx(filePath);
        // return {
        //   parseXlsx,
        // };
      } else {
        return fileLink;
      }
    } catch (error) {
      page.browser().close();
      this.logger.error(`goToAdverts >> `, error.message);
    }
  }
}
