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
export const SESSIONS_DIR = path.join(DOWNLOADS_DIR, 'sessions');
export const SESSIONS_DIR_TWO = path.join(DOWNLOADS_DIR, 'sessions_two');
export const SESSIONS_DIR_THREE = path.join(DOWNLOADS_DIR, 'sessions_three');

export const BROWSER_CONFIG: PuppeteerLaunchOptions = {
  env: NODE_ENV && {
    DISPLAY: ':10.0',
  },

  headless: NODE_ENV ? 'new' : false,
  ignoreHTTPSErrors: true,
  // userDataDir: SESSIONS_DIR,
  executablePath: NODE_ENV && '/usr/bin/google-chrome',
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
