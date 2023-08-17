import {
  BROWSER_CONFIG,
  DOWNLOADS_DIR,
  NODE_ENV,
  SESSIONS_DIRS,
} from '../config/browser.config';
import * as fs from 'fs';
import puppeteer, { Browser, KeyInput, Page, Protocol } from 'puppeteer';
import xlsx from 'node-xlsx';
import * as child_process from 'child_process';
import axios from 'axios';
import { error } from 'console';
import { v4 } from 'uuid';
import * as path from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export const getFileLink = (fileName: string, uuid: string): string => {
  const hostName = NODE_ENV ? process.env.HOST_NAME : 'http://localhost';
  const port = NODE_ENV ? '' : `:${process.env.PORT}`;
  const fileLink = `${hostName}${port}/${uuid}/${fileName && fileName}`;
  return fileLink;
};

export const createDownloadsDir = (): string => {
  if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);
  return DOWNLOADS_DIR;
};

export const copyWithRsync = async (
  from: string,
  to: string,
): Promise<void> => {
  child_process
    .spawn('rsync', ['-lr', `${from}/`, `${to}/`])
    .on('error', (error) =>
      console.log(error.message, 'Error in copyWithRsync'),
    )
    .on('exit', (code, signal) =>
      console.log('child process exit', code, signal),
    )
    .on('message', (message, handler) =>
      console.log('child process message', message, handler),
    );
};

export const createSessionsDir = (): string[] => {
  const sessionsDirs = Object.values(SESSIONS_DIRS);
  for (let i = 0; i < sessionsDirs.length; i++) {
    if (!fs.existsSync(sessionsDirs[i])) fs.mkdirSync(sessionsDirs[i]);
  }
  return sessionsDirs;
};

export const delay = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const keyboardPress = async (
  key?: KeyInput,
  keys?: KeyInput[],
  page?: Page,
): Promise<void> => {
  if (key) {
    await page.keyboard.press(key, { delay: 50 });
  }

  if (keys && keys.length) {
    for await (const key of keys) {
      await page.keyboard.press(key, { delay: 50 });
    }
  }
};

export const setCookies = async (
  page: Page,
  cookies: Protocol.Network.Cookie[],
): Promise<void> => {
  const client = await page.target().createCDPSession();
  return await client.send('Network.setCookies', { cookies });
};

export const getCookies = async (
  page: Page,
): Promise<Protocol.Network.Cookie[]> => {
  const client = await page.target().createCDPSession();
  const { cookies } = await client.send('Network.getCookies');
  return cookies;
};

export const start = async (): Promise<Browser[]> => {
  const browsers = [];
  for await (const [index, value] of Object.values(SESSIONS_DIRS).entries()) {
    const browser = await puppeteer
      .launch({
        ...BROWSER_CONFIG,
        userDataDir: SESSIONS_DIRS[index],
      })
      .catch((error) =>
        console.log(`Error from launch ${index}`, error.message),
      );
    browsers.push(browser);
  }

  return browsers;
};

function convertToObjects(data): Array<any> {
  const keys = data[0]; // Получаем ключи из первого вложенного массива
  const objects = [];

  for (let i = 1; i < data.length; i++) {
    const obj = {};
    const values = data[i];

    for (let j = 0; j < keys.length; j++) {
      obj[keys[j]] = values[j];
    }

    objects.push(obj);
  }

  return objects;
}

export const BROWSERLESS_SERVERS = {
  '1': 'http://browserless_one:3001',
  '2': 'http://browserless_two:3002',
  '3': 'http://browserless_three:3003',
};

export const findFileOnServer = async (
  workspace_id: string,
): Promise<string> => {
  const browserLessArray = Object.values(BROWSERLESS_SERVERS);
  let fileLink = null;
  for await (const browser of browserLessArray) {
    try {
      const {
        data,
      }: {
        data: {
          created: string;
          isDirectory: boolean;
          name: string;
          path: string;
          size: number;
          workspaceId: string;
        }[];
      } = await axios.get(`${browser}/workspace`);

      fileLink = data.find((item) => item.workspaceId === workspace_id);
      return `${browser}${fileLink.path}`;
    } catch (error) {
      console.log(error.message);
    }
  }
  fileLink ? (fileLink = `${fileLink}/workspace/${workspace_id}`) : null;
  return fileLink;
};

export const pageController = async (browser: Browser) => {
  const pages = await browser.pages();
  if (pages.length > 2) {
    await browser.close();
    throw new HttpException(
      'To many pages.Try againt',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
};

export const downloadXlsx = async (fileUrl: string) => {
  try {
    const fileName = `${v4()}.xlsx`;
    const filePath = path.join(DOWNLOADS_DIR, fileName);
    const { data } = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    await fs.promises.writeFile(filePath, data);
    return filePath;
  } catch (error) {
    console.log(error.message);
  }
};

export const parseXlsx = async (filePath: string): Promise<Array<any>> => {
  const parsedXlsxData: {
    name: string;
    data: any[][];
  }[] = await new Promise((resolve, reject) => {
    const data = xlsx.parse(filePath);
    resolve(data);
    reject('Parse xlsx error.');
  });

  const data = convertToObjects(parsedXlsxData[0].data);

  return data;
};

let currentNumber = -1;

export const getNextNumber = (): number => {
  currentNumber = (currentNumber + 1) % 3;
  return currentNumber;
};
