import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import puppeteer, { Browser, KeyInput, Page } from 'puppeteer';
import { v4 } from 'uuid';
import {
  createDownloadsDir,
  delay,
  downloadXlsx,
  findFileOnServer,
  keyboardPress,
  pageController,
  parseXlsx,
} from './utils/wildberries.utils';
import { GoToAdvertsDto } from './dto/go-to-adverts.dto';
import { EventEmitter } from 'stream';

@Injectable()
export class WildberriesService implements OnModuleInit {
  onModuleInit() {
    createDownloadsDir();
  }
  private code = null;
  private readonly logger = new Logger(WildberriesService.name);

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

  async changeShop(shop_name?: string): Promise<Page | any> {
    const browser = await puppeteer.connect({
      browserWSEndpoint: 'ws://nginx-service:80',
    });
    const page: Page = await browser.newPage();
    await pageController(page.browser());
    try {
      await page.goto(
        'https://seller.wildberries.ru/login/ru/?redirect_url=/',
        {
          waitUntil: 'load',
        },
      );

      await page.waitForSelector('.ProfileView', { timeout: 15000 });
      await page.click('.ProfileView', { delay: 1000 });
      // await delay(3000);
      const linkHandlers = await page.$x(
        `//span[contains(text(), "${shop_name}")]`,
      );
      //@ts-ignore
      linkHandlers.length && (await linkHandlers[0].click());
      await delay(1000);
      return page;
    } catch (error) {
      this.logger.error(`${this.changeShop.name}`, error.message);
      await page.browser().close();
      throw new InternalServerErrorException(error.message);
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

  waitForEvent(emitter: EventEmitter, event: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      emitter.once(event, resolve);
      emitter.once(event, reject);
    });
  }

  async goToAdverts({
    advert_id,
    end_date,
    shop_name,
    start_date,
    with_content,
    parse_xlsx,
  }: GoToAdvertsDto) {
    const page: Page = await this.changeShop(shop_name);
    try {
      const emitter = new EventEmitter();
      const uuid = v4();
      const client = await page.target().createCDPSession();
      await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: `${process.env.WORKSPACE_DIR}/${uuid}`,
        eventsEnabled: true,
      });
      client.on('Browser.downloadProgress', (e) => {
        if (e.state === 'completed') {
          findFileOnServer(uuid).then((link) =>
            emitter.emit('download_success', link),
          );
        }
      });

      await page.goto(`https://cmp.wildberries.ru/statistics/${advert_id}`, {
        waitUntil: 'networkidle0',
      });
      await page.waitForSelector('.icon__calendar', {
        visible: true,
        timeout: 5000,
      });
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
      await page.evaluate(() => {
        window.scroll(0, 0);
      });
      await page.click('.icon__download');
      const fileLink = await this.waitForEvent(emitter, 'download_success');
      const filePath = await downloadXlsx(fileLink as string);
      const parsedXlsx = await parseXlsx(filePath);
      await page.browser().close();
      return parsedXlsx;
    } catch (error) {
      this.logger.error(`${this.goToAdverts.name}`, error.message);
      page.browser().close();
      throw new InternalServerErrorException(error.message);
    }
  }
}
