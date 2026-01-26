'use client'

import { LeakLensNavbar } from '@/components/ui/resizable-navbar'
import { Footer } from '@/components/footer'
import { ReduceExposure } from '@/components/landing/reduce-exposure'
import { cn } from '@/lib/utils'

export default function LearnPage() {
  return (
    <div className={cn('min-h-screen bg-background')}>
      <LeakLensNavbar />
      <main className="pt-24 pb-12">
        <ReduceExposure />
      </main>
      <Footer />
    </div>
  )
}
