import { NextRequest, NextResponse } from 'next/server'

// Extend timeout for this route (2 minutes)
export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward request to Python backend with extended timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
    
    const response = await fetch('http://127.0.0.1:8000/analyze-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: errorText || 'Backend error' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Proxy error:', error)
    }
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout - analysis took too long' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
