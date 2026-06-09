// app/ads.txt/route.ts
export const dynamic = 'force-static';

export async function GET() {
  const publisherId = process.env.ADSENSE_PUBLISHER_ID ?? '';

  // AdSense gives you an ID like 'ca-pub-...', but ads.txt expects 'pub-...'
  const cleanId = publisherId.replace(/^ca-/, '');

  // Fallback to your hardcoded ID if the environment variable isn't set
  const content = cleanId
    ? `google.com, ${cleanId}, DIRECT, f08c47fec0942fa0`
    : 'google.com, pub-9233973597909198, DIRECT, f08c47fec0942fa0';

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}