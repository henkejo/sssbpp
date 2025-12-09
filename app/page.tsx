export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">SSSB++</h1>
        <p className="text-lg text-gray-600 mb-8">
          API endpoints for scraping SSSB apartment queue data
        </p>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">API Endpoints:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/scrape/full</code> - Full scrape of all apartments</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/scrape/apartment/[refId]</code> - Scrape single apartment</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

