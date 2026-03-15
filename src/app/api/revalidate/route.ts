import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Revalidation endpoint for testing and manual cache clearing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const token = searchParams.get('token');

  const secretToken = process.env.REVALIDATE_TOKEN;

  // Only check if a revalidation token set up in environment
  if (secretToken && token !== secretToken) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path, now: Date.now() });
  }

  return NextResponse.json({
    revalidated: false,
    message: 'Missing path parameter',
  });
}
