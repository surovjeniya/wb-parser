import {
  BROWSER_CONFIG,
  DOWNLOADS_DIR,
  NODE_ENV,
  SESSIONS_DIR,
  SESSIONS_DIR_THREE,
  SESSIONS_DIR_TWO,
} from '../config/browser.config';
import * as fs from 'fs';
import puppeteer, { Browser, KeyInput, Page, Protocol } from 'puppeteer';
import xlsx from 'node-xlsx';
import * as child_process from 'child_process';
import * as path from 'path';

export const SESSIONS_DIRS = {
  '0': SESSIONS_DIR,
  '1': SESSIONS_DIR_TWO,
  '2': SESSIONS_DIR_THREE,
};

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

export const copyWithRecursive = async (
  from: string,
  to: string,
): Promise<void> => {
  return await fs.promises.cp(from, to, { recursive: true });
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
  const sessionsDirs = [SESSIONS_DIR, SESSIONS_DIR_TWO, SESSIONS_DIR_THREE];
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

  const browserOne = await puppeteer
    .launch({ ...BROWSER_CONFIG, userDataDir: SESSIONS_DIR })
    .catch((error) => {
      console.log('Error from launch 1', error.message);
    });
  const browserTwo = await puppeteer
    .launch({ ...BROWSER_CONFIG, userDataDir: SESSIONS_DIR_TWO })
    .catch((error) => {
      console.log('Error from launch 2', error.message);
    });
  const browserThree = await puppeteer
    .launch({ ...BROWSER_CONFIG, userDataDir: SESSIONS_DIR_THREE })
    .catch((error) => {
      console.log('Error from launch 3', error.message);
    });
  browsers.push(browserOne, browserTwo, browserThree);

  return browsers;
};

function convertToObjects(data) {
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

export const parseXlsx = async (filePath: string) => {
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

export const getNextNumber = () => {
  currentNumber = (currentNumber + 1) % 3;
  return currentNumber;
};
