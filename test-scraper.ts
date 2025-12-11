import { getApartmentList, closeBrowser } from './lib/scraper';

async function test() {
  try {
    console.log('Fetching apartment list...');
    const refIds = await getApartmentList();
    console.log(`Found ${refIds.length} apartments`);
    console.log('RefIds:', refIds);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await closeBrowser();
    process.exit(0);
  }
}

test();

