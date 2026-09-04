import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const FACEBOOK_REFERER = /^https?:\/\/(?:[a-z0-9-]+\.)*facebook\.com\//i

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === '/') {
    return NextResponse.next()
  }

  const referer = request.headers.get('referer') ?? ''

  if (!FACEBOOK_REFERER.test(referer)) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') ?? ''

  // Basic mobile/tablet detection
  const isMobileOrTablet =
    /Mobile|Android|iPhone|iPad|iPod|Tablet/i.test(userAgent)

  if (!isMobileOrTablet) {
    return NextResponse.next()
  }

  const wordpressOrigin = process.env.WORDPRESS_ORIGIN

  if (!wordpressOrigin) {
    console.error('WORDPRESS_ORIGIN environment variable is not configured')
    return NextResponse.next()
  }

  try {
    const redirectUrl = new URL(pathname + search, wordpressOrigin)

    return NextResponse.redirect(redirectUrl, 302)
  } catch (error) {
    console.error('Invalid WORDPRESS_ORIGIN:', wordpressOrigin, error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}
