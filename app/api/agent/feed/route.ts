import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId') || 'abc-123';

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('post_id, text, rationale, sources, created_at')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        const posts = data.map((row: any) => ({
          id: row.post_id,
          createdAt: row.created_at,
          text: row.text,
          rationale: row.rationale,
          sources: Array.isArray(row.sources) ? row.sources : [],
        }));
        return NextResponse.json({ posts }, { status: 200 });
      }
    }

    return NextResponse.json({ posts: [] }, { status: 200 });
  } catch (error: any) {
    console.error('Vercel feed fetch error:', error);
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}
