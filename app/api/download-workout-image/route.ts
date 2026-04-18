import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'oaidalleapiprodscus.blob.core.windows.net',
  'dalleprodsec.blob.core.windows.net',
  'images.unsplash.com',
  'plus.unsplash.com',
]);

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'wellness-visual-guide.png';

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
  }

  if (parsedUrl.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return NextResponse.json({ error: 'Image host is not allowed' }, { status: 400 });
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: { Accept: 'image/*' },
    cache: 'no-store',
  });

  if (!response.ok || !response.body) {
    return NextResponse.json({ error: 'Unable to download image' }, { status: 502 });
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const safeFilename = filename.replace(/[^a-z0-9._-]/gi, '-').slice(0, 80) || 'wellness-visual-guide.png';

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
