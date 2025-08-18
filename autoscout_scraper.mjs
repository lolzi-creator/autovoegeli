// autoscout_scraper.mjs
import fs from "node:fs/promises";
import path from "node:path";

// -------------------- CONFIG --------------------
const BASE_URL = "https://www.autoscout24.ch/de/hci/v2/1124/search";
const START_PAGE = 0;
const MAX_PAGES = 50;          // safety cap: change as needed
const REQUEST_DELAY_MS = 1200; // be nice; adjust if needed
const OUT_DIR = "./autoscout_out";
const CSV_FILE = path.join(OUT_DIR, "autoscout_listings.csv");

// If you need to add filters, append query params here:
const EXTRA_PARAMS = {
  // examples:
  // "sort": "price_asc",
  // "make": "yamaha",
};

// -------------------- HELPERS --------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toQuery(params) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) usp.set(k, String(v));
  }
  return usp.toString();
}

function sanitize(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === "string") return val.replace(/\s+/g, " ").trim();
  return String(val);
}

function csvLine(fields) {
  return fields
    .map((f) => {
      const s = sanitize(f);
      // basic CSV escaping
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(",");
}

async function ensureOutDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function appendCsvHeaderIfMissing(headers) {
  try {
    await fs.access(CSV_FILE);
    // exists: do nothing
  } catch {
    await fs.writeFile(CSV_FILE, csvLine(headers) + "\n", "utf8");
  }
}

// Try to flatten each listing into consistent columns.
// Adjust mappings as you inspect the raw JSON files we save per page.
function flattenListing(item) {
  // These property names are *guesses* based on typical marketplace schemas.
  // After the first run, open the saved `raw_page_*.json` to adjust.
  const id =
    item?.id ??
    item?.listingId ??
    item?.uuid ??
    item?.vehicleId ??
    item?.hashKey;

  const title =
    item?.title ??
    [item?.make, item?.model, item?.variant].filter(Boolean).join(" ");

  const make = item?.make ?? item?.vehicle?.make;
  const model = item?.model ?? item?.vehicle?.model;
  const price =
    item?.price?.amount ??
    item?.price?.value ??
    item?.price ??
    item?.pricing?.price;

  const currency =
    item?.price?.currency ?? item?.pricing?.currency ?? "CHF";

  const mileage =
    item?.mileage ??
    item?.kilometers ??
    item?.specs?.mileage ??
    item?.vehicle?.mileage;

  const firstRegistration =
    item?.firstRegistration ??
    item?.registrationDate ??
    item?.vehicle?.firstRegistration;

  const fuel =
    item?.fuelType ?? item?.vehicle?.fuel ?? item?.specs?.fuelType;

  const powerHp =
    item?.powerHp ??
    item?.power?.hp ??
    item?.enginePower?.hp ??
    item?.specs?.powerHp;

  const location =
    item?.location ??
    item?.seller?.location ??
    item?.dealer?.location ??
    item?.seller?.city;

  const url =
    item?.url ??
    item?.detailPageUrl ??
    item?.links?.detail ??
    item?.deeplink;

  return {
    id,
    title,
    make,
    model,
    price,
    currency,
    mileage,
    firstRegistration,
    fuel,
    powerHp,
    location,
    url,
  };
}

async function fetchPage(page) {
  const qs = toQuery({ page, ...EXTRA_PARAMS });
  const url = `${BASE_URL}?${qs}`;

  const res = await fetch(url, {
    headers: {
      // Minimal headers to look like a real browser.
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Referer": "https://www.autoscout24.ch/",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on page ${page}`);
  }

  // The endpoint should return JSON.
  const data = await res.json();
  return data;
}

function extractItemsFromResponse(json) {
  // Try common patterns: array at root, or under "items"/"results"/"listings"
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.items)) return json.items;
  if (Array.isArray(json?.results)) return json.results;
  if (Array.isArray(json?.listings)) return json.listings;
  // fallback: try to find first large array
  for (const v of Object.values(json || {})) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      return v;
    }
  }
  return [];
}

// -------------------- MAIN --------------------
async function main() {
  await ensureOutDir();

  const headers = [
    "id",
    "title",
    "make",
    "model",
    "price",
    "currency",
    "mileage",
    "firstRegistration",
    "fuel",
    "powerHp",
    "location",
    "url",
  ];
  await appendCsvHeaderIfMissing(headers);

  let totalCount = 0;

  for (let page = START_PAGE; page < START_PAGE + MAX_PAGES; page++) {
    console.log(`Fetching page ${page}…`);
    let json;
    try {
      json = await fetchPage(page);
    } catch (err) {
      console.error(`Failed on page ${page}:`, err.message);
      break; // stop on hard error (you can choose to continue instead)
    }

    // Save raw for inspection/tuning
    const rawPath = path.join(OUT_DIR, `raw_page_${page}.json`);
    await fs.writeFile(rawPath, JSON.stringify(json, null, 2), "utf8");

    const items = extractItemsFromResponse(json);
    if (!items.length) {
      console.log(`No items found on page ${page}. Stopping.`);
      break;
    }

    // Flatten + append to CSV
    const rows = items.map(flattenListing);
    const lines = rows.map((r) => csvLine(headers.map((h) => r[h])));
    await fs.appendFile(CSV_FILE, lines.join("\n") + "\n", "utf8");

    totalCount += rows.length;
    console.log(`Page ${page}: saved ${rows.length} items (total ${totalCount}).`);

    // Optional stop if server hints at last page via a flag/totalPages
    const totalPages =
      json?.paging?.totalPages ??
      json?.pagination?.totalPages ??
      json?.totalPages;
    if (Number.isFinite(totalPages) && page + 1 >= totalPages) {
      console.log(`Reached last page (${totalPages - 1}).`);
      break;
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`Done. Saved ~${totalCount} listings to ${CSV_FILE}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});