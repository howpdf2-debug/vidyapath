import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { XMLParser } from 'fast-xml-parser'
import { isAuthorizedCronRequest } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Feed configuration.
 * Har feed ke multiple fallback URLs hain — agar primary fail ho to next try karega.
 */
type FeedConfig = {
  lang: 'en' | 'hi'
  source: string
  urls: string[]
}

const RSS_FEEDS: FeedConfig[] = [
  // ==================== ENGLISH FEEDS ====================
  {
    lang: 'en',
    source: 'official-en',
    urls: [
      'https://www.employmentnews.gov.in/emp/rss_news.aspx',
      'https://employmentnews.gov.in/emp/rss_news.aspx',
    ],
  },
  {
    lang: 'en',
    source: 'freejobalert-en',
    urls: ['https://www.freejobalert.com/feed/'],
  },
  {
    lang: 'en',
    source: 'jagranjosh-en',
    urls: [
      'https://www.jagranjosh.com/rss/jobs.xml',
      'https://www.jagranjosh.com/rss/latest-news.xml',
    ],
  },
  {
    lang: 'en',
    source: 'sarkariresult-en',
    urls: [
      'https://www.sarkariresult.com/feed/',
      'https://feeds.feedburner.com/sarkariresult',
    ],
  },

  // ==================== HINDI FEEDS ====================
{
  lang: 'hi',
  source: 'official-hi',
  urls: [
    'https://www.employmentnews.gov.in/emp/rss_news_hindi.aspx',
    'https://employmentnews.gov.in/emp/rss_news_hindi.aspx',
  ],
},
{
  lang: 'hi',
  source: 'sarkarinaukri-hi',
  urls: [
    'https://www.sarkarinaukriblog.com/feeds/posts/default', // डायरेक्ट फ़ीड का उपयोग करें
    'https://feeds.feedburner.com/SarkariNaukriBlog',
  ],
},
{
  lang: 'hi',
  source: 'jagranjosh-hi',
  urls: [
    'https://www.jagranjosh.com/rss/hindi-jobs.xml',
    'https://www.jagranjosh.com/rss/hindi-latest-news.xml',
  ],
},
{
  lang: 'hi',
  source: 'rojgarresult-hi',
  urls: [
    'https://www.rojgarresult.com/feed/',
    'https://rojgarresult.com/feed/',
  ],
},
{
  lang: 'hi',
  source: 'sarkariresult-hi',
  urls: [
    'https://www.sarkariresult.com/feed/',
    'https://www.sarkariresult.com/rss.xml',
  ],
},
{
  lang: 'hi',
  source: 'hindi-jobs-hi',
  urls: [
    'https://www.hindijobs.in/feed/',
    'https://www.rojgarsamachar.in/feed/',
  ],
},
]

// Realistic browser headers — government aur private sites bots block karti hain
const BROWSER_HEADERS: HeadersInit = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept:
    'application/rss+xml, application/xml, text/xml, application/atom+xml, */*;q=0.1',
  'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
}

/**
 * Fetch with timeout using AbortController.
 */
async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      cache: 'no-store',
    })
  } finally {
    clearTimeout(timer)
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * ✅ FIX: Strip DOCTYPE + entity declarations before parsing.
 * fast-xml-parser ki XXE protection (entityExpansionLimit: 1000) ko
 * bypass karta hai — safe hai kyunki hum sirf RSS data parse kar rahe hain,
 * koi executable entity nahi chahiye.
 */
function sanitizeXml(xml: string): string {
  return (
    xml
      // Remove DOCTYPE declaration (with optional internal subset)
      .replace(/<!DOCTYPE[^>]*(\[[\s\S]*?\])?[^>]*>/gi, '')
      // Remove standalone ENTITY declarations
      .replace(/<!ENTITY[^>]*>/gi, '')
      // Decode common HTML entities so parser ko expand karne ki zaroorat na pade
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, code) =>
        String.fromCharCode(parseInt(code, 10))
      )
      .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      )
  )
}

/**
 * Text sanitizer — trims, strips HTML tags, decodes entities.
 */
