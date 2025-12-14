# SSSB++ 

## What's this? 
A work in progress Next.js app for scraping queue time data from *SSSB*, Stockholm's largest student accommodation service. 🏢

Built as a hobby project and learning experience. Originally to familiarise myself with Golang and Golang ORM libraries + Postgres. However, the new version is written in Next.js + TypeScript to work towards a monorepo SSSB analytics dashboard.

## Background
Finding student accommodation in Stockholm is challenging. Those who secure a first-hand lease typically do so through *SSSB*, the Stockholm Student Unions' Central Organization student housing service, after spending a year or two in their queueing system.

Once you start studying and join a student union, you can begin collecting queue points. You can apply from a list of available housing units whenever you wish, and more queue points generally give you access to better accommodation options (the applicant with the most queue points is offered the flat).

This project was created to collect data from the SSSB website to gain deeper insight into these factors and better understand the dynamics of the queueing system (seasonal fluctuations, trends, etc.).

## How it works
Currently, only the scraping trigger API is up and working.
The API provides endpoints to scrape SSSB apartment listings and their details regarding queue times. You can trigger full scrapes of all apartments or scrape individual apartments by their reference ID.

The scraper uses Puppeteer and chromium-min to handle the JavaScript-rendered content on the SSSB website. It scrapes from:
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

### Environment Variables

Create a `.env.local` file in the root directory with your API key and database URL:

```bash
API_KEY=your-secret-api-key-here
DATABASE_URL=postgresql://user:password@host:port/database
```

All API endpoints require authentication via the `X-API-Key` header or `Authorization: Bearer <key>` header.

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Database Setup

After setting up your `DATABASE_URL` in `.env.local`, push your schema to the database:

```bash
pnpm db:push
```

This will create the tables directly from your schema. For production, you can generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Or use Drizzle Studio to view your database:
```bash
pnpm db:studio
```


### Build

```bash
pnpm build
pnpm start
```

## API Endpoints

All endpoints require API key authentication. Include your API key in the request headers:

- `X-API-Key: your-api-key` or
- `Authorization: Bearer your-api-key`

### GET `/api/scrape/list`
Returns a list of all available apartment reference IDs (refIds) without scraping full details. This is faster than the full scrape endpoint.

**Headers:**
- `X-API-Key` or `Authorization: Bearer <key>`

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

**Headers:**
- `X-API-Key` or `Authorization: Bearer <key>`

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

**Headers:**
- `X-API-Key` or `Authorization: Bearer <key>`

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

## Database

The application uses Drizzle ORM with PostgreSQL (via Supabase) to store scraped apartment data. The database includes:

- **apartments**: Current state of each apartment (upserted on each scrape)
- **scrapes**: Historical tracking of queue points and bookers over time

All scrape endpoints automatically save data to the database.

## Ideas on further development
- Setting up scheduled scraping via Vercel Cron Jobs or external cron services
- Building a frontend to browse and visualize the scraped data
- Building analytics and insights into queue point trends
