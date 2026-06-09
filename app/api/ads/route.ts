// app/api/ads/route.ts
export const dynamic = 'force-static';

export async function GET() {
  const content = 'google.com, pub-9233973597909198, DIRECT, f08c47fec0942fa0';
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}