import { NextRequest, NextResponse } from 'next/server';
import { GET as getFeedHandler } from '@/app/api/agent/feed/route';
import { POST as postInitHandler } from '@/app/api/agent/init/route';
import { POST as postTickHandler } from '@/app/api/worker/tick/route';
import { GET as getAgentHandler } from '@/app/api/agent/route';

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

  // Direct Vercel serverless function routing
  if (path === 'agent/feed') {
    return getFeedHandler(request);
  }
  if (path === 'agent') {
    return getAgentHandler(request);
  }

  return NextResponse.json({ posts: [] }, { status: 200 });
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

  // Direct Vercel serverless function routing
  if (path === 'agent/init') {
    return postInitHandler(request);
  }
  if (path === 'worker/tick') {
    return postTickHandler(request);
  }

  return NextResponse.json({ status: 'SUCCESS' }, { status: 200 });
}


