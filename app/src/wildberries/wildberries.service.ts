import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { log } from 'console';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

/**
 * @type {import("puppeteer").Configuration}
 */

@Injectable()
export class WildberriesService {
  private readonly logger = new Logger(WildberriesService.name);
  constructor(private readonly configService: ConfigService) {}

  delay(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private code = null;

  async start(): Promise<Browser> {
    const sessionsDir = this.createSessinsDir();
    const browser = await puppeteer.launch({
      headless: 'new',
      ignoreHTTPSErrors: true,
      userDataDir: sessionsDir,

      executablePath: this.configService.get('PUPPETEER_EXECUTABLE_PATH'),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
      ],
    });
    return browser;
  }

  createDonwloadsDir(): string {
    if (!fs.existsSync(path.join(__dirname, '..', '..', 'downloads')))
      fs.mkdirSync(path.join(__dirname, '..', '..', 'downloads'));
    return path.join(__dirname, '..', '..', 'downloads');
  }

  createSessinsDir(): string {
    if (!fs.existsSync(path.join(__dirname, 'sessions')))
      fs.mkdirSync(path.join(__dirname, 'sessions'));
    return path.join(__dirname, 'sessions');
  }

  async changeShop(shop_id?: string, shop_name?: string): Promise<Page> {
    const browser = await this.start();
    const page = await browser.newPage();

    await page.goto('https://seller.wildberries.ru/login/ru/?redirect_url=/');
    await page.waitForSelector('.ProfileView');
    await page.click('.ProfileView', { delay: 300 });
    await this.delay(3000);
    const linkHandlers = await page.$x(
      `//span[contains(text(), "${shop_name}")]`,
    );
    log(linkHandlers.length);
    //@ts-ignore
    linkHandlers.length && (await linkHandlers[0].click());
    await this.delay(1000);
    return page;
  }

  async sendPhoneNumber(phone_number: string): Promise<string> {
    const browser = await this.start();
    const page = await browser.newPage();
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
    await this.delay(15000);

    for await (const c of this.code) {
      console.log(c);

      await page.keyboard.press(c, { delay: 200 });
    }
    const content = await page.content();
    await browser.close();
    return content;
  }

  async sendCode(code: string): Promise<void> {
    this.code = code;
  }

  async gotoFourteenOrder(
    shop_name: string,
    start_date: string,
    end_date: string,
  ): Promise<Page> {
    const page = await this.changeShop('15', shop_name);
    await page.goto('https://seller.wildberries.ru/analytics');
    await this.delay(1000);

    const linkHandlers = await page.$x(
      `//span[contains(text(), "Аналитика по карточкам товаров")]`,
    );
    //@ts-ignore
    await linkHandlers[0].click();
    await this.delay(1000);
    await page.waitForSelector('#dateRange');

    await page.click('#dateRange');
    await this.delay(1000);
    await page.click('#startDate', { delay: 50 });
    for await (const i of new Array(10)) {
      await page.keyboard.press('Backspace');
    }
    await page.type('#startDate', start_date, { delay: 50 });
    await page.click('#endDate');
    for await (const i of new Array(10)) {
      await page.keyboard.press('Backspace');
    }
    await page.type('#endDate', end_date, { delay: 50 });
    await this.delay(1000);
    const saveBtn = await page.$x(`//span[contains(text(), "Сохранить")]`);
    //@ts-ignore
    await saveBtn[0].click();
    await this.delay(1000);
    const saveXlsxBtn = await page.$x(
      `//span[contains(text(), "Создать Excel")]`,
    );
    //@ts-ignore
    await saveXlsxBtn[0].click();
    await this.delay(1000);

    await page.goto(
      'https://seller.wildberries.ru/new-goods/created-cards?loadManagerHistory=true',
    );
    await this.delay(1000);
    return page;
  }

  async downloadFourteenOrder(
    shop_name: string,
    start_date: string,
    end_date: string,
  ): Promise<string> {
    const uuid = v4();
    const downloadsDir = `${this.createDonwloadsDir()}/${uuid}`;
    const page = await this.gotoFourteenOrder(shop_name, start_date, end_date);
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadsDir,
    });
    await this.delay(10000);
    await page.reload();
    await this.delay(2000);

    const saveXlsxBtn = await page.$x(
      `//span[contains(text(), "Скачать архив")]`,
    );
    //@ts-ignore
    await saveXlsxBtn[0].click({ delay: 100 });
    await this.delay(1000);
    const files = await fs.promises.readdir(downloadsDir, {
      withFileTypes: true,
    });
    await page.browser().close();
    return `${this.configService.get('HOST_NAME')}:${this.configService.get(
      'PORT',
    )}/${uuid}/${files[0].name}`;
  }
}
