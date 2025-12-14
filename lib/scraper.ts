import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { fromZonedTime } from 'date-fns-tz';

export interface Apartment {
  objNr: string;
  refId: string;
  hood: string;
  aptType: string;
  address: string;
  aptNr: string;
  availableUntil: Date | null;
  bestPoints: number;
  bookers: number;
  infoLink: string;
  moveIn: Date | null;
  rent: number;
  sqm: number;
  special: string;
}

function stockholmTimeToUTC(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const stockholmDate = new Date(year, month - 1, day, hours, minutes);
  return fromZonedTime(stockholmDate, 'Europe/Stockholm');
}

const CHROMIUM_PACK_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/chromium-pack.tar`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/chromium-pack.tar`
  : "https://github.com/gabenunez/puppeteer-on-vercel/raw/refs/heads/main/example/chromium-dont-use-in-prod.tar";

let cachedExecutablePath: string | null = null;
let downloadPromise: Promise<string> | null = null;
let browser: Browser | null = null;

async function getChromiumPath(): Promise<string> {
  if (cachedExecutablePath) return cachedExecutablePath;

  if (!downloadPromise) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    downloadPromise = chromium
      .executablePath(CHROMIUM_PACK_URL)
      .then((path) => {
        cachedExecutablePath = path;
        console.log("Chromium path resolved:", path);
        return path;
      })
      .catch((error) => {
        console.error("Failed to get Chromium path:", error);
        downloadPromise = null;
        throw error;
      });
  }

  return downloadPromise;
}

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    let executablePath: string | undefined;
    let channel: 'chrome' | undefined;
    let launchArgs: string[];

    if (isProduction) {
      const chromium = (await import("@sparticuz/chromium-min")).default;
      chromium.setGraphicsMode = false;
      executablePath = await getChromiumPath();
      launchArgs = chromium.args;
    } else {
      channel = 'chrome';
      launchArgs = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    browser = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      channel,
      headless: true,
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export async function getApartmentList(): Promise<string[]> {
  const aptsListLink = "https://minasidor.sssb.se/lediga-bostader/?pagination=0&paginationantal=1000";
  let browser = await getBrowser();
  let page: Page;
  
  try {
    page = await browser.newPage();
  } catch (error) {
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('Target closed'))) {
      await closeBrowser();
      browser = await getBrowser();
      page = await browser.newPage();
    } else {
      throw error;
    }
  }

  try {
    const response = await page.goto(aptsListLink, { waitUntil: 'domcontentloaded' });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status() || 'unknown status'}`);
    }
    
    await page.waitForSelector('.appartment, #apartmentList', { timeout: 15000 }).catch(() => {
      console.warn('Apartment list container not found');
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const refIds = await page.evaluate(() => {
      const refIdSet = new Set<string>();
      
      const apartmentLinks = document.querySelectorAll('.appartment a[href*="refid"], #apartmentList a[href*="refid"]');
      
      apartmentLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/[?&]refid=([^&"']+)/);
          if (match && match[1]) {
            refIdSet.add(match[1]);
          }
        }
      });
      
      return Array.from(refIdSet);
    });

    return refIds;
  } finally {
    await page.close();
  }
}

export async function getApartment(refId: string): Promise<Apartment> {
  const aptLink = `https://minasidor.sssb.se/lediga-bostader/lagenhet/?refid=${refId}`;
  let browser = await getBrowser();
  let page: Page;
  
  try {
    page = await browser.newPage();
  } catch (error) {
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('Target closed'))) {
      await closeBrowser();
      browser = await getBrowser();
      page = await browser.newPage();
    } else {
      throw error;
    }
  }

  try {
    const response = await page.goto(aptLink, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    if (!response || !response.ok()) {
      throw new Error(`Failed to load apartment page: ${response?.status() || 'unknown status'}`);
    }
    try {
      await page.waitForFunction(
        () => {
          const ul = document.querySelector('ul.apt-details-data');
          if (!ul) return false;
          const text = ul.textContent || '';
          return !text.includes('{{') && !text.includes('}}');
        },
        { timeout: 30000 }
      );
    } catch (error) {
      throw new Error('Apt details data not fully rendered (mustache templates still present)');
    }
    await new Promise(resolve => setTimeout(resolve, 1000));

    const apt: Apartment = {
      objNr: '',
      refId: refId,
      hood: '',
      aptType: '',
      address: '',
      aptNr: '',
      availableUntil: null,
      bestPoints: 0,
      bookers: 0,
      infoLink: aptLink,
      moveIn: null,
      rent: 0,
      sqm: 0,
      special: '',
    };

    const pageData = await page.evaluate(() => {
      const data: Record<string, string> = {};
      
      const h1 = document.querySelector('h1.apt-title');
      if (h1) data.address = h1.textContent || '';
      
      const typeEl = document.querySelector('p.apt-address');
      if (typeEl) data.type = typeEl.textContent || '';
      
      const areaLink = document.querySelector('.apt-details-data a[href*="sssb.se"]');
      if (areaLink) data.area = areaLink.textContent || '';
      
      const headers = Array.from(document.querySelectorAll('.apt-details-headers li'));
      const dataItems = Array.from(document.querySelectorAll('.apt-details-data li'));
      
      const inflyttningIndex = headers.findIndex(li => li.textContent?.toLowerCase().includes('inflyttning'));
      if (inflyttningIndex >= 0 && dataItems[inflyttningIndex]) {
        data.moveIn = dataItems[inflyttningIndex].textContent || '';
      }
      
      const hyraIndex = headers.findIndex(li => li.textContent?.toLowerCase().includes('hyra'));
      if (hyraIndex >= 0 && dataItems[hyraIndex]) {
        data.rent = dataItems[hyraIndex].textContent || '';
      }
      
      const bodyText = document.body.textContent || '';
      data.bodyText = bodyText;
      
      return data;
    });

    if (pageData.address) {
      const addressMatch = pageData.address.match(/^(.*?)(?:\s*\/\s*)(.*)$/);
      if (addressMatch) {
        apt.address = addressMatch[1].trim();
        apt.aptNr = addressMatch[2].trim();
      } else {
        apt.address = pageData.address.trim();
      }
    }

    if (pageData.type) {
      apt.aptType = pageData.type.trim();
    }

    if (pageData.area) {
      apt.hood = pageData.area.trim();
    }

    if (pageData.rent) {
      const rentStr = pageData.rent.match(/\d+/g)?.join('') || '';
      apt.rent = parseInt(rentStr, 10) || 0;
    }

    const allText = pageData.bodyText || '';

    const sqmMatch = allText.match(/(\d+)\s*m[²2]|(\d+)\s*kvadratmeter/gi);
    if (sqmMatch) {
      const sqmStr = sqmMatch[0].match(/\d+/)?.[0] || '';
      apt.sqm = parseInt(sqmStr, 10) || 0;
    }

    if (pageData.moveIn) {
      const moveInMatch = pageData.moveIn.match(/(\d{4}-\d{2}-\d{2})/);
      if (moveInMatch) {
        apt.moveIn = new Date(moveInMatch[1]);
      }
    }

    const interestMatch = allText.match(/(\d+)\s*\((\d+)\s*st/i);
    if (interestMatch) {
      apt.bestPoints = parseInt(interestMatch[1], 10) || 0;
      apt.bookers = parseInt(interestMatch[2], 10) || 0;
    }

    const availableMatch = allText.match(/till\s+(\d{4}-\d{2}-\d{2})\s+klockan\s+(\d{2}:\d{2})/i);
    if (availableMatch) {
      apt.availableUntil = stockholmTimeToUTC(availableMatch[1], availableMatch[2]);
    }

    return apt;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('closed') || error.message.includes('Target closed') || error.message.includes('Connection closed') || error.message.includes('detached Frame'))) {
      console.warn(`Browser error for ${refId}, retrying...`);
      await page.close().catch(() => {});
      await closeBrowser();
      browser = await getBrowser();
      const newPage = await browser.newPage();
      try {
        const response = await newPage.goto(aptLink, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        if (!response || !response.ok()) {
          throw new Error(`Failed to load apartment page: ${response?.status() || 'unknown status'}`);
        }
        try {
          await newPage.waitForFunction(
            () => {
              const ul = document.querySelector('ul.apt-details-data');
              if (!ul) return false;
              const text = ul.textContent || '';
              return !text.includes('{{') && !text.includes('}}');
            },
            { timeout: 30000 }
          );
        } catch (error) {
          throw new Error('Apt details data not fully rendered on retry (mustache templates still present)');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));

        const apt: Apartment = {
          objNr: '',
          refId: refId,
          hood: '',
          aptType: '',
          address: '',
          aptNr: '',
          availableUntil: null,
          bestPoints: 0,
          bookers: 0,
          infoLink: aptLink,
          moveIn: null,
          rent: 0,
          sqm: 0,
          special: '',
        };

        const pageData = await newPage.evaluate(() => {
          const data: Record<string, string> = {};
          
          const h1 = document.querySelector('h1.apt-title');
          if (h1) data.address = h1.textContent || '';
          
          const typeEl = document.querySelector('p.apt-address');
          if (typeEl) data.type = typeEl.textContent || '';
          
          const areaLink = document.querySelector('.apt-details-data a[href*="sssb.se"]');
          if (areaLink) data.area = areaLink.textContent || '';
          
          const headers = Array.from(document.querySelectorAll('.apt-details-headers li'));
          const dataItems = Array.from(document.querySelectorAll('.apt-details-data li'));
          
          const inflyttningIndex = headers.findIndex(li => li.textContent?.toLowerCase().includes('inflyttning'));
          if (inflyttningIndex >= 0 && dataItems[inflyttningIndex]) {
            data.moveIn = dataItems[inflyttningIndex].textContent || '';
          }
          
          const hyraIndex = headers.findIndex(li => li.textContent?.toLowerCase().includes('hyra'));
          if (hyraIndex >= 0 && dataItems[hyraIndex]) {
            data.rent = dataItems[hyraIndex].textContent || '';
          }
          
          const bodyText = document.body.textContent || '';
          data.bodyText = bodyText;
          
          return data;
        });

        if (pageData.address) {
          const addressMatch = pageData.address.match(/^(.*?)(?:\s*\/\s*)(.*)$/);
          if (addressMatch) {
            apt.address = addressMatch[1].trim();
            apt.aptNr = addressMatch[2].trim();
          } else {
            apt.address = pageData.address.trim();
          }
        }

        if (pageData.type) {
          apt.aptType = pageData.type.trim();
        }

        if (pageData.area) {
          apt.hood = pageData.area.trim();
        }

        if (pageData.rent) {
          const rentStr = pageData.rent.match(/\d+/g)?.join('') || '';
          apt.rent = parseInt(rentStr, 10) || 0;
        }

        const allText = pageData.bodyText || '';

        const sqmMatch = allText.match(/(\d+)\s*m[²2]|(\d+)\s*kvadratmeter/gi);
        if (sqmMatch) {
          const sqmStr = sqmMatch[0].match(/\d+/)?.[0] || '';
          apt.sqm = parseInt(sqmStr, 10) || 0;
        }

        if (pageData.moveIn) {
          const moveInMatch = pageData.moveIn.match(/(\d{4}-\d{2}-\d{2})/);
          if (moveInMatch) {
            apt.moveIn = new Date(moveInMatch[1]);
          }
        }

        const interestMatch = allText.match(/(\d+)\s*\((\d+)\s*st/i);
        if (interestMatch) {
          apt.bestPoints = parseInt(interestMatch[1], 10) || 0;
          apt.bookers = parseInt(interestMatch[2], 10) || 0;
        }

        const availableMatch = allText.match(/till\s+(\d{4}-\d{2}-\d{2})\s+klockan\s+(\d{2}:\d{2})/i);
        if (availableMatch) {
          apt.availableUntil = stockholmTimeToUTC(availableMatch[1], availableMatch[2]);
        }

        await newPage.close();
        return apt;
      } catch (retryError) {
        await newPage.close().catch(() => {});
        throw retryError;
      }
    } else {
      throw error;
    }
  } finally {
    await page.close().catch(() => {});
  }
}

export async function scrapeAllApartments(offset?: number, limit?: number): Promise<Apartment[]> {
  try {
    console.log('Scraping apartment list...');
    const refIds = await getApartmentList();
    console.log(`Found ${refIds.length} apartments`);

    const start = offset ?? 0;
    const end = limit !== undefined ? start + limit : undefined;
    const refIdsToScrape = refIds.slice(start, end);

    const apartments: Apartment[] = [];
    const batchSize = 1;

    for (let i = 0; i < refIdsToScrape.length; i += batchSize) {
      const batch = refIdsToScrape.slice(i, i + batchSize);
      const scrapingPromises = batch.map(async (refId) => {
        console.log(`Scraping apartment ${refId}...`);
        try {
          const apt = await getApartment(refId);
          return { success: true, apt, refId };
        } catch (error) {
          console.error(`Error scraping apartment ${refId}:`, error);
          return { success: false, error, refId };
        }
      });

      const results = await Promise.allSettled(scrapingPromises);
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success && result.value.apt) {
          apartments.push(result.value.apt);
        }
      }
    }

    return apartments;
  } finally {
    await closeBrowser();
  }
}
