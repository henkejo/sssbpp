# SSSB++ 

## What's this? 
A Next.js API application for scraping data regarding queue times for the largest student accommodation service in Stockholm, *SSSB*. 🏢

Built as a hobby project and learning experience in Next.js, TypeScript, and Netlify.

## Background
Finding an apartment in Stockholm on a student budget is challenging. Students who end up finding a non-sublet apartment usually do it through *SSSB*, after spending a year or two in their queueing system.

Precisely how long you stay in their queue is up to you, since you can apply for an apartment whenever you wish. More days in queue = more queue points = a better apartment.

*Except*, this isn't always the case. The apartment you can get for your queue points depends on a bunch of factors. For instance, some residential areas are more popular. Also, you usually need more points at the start of a semester.

This project was made to harvest data from the SSSB website in order to gain more insight into these factors.

## How it works
The API provides endpoints to scrape SSSB apartment listings and their details regarding queue times. You can trigger full scrapes of all apartments or scrape individual apartments by their reference ID.

The scraper uses Playwright to handle the JavaScript-rendered content on the SSSB website. It scrapes from:
- Listing page: `https://minasidor.sssb.se/lediga-bostader/`
- Individual apartment pages: `https://minasidor.sssb.se/lediga-bostader/lagenhet/?refid=...`

## Setup

### Prerequisites
- Node.js 18+ 
- pnpm (package manager)

### Installation

```bash
git clone <repository-url>
cd sssbpp
pnpm install
```

Note: The `postinstall` script will automatically install Playwright's Chromium browser. This may take a few minutes on first install.

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
pnpm build
pnpm start
```

## API Endpoints

### GET `/api/scrape/list`
Returns a list of all available apartment reference IDs (refIds) without scraping full details. This is faster than the full scrape endpoint.

**Response:**
```json
{
  "success": true,
  "count": 42,
  "refIds": ["refId1", "refId2", ...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### POST `/api/scrape/full`
Scrapes all available apartments from SSSB.

**Response:**
```json
{
  "success": true,
  "count": 42,
  "apartments": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/scrape/apartment/[refId]`
Scrapes a single apartment by its reference ID.

**Response:**
```json
{
  "success": true,
  "apartment": {
    "objNr": "...",
    "refId": "...",
    "hood": "...",
    "aptType": "...",
    "address": "...",
    "aptNr": "...",
    "availableUntil": "...",
    "bestPoints": 1234,
    "bookers": 42,
    "infoLink": "...",
    "moveIn": "...",
    "rent": 5000,
    "sqm": 25,
    "special": ""
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Deployment to Netlify

This project is configured for deployment to Netlify:

1. Connect your repository to Netlify
2. Set the build command: `pnpm build`
3. Set the publish directory: `.next`
4. The `netlify.toml` file is already configured with the Next.js plugin

Netlify will automatically detect the Next.js configuration and deploy accordingly.

## Ideas on further development
- Building a frontend to browse and visualize the scraped data
- Adding database storage for historical data
- Setting up scheduled scraping via Netlify Functions or external cron services
- Building analytics and insights into queue point trends