function cleanText(input: unknown): string {
  if (input === null || input === undefined) return ''
  const raw = typeof input === 'string' ? input : String(input)
  return (
    raw
      // strip CDATA wrappers if any
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      // strip HTML tags
      .replace(/<[^>]+>/g, ' ')
      // decode basic entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Extract text value from various XML shapes (string, object with #text, etc).
 */
function extractText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return cleanText(node)
  if (typeof node === 'number') return String(node)
  if (typeof node === 'object') {
    if (node['#text']) return cleanText(node['#text'])
    if (node._) return cleanText(node._)
  }
  return ''
}

/**
 * Extract link from RSS/Atom item.
 */
function extractLink(item: any): string {
  if (!item) return ''
  if (typeof item.link === 'string') return item.link.trim()
  if (Array.isArray(item.link)) {
    for (const l of item.link) {
      if (typeof l === 'string') return l.trim()
      if (l?.['@_href']) return String(l['@_href']).trim()
    }
  }
  if (item.link?.['@_href']) return String(item.link['@_href']).trim()
  if (item.guid?.['#text']) return String(item.guid['#text']).trim()
  if (typeof item.guid === 'string') return item.guid.trim()
  if (item.id) return String(item.id).trim()
  return ''
}

/**
 * Try every URL in list with 2 attempts each.
 * Returns first successful XML response, or null if all fail.
 */
async function fetchFeedWithFallback(
  urls: string[],
  label: string
): Promise<string | null> {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[RSS] Trying ${label} → ${url} (attempt ${attempt})`)
        const res = await fetchWithTimeout(url, 8000)

        if (res.ok) {
          const xml = await res.text()
          if (xml && xml.length > 100 && xml.includes('<')) {
            console.log(`[RSS] ✅ ${label} success from ${url}`)
            return xml
          }
          console.warn(`[RSS] ${label} → invalid XML body from ${url}`)
        } else {
          console.warn(
            `[RSS] ${label} → HTTP ${res.status} from ${url} (attempt ${attempt})`
          )
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          console.warn(
            `[RSS] ${label} → TIMEOUT on ${url} (attempt ${attempt})`
          )
        } else {
          console.warn(
            `[RSS] ${label} → ${err?.message || err} on ${url} (attempt ${attempt})`
          )
        }
      }

      if (attempt < 2) await sleep(1500)
    }
  }
  console.error(`[RSS] ❌ ${label} → all URLs failed`)
  return null
}

export async function GET(request: NextRequest) {
  // ✅ SECURITY FIX: public RSS trigger band — sirf cron se chalega
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    trimValues: true,
    parseTagValue: true,
    processEntities: false, // ✅ FIX: entity processing off
    htmlEntities: true, // ✅ FIX: HTML entities auto-handle
  })

  let insertedCount = 0
  let skippedCount = 0
  let errorCount = 0
  const errors: string[] = []
  const stats: Record<string, number> = {}

  for (const feed of RSS_FEEDS) {
    const label = feed.source
    const xml = await fetchFeedWithFallback(feed.urls, label)

    if (!xml) {
      errorCount++
      errors.push(`${label}: all feed URLs failed`)
      continue
    }

    try {
      // ✅ FIX: sanitize before parsing
      const cleanXml = sanitizeXml(xml)
      const parsed = parser.parse(cleanXml)

      // Support RSS 2.0, Atom, RDF
      const rawItems =
        parsed?.rss?.channel?.item ||
        parsed?.feed?.entry ||
        parsed?.['rdf:RDF']?.item ||
        []

      const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems]

      let feedInserted = 0

      for (const item of itemArray) {
        if (!item) continue

        const title = extractText(item.title)
        const description =
          extractText(item.description) ||
          extractText(item.summary) ||
          extractText(item['content:encoded']) ||
          ''
        const link = extractLink(item)

        // Parse published date
        let pubDate = new Date().toISOString().split('T')[0]
        const rawPub =
          item.pubDate ||
          item.published ||
          item.updated ||
          item['dc:date'] ||
          item.date

        if (rawPub) {
          try {
            const d = new Date(String(rawPub))
            if (!isNaN(d.getTime())) {
              pubDate = d.toISOString().split('T')[0]
            }
          } catch {
            // keep default
          }
        }

        if (title.length < 5) continue

        // Truncate long title/description to fit DB
        const safeTitle = title.slice(0, 500)
        const safeDescription = description.slice(0, 2000)
        const safeLink = link.slice(0, 1000)

        // Duplicate check
        const { data: existing } = await supabaseAdmin
          .from('rojgar_samachar')
          .select('id')
          .eq('title', safeTitle)
          .eq('language', feed.lang)
          .maybeSingle()

        if (existing) {
          skippedCount++
          continue
        }

        const { error } = await supabaseAdmin.from('rojgar_samachar').insert({
          title: safeTitle,
          description: safeDescription,
          pdf_url: safeLink,
          published_date: pubDate,
          language: feed.lang,
        })

        if (error) {
          console.error(`Insert error (${label}):`, error.message)
          errors.push(`Insert error (${label}): ${error.message}`)
          errorCount++
        } else {
          insertedCount++
          feedInserted++
        }
      }

      stats[label] = feedInserted
      console.log(`[RSS] ${label}: inserted ${feedInserted} items`)
    } catch (parseErr: any) {
      console.error(`Parse error (${label}):`, parseErr)
      errors.push(`Parse error (${label}): ${parseErr.message}`)
      errorCount++
    }
  }

  return NextResponse.json(
    {
      success: insertedCount > 0,
      inserted: insertedCount,
      skipped: skippedCount,
      errorCount,
      errors,
      stats,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}