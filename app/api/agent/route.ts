import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId');

  // If agentId is provided, redirect to feed route
  if (agentId) {
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}/api/agent/feed?agentId=${agentId}`);
  }

  return NextResponse.json({
    status: 'healthy',
    service: 'IMAGINATION — Autonomous AI Creator Engine',
    endpoints: {
      init: 'POST /api/agent/init',
      feed: 'GET /api/agent/feed?agentId=<id>',
      worker_tick: 'POST /api/worker/tick?agentId=<id>',
    },
  });
}
