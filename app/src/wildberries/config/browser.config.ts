import { PuppeteerLaunchOptions } from 'puppeteer';
import * as path from 'path';

export const NODE_ENV = process.env.NODE_ENV;
export const DOWNLOADS_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'downloads',
);

export const SESSIONS_DIRS = {
  '0': path.join(DOWNLOADS_DIR, 'sessions'),
  '1': path.join(DOWNLOADS_DIR, 'sessions_two'),
  '2': path.join(DOWNLOADS_DIR, 'sessions_three'),
};

export const BROWSER_CONFIG: PuppeteerLaunchOptions = {
  env: NODE_ENV && {
    DISPLAY: ':10.0',
  },
  headless: NODE_ENV ? true : true,
  ignoreHTTPSErrors: true,
  executablePath: NODE_ENV && '/usr/bin/google-chrome',
  devtools: NODE_ENV ? false : true,
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
};
