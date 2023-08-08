import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Browser, KeyInput, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { DOWNLOADS_DIR, SESSIONS_DIR } from './config/browser.config';
import {
  createSessionsDir,
  delay,
  getFileLink,
  keyboardPress,
  parseXlsx,
  start,
} from './utils/wildberries.utils';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';

@Injectable()
export class WildberriesService implements OnModuleInit, OnModuleDestroy {
  private code = null;
  private readonly logger = new Logger(WildberriesService.name);
  private browser = null;
  constructor(private readonly configService: ConfigService) {}

  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }

  onModuleInit(): void {
    createSessionsDir();
  }

  async changeShop(shop_name?: string): Promise<Page> {
    const browser = await start();
    try {
      const page = await browser.newPage();

      await page.goto(
        'https://seller.wildberries.ru/login/ru/?redirect_url=/',
        {
          waitUntil: 'load',
        },
      );
      await delay(3000);
      await page.waitForSelector('.ProfileView').catch((error) => {
        this.logger.error('changeShop', error.message);
        browser.close();
        throw new InternalServerErrorException(
          'Profile selector waiting error.',
        );
      });
      await page.click('.ProfileView', { delay: 300 });
      await delay(3000);
      const linkHandlers = await page.$x(
        `//span[contains(text(), "${shop_name}")]`,
      );
      //@ts-ignore
      linkHandlers.length && (await linkHandlers[0].click());
      await delay(1000);
      return page;
    } catch (error) {
      fs.promises.rm(path.join(SESSIONS_DIR, 'SingletonLock'), {
        recursive: true,
      });
      await browser.close();
    }
  }

  async sendPhoneNumber(
    phone_number: string,
  ): Promise<string | UnauthorizedException> {
    if (fs.existsSync(SESSIONS_DIR)) {
      await fs.promises.rm(SESSIONS_DIR, { recursive: true });
      await fs.promises.mkdir(SESSIONS_DIR);
    }
    const browser = await start();
    const page: Page = await browser.newPage();
    await page.goto('https://seller.wildberries.ru/login/ru/?redirect_url=/');
    await page.click(
      'img[src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiMwMDM5QTUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC4wODY1IDE5Ljk5OTZIOS45MTM1QzkuOTQyMyAxOS45OTk5IDkuOTcxMTMgMjAgOS45OTk5OSAyMEMxMC4wMjg4IDIwIDEwLjA1NzcgMTkuOTk5OSAxMC4wODY1IDE5Ljk5OTZaTTE5LjUzMTIgNi45NjUzM0gwLjQ2ODc1QzEuNzUzNjcgMi45MjYxNCA1LjUzNTExIDAgOS45OTk5OSAwQzE0LjQ2NDkgMCAxOC4yNDYzIDIuOTI2MTQgMTkuNTMxMiA2Ljk2NTMzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0wLjQ0MTQwNiAxMi45NDI0QzEuNjk3NjkgMTcuMDI5MyA1LjUwMjY5IDIwLjAwMDIgMTAuMDAxNiAyMC4wMDAyQzE0LjUwMDUgMjAuMDAwMiAxOC4zMDU1IDE3LjAyOTMgMTkuNTYxNyAxMi45NDI0SDAuNDQxNDA2WiIgZmlsbD0iI0Q1MkExRCIvPgo8L3N2Zz4K"]',
      {
        delay: 100,
      },
    );
    await page.click('button[value="by"]', {
      delay: 100,
    });
    await page.click('input[autocomplete="new-password"]', {
      delay: 100,
    });
    await page.type('input[autocomplete="new-password"]', phone_number, {
      delay: 100,
    });
    await page.click('button[type="submit"]', {
      delay: 500,
    });

    await page.click('input[inputmode="numeric"]', { delay: 500 });
    await delay(15000);
    if (this.code && this.code.length) {
      await keyboardPress(null, this.code.split('') as KeyInput[], page);
      await delay(5000);
      const content = await page.content();
      await browser.close();

      return content;
    } else {
      fs.promises.rm(path.join(SESSIONS_DIR, 'SingletonLock'), {
        recursive: true,
      });
      browser.close();

      throw new UnauthorizedException(
        'Code is empty. Input time is 15 seconds.Try signin again.',
      );
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
    try {
      const uuid = v4();
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.join(DOWNLOADS_DIR, uuid),
      });
      await page.goto(`https://cmp.wildberries.ru/statistics/${advert_id}`, {
        waitUntil: 'load',
      });
      // await delay(5000);
      await page.waitForSelector('.icon__calendar', { visible: true });
      await page.click('.icon__calendar', { delay: 500 });
      // await delay(2000);
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
      await delay(3000);
      const fileName = await fs.promises
        .readdir(path.join(DOWNLOADS_DIR, uuid), {
          withFileTypes: true,
        })
        .then((data) => {
          fs.renameSync(
            path.join(DOWNLOADS_DIR, uuid, data[0].name),
            path.join(DOWNLOADS_DIR, uuid, 'order.xlsx'),
          );
          return 'order.xlsx';
        })
        .catch((error) => {
          page.browser().close();
          this.logger.error(`${this.goToAdverts.name}`, error.message);
          throw new InternalServerErrorException('Download cpm file error.');
        });
      const fileLink = getFileLink(fileName, uuid);
      const content = await page.content();
      await page.browser().close();
      if (with_content) {
        return content;
      } else {
        return {
          fileLink,
          parsedXlsxData:
            parse_xlsx &&
            (await parseXlsx(path.join(DOWNLOADS_DIR, uuid, fileName))),
        };
      }
    } catch (error) {
      await page.browser().close();
      console.error(`${this.goToAdverts.name}`, error.message);
    }
  }
}
