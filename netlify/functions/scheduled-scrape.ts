import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { scrapeAllApartments, closeBrowser } from '../../lib/scraper';
import { saveApartments } from '../../lib/db/helpers';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    console.log('Starting scheduled full scrape...');
    
    const apartments = await scrapeAllApartments();
    
    if (apartments.length > 0) {
      console.log(`Saving ${apartments.length} apartments to database...`);
      await saveApartments(apartments);
      console.log('Successfully saved apartments to database');
    } else {
      console.log('No apartments found to save');
    }
    
    await closeBrowser();
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        count: apartments.length,
        saved: apartments.length > 0,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Scheduled scrape error:', error);
    try {
      await closeBrowser();
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
