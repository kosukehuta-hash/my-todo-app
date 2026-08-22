import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    if (request.nextUrl.pathname === '/maintenance') {
      return NextResponse.next()
    }

    if (request.nextUrl.pathname.startsWith('/_next/')) {
      return NextResponse.next()
    }

    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}