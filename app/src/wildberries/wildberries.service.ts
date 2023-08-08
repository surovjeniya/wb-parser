import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import puppeteer, { Browser, KeyInput, Page, Protocol } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as decompress from 'decompress';
import xlsx from 'node-xlsx';

@Injectable()
export class WildberriesService implements OnModuleInit {
  private readonly downloads_dir = path.join(
    __dirname,
    '..',
    '..',
    'downloads',
  );
  private readonly sessions_dir = path.join(this.downloads_dir, 'sessions');
  private readonly port =
    this.configService.get('NODE_ENV') &&
    this.configService.get('NODE_ENV') === 'production'
      ? ''
      : `:${this.configService.get('PORT')}`;
  private readonly host_name =
    this.configService.get('NODE_ENV') &&
    this.configService.get('NODE_ENV') === 'production'
      ? this.configService.get('HOST_NAME')
      : 'http://localhost';
  private code = null;
  private readonly logger = new Logger(WildberriesService.name);
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.createSessionsDir();
  }

  createDownloadsDir(): string {
    if (!fs.existsSync(this.downloads_dir)) fs.mkdirSync(this.downloads_dir);
    return this.downloads_dir;
  }

  createSessionsDir(): string {
    if (!fs.existsSync(this.sessions_dir)) fs.mkdirSync(this.sessions_dir);
    return this.sessions_dir;
  }

  delay(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async start(): Promise<Browser> {
    const browser = await puppeteer
      .launch({
        env: {
          DISPLAY: ':10.0',
        },
        headless: 'new',
        ignoreHTTPSErrors: true,
        userDataDir: this.sessions_dir,
        executablePath: '/usr/bin/google-chrome',
        args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
        ],
      })
      .catch((error) => {
        fs.promises.rm(path.join(this.sessions_dir, 'SingletonLock'), {
          recursive: true,
        });
        this.logger.error('start', error.message);
        throw new InternalServerErrorException('Browser start error');
      });
    return browser;
  }

  async changeShop(shop_id?: string, shop_name?: string): Promise<Page> {
    const browser = await this.start();
    try {
      const page = await browser.newPage();
      await page.goto(
        'https://seller.wildberries.ru/login/ru/?redirect_url=/',
        {
          waitUntil: 'load',
        },
      );
      await this.delay(3000);
      await page.waitForSelector('.ProfileView').catch((error) => {
        this.logger.error('changeShop', error.message);
        browser.close();
        throw new InternalServerErrorException(
          'Profile selector waiting error.',
        );
      });
      await page.click('.ProfileView', { delay: 300 });
      await this.delay(3000);
      const linkHandlers = await page.$x(
        `//span[contains(text(), "${shop_name}")]`,
      );
      //@ts-ignore
      linkHandlers.length && (await linkHandlers[0].click());
      await this.delay(1000);
      return page;
    } catch (error) {
      fs.promises.rm(path.join(this.sessions_dir, 'SingletonLock'), {
        recursive: true,
      });
      await browser.close();
    }
  }

  async sendPhoneNumber(
    phone_number: string,
  ): Promise<string | UnauthorizedException> {
    if (fs.existsSync(this.sessions_dir)) {
      await fs.promises.rm(this.sessions_dir, { recursive: true });
      await fs.promises.mkdir(this.sessions_dir);
    }

    const browser = await this.start();
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
    await this.delay(15000);
    if (this.code && this.code.length) {
      for await (const c of this.code) {
        console.log(c);

        await page.keyboard.press(c, { delay: 200 });
      }
      const content = await page.content();
      await browser.close();
      return content;
    } else {
      fs.promises.rm(path.join(this.sessions_dir, 'SingletonLock'), {
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

  async parseXlsx(
    fileName: string,
    dir: string,
  ): Promise<
    {
      name: string;
      data: any[][];
    }[]
  > {
    const fileData = fs.readFileSync(
      path.join(this.downloads_dir, dir, fileName),
    );
    const parsedData = xlsx.parse(fileData);
    return parsedData;
  }

  async unzipFile(
    dir: string,
    fileName: string,
  ): Promise<decompress.File[] | InternalServerErrorException> {
    const filePath = path.join(this.downloads_dir, dir, fileName);
    const decompresssed = await decompress(
      filePath,
      path.join(this.downloads_dir, dir),
    ).catch((error) => {
      this.logger.error('unzipFile', error.message);
      throw new InternalServerErrorException('Zip unpacked error.');
    });
    await fs.promises.unlink(filePath).catch((error) => {
      this.logger.error('unzipFile', error.message);
      throw new InternalServerErrorException('Zip unlink error.');
    });
    return decompresssed;
  }

  async gotoFourteenOrder(
    shop_name: string,
    start_date: string,
    end_date: string,
  ): Promise<Page> {
    const page = await this.changeShop('15', shop_name);
    try {
      await page.goto('https://seller.wildberries.ru/analytics');
      await this.delay(2000);

      const linkHandlers = await page.$x(
        `//span[contains(text(), "Аналитика по карточкам товаров")]`,
      );
      //@ts-ignore
      await linkHandlers[0].click();
      await this.delay(2000);
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
      await this.delay(1000);
      await page.type('#endDate', end_date, { delay: 50 });
      await this.delay(2000);
      const saveBtn = await page.$x(`//span[contains(text(), "Сохранить")]`);
      //@ts-ignore
      await saveBtn[0].click();
      await this.delay(1000);
      const saveXlsxBtn = await page.$x(
        `//span[contains(text(), "Скачать Excel")]`,
      );
      await this.delay(1000);
      //@ts-ignore
      await saveXlsxBtn[0].click();
      await this.delay(1000);
      await page.goto(
        'https://seller.wildberries.ru/new-goods/created-cards?loadManagerHistory=true',
      );
      await this.delay(1000);
      return page;
    } catch (error) {
      fs.promises.rm(path.join(this.sessions_dir, 'SingletonLock'), {
        recursive: true,
      });
      await page.browser().close();
    }
  }

  async downloadFourteenOrder(
    shop_name: string,
    start_date: string,
    end_date: string,
    parse_xlsx?: boolean,
  ): Promise<
    | string
    | {
        name: string;
        data: any[][];
      }[]
    | InternalServerErrorException
  > {
    const uuid = v4();
    const downloadsDir = `${this.createDownloadsDir()}/${uuid}`;
    const page = await this.gotoFourteenOrder(shop_name, start_date, end_date);
    try {
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadsDir,
      });
      await this.delay(15000);
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
      const xlsxFile = await this.unzipFile(uuid, files[0].name);
      const fileName = xlsxFile[0].path;
      if (parse_xlsx) {
        const parsedData = await this.parseXlsx(fileName, uuid).catch(
          (error) => {
            page.browser().close();
            this.logger.error('downloadFourteenOrder', error.message);
            throw new InternalServerErrorException('XLSX parse error.');
          },
        );
        return parsedData;
      } else {
        const fileLink = `${this.host_name}${this.port}/${uuid}/${fileName}`;
        return fileLink;
      }
    } catch (error) {
      fs.promises.rm(path.join(this.sessions_dir, 'SingletonLock'), {
        recursive: true,
      });
      await page.browser().close();
    }
  }

  async keyboardPress(key?: KeyInput, keys?: KeyInput[], page?: Page) {
    if (key) {
      await page.keyboard.press(key, { delay: 50 });
    }
    if (keys && keys.length) {
      for await (const key of keys) {
        await page.keyboard.press(key, { delay: 50 });
      }
    }
  }

  async setCookies(page: Page, cookies: Protocol.Network.Cookie[]) {
    const client = await page.target().createCDPSession();
    return await client.send('Network.setCookies', { cookies });
  }

  async getCookies(page: Page) {
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getCookies');
    return cookies;
  }

  async goToAdverts(
    shop_name: string,
    advert_id: string,
    start_date: string,
    end_date: string,
    with_content?: boolean,
  ) {
    const page = await this.changeShop('15', shop_name);
    try {
      const uuid = v4();
      const client = await page.target().createCDPSession();
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: path.join(this.downloads_dir, uuid),
      });
      await page.goto(`https://cmp.wildberries.ru/statistics/${advert_id}`, {
        waitUntil: 'load',
      });
      await this.delay(3000);
      await page.click('.icon__calendar');
      await this.delay(2000);

      const inputsElements = await page.$$(
        '.date-picker__period-calendar__input',
      );

      await inputsElements[0].click({ count: 3 });
      await this.keyboardPress('Backspace', null, page);
      //@ts-ignore
      await this.keyboardPress(null, start_date.split(''), page);

      await inputsElements[1].click({ count: 3 });
      await this.keyboardPress('Backspace', null, page);
      //@ts-ignore
      await this.keyboardPress(null, end_date.split(''), page);

      const submitBtn = await page.$x(
        `//button[contains(text(), " Применить ")]`,
      );
      //@ts-ignore
      await submitBtn[0].click();

      await page.evaluate(() => window.scroll(0, 0));

      await page.click('.icon__download');
      await this.delay(3000);
      const fileName = await fs.promises
        .readdir(path.join(this.downloads_dir, uuid), {
          withFileTypes: true,
        })
        .then((data) => data[0].name)
        .catch((error) => {
          throw new InternalServerErrorException('Download cpm file error.');
        });
      //@ts-ignore
      const fileLink = `${this.host_name}${this.port}/${uuid}/${
        fileName && fileName.replaceAll(' ', '%20')
      }`;
      const content = await page.content();
      await page.browser().close();
      if (with_content) {
        return content;
      } else {
        return fileLink;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
