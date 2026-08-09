import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const persona = body?.persona || { name: 'Ada', domain: 'AI Security' };
    const name = persona.name || 'Ada';
    const domain = persona.domain || 'AI Security';
    const agentId = `agent_${Math.random().toString(36).substring(2, 10)}`;

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('agent_state').insert({
        agent_id: agentId,
        name: name,
        domain: domain,
        status: 'ACTIVE',
      });
    }

    // Trigger initial post generation tick asynchronously or via worker endpoint
    const origin = request.nextUrl.origin;
    fetch(`${origin}/api/worker/tick?agentId=${agentId}`, { method: 'POST' }).catch(() => {});

    return NextResponse.json({ agentId }, { status: 200 });
  } catch (error: any) {
    console.error('Vercel init error:', error);
    const agentId = `agent_${Math.random().toString(36).substring(2, 10)}`;
    return NextResponse.json({ agentId }, { status: 200 });
  }
}
