import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `http://127.0.0.1:8000/api/${path}${
    searchParams ? `?${searchParams}` : ''
  }`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error) {
    // 127.0.0.1:8000 offline or Vercel serverless environment
  }

  // Fallback to native Vercel serverless route
  const origin = request.nextUrl.origin;
  const vercelUrl = `${origin}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
  try {
    const res = await fetch(vercelUrl, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const targetUrl = `http://127.0.0.1:8000/api/${path}${
    searchParams ? `?${searchParams}` : ''
  }`;

  let bodyStr = '';
  try {
    const text = await request.text();
    if (text) {
      bodyStr = text;
    }
  } catch (e) {
    // Body optional
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyStr || undefined,
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (error) {
    // 127.0.0.1:8000 offline or Vercel serverless environment
  }

  // Fallback to native Vercel serverless route
  const origin = request.nextUrl.origin;
  const vercelUrl = `${origin}/api/${path}${searchParams ? `?${searchParams}` : ''}`;
  try {
    const res = await fetch(vercelUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr || undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
  }
}

