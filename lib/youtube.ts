// ═══════════════════════════════════════════════════════
// YouTube Utilities — URL parsing, thumbnail, duration
// ═══════════════════════════════════════════════════════

export function extractYouTubeId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  // All common URL patterns
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  ]

  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m?.[1]) return m[1]
  }

  return null
}

export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'hq'
): string {
  const qualityMap = {
    default: 'default.jpg',
    mq: 'mqdefault.jpg',
    hq: 'hqdefault.jpg',
    sd: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg',
  }
  return `https://i.ytimg.com/vi/${videoId}/${qualityMap[quality]}`
}

export function getYouTubeEmbedUrl(
  videoId: string,
  opts: { autoplay?: boolean; startAt?: number } = {}
): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    ...(opts.autoplay ? { autoplay: '1' } : {}),
    ...(opts.startAt ? { start: String(opts.startAt) } : {}),
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

// Parse ISO 8601 duration (PT1H2M3S) → seconds
export function parseISO8601Duration(duration: string): number {
  const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (
    (parseInt(m[1] || '0') * 3600) +
    (parseInt(m[2] || '0') * 60) +
    parseInt(m[3] || '0')
  )
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}