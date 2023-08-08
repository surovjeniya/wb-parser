import {
  BROWSER_CONFIG,
  DOWNLOADS_DIR,
  NODE_ENV,
  SESSIONS_DIR,
} from '../config/browser.config';
import * as fs from 'fs';
import puppeteer, { Browser, KeyInput, Page, Protocol } from 'puppeteer';
import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';

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

export const createSessionsDir = (): string => {
  if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);
  return SESSIONS_DIR;
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

export const start = async (): Promise<Browser> => {
  const browser = await puppeteer.launch(BROWSER_CONFIG).catch((error) => {
    fs.promises.rm(path.join(SESSIONS_DIR, 'SingletonLock'), {
      recursive: true,
    });
    console.error('start', error.message);
    throw new InternalServerErrorException('Browser start error');
  });
  return browser;
};
