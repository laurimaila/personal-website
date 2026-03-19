import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Revalidation endpoint for testing and manual cache clearing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const token = searchParams.get('token');
  const type = searchParams.get('type') as 'page' | 'layout' | undefined;

  const revalidateToken = process.env.REVALIDATE_TOKEN;

  if (!revalidateToken || token !== revalidateToken) {
    return NextResponse.json({ message: 'Invalid revalidation token' }, { status: 401 });
  }

  // GET /api/revalidate?token=<...>&path=/&type=layout to purge whole cache
  if (path) {
    revalidatePath(path, type);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  }

  return NextResponse.json({
    revalidated: false,
    message: 'No path provided for revalidation',
  });
}
