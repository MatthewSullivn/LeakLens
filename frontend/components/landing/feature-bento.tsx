'use client'

import { cn } from '@/lib/utils'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import { Meteors } from '@/components/ui/meteors'
import { WalletNetwork } from '@/components/learn/diagrams'
import { LeakChain } from './diagrams'
import { Fingerprint } from 'lucide-react'

function BentoHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex flex-1 w-full h-full min-h-[6rem] rounded-xl overflow-hidden',
        'flex items-center justify-center p-6',
        className
      )}
    >
      <Meteors number={12} />
      <div className="relative z-10 w-full h-full flex items-center justify-center min-w-0 min-h-0">
        {children}
      </div>
    </div>
  )
}

const items = [
  {
    title: 'Your wallet is not alone',
    body: "Your transactions don't exist in isolation. Funding sources, repeated counterparties, and shared behavior allow wallets to be grouped together, even if you never interact directly.",
    subline: 'Clusters form faster than most users realize.',
    header: (
      <BentoHeader>
        <WalletNetwork nodeCount={6} compact className="w-full max-w-[180px]" />
      </BentoHeader>
    ),
    className: 'md:col-span-2',
  },
  {
    title: 'When you transact matters',
    body: 'Transaction timestamps expose routines, timezones, and inactivity windows. Over time, simple timing patterns can narrow down where and how a wallet is operated.',
    subline: "Privacy loss doesn't require amounts; timing is enough.",
    header: (
      <BentoHeader>
        <div className="flex items-center gap-1">
          {[2, 5, 8, 12, 15, 18, 22].map((h, i) => (
            <div
              key={i}
              className="w-2 rounded-sm bg-[var(--color-cyan-600)]"
              style={{
                height: `${20 + (h % 5) * 12}px`,
                opacity: 0.4 + (h % 4) * 0.15,
              }}
            />
          ))}
        </div>
      </BentoHeader>
    ),
    className: 'md:col-span-1',
  },
  {
    title: 'Behavior creates a fingerprint',
    body: 'Reaction speed, execution consistency, and transaction structure reveal whether a wallet is human, automated, or professionally operated.',
    subline: 'Bots and humans leave very different traces.',
    header: (
      <BentoHeader>
        <Fingerprint className="w-14 h-14 text-[var(--color-cyan-600)]/40" strokeWidth={1.2} />
      </BentoHeader>
    ),
    className: 'md:col-span-1',
  },
  {
    title: 'One transaction can last forever',
    body: 'A single interaction with the wrong wallet, protocol, or bridge can permanently link your address to known entities or clusters.',
    subline: "Blockchains don't forget.",
    header: (
      <BentoHeader>
        <LeakChain />
      </BentoHeader>
    ),
    className: 'md:col-span-2',
  },
]

export function FeatureBento() {
  return (
    <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-center text-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        What can your wallet reveal?
      </h1>
      <div className="flex items-center justify-center mb-12">
        <span className="block h-px w-12 bg-cyan-600/40 mr-3" />
        <span className="text-base sm:text-lg text-muted-foreground font-medium">
          Why on-chain activity gives away more than you realize.
        </span>
        <span className="block h-px w-12 bg-cyan-500/40 ml-3" />
      </div>
      <BentoGrid className="max-w-5xl mx-auto md:auto-rows-[22rem] gap-4">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={
              <>
                <p className="mb-3 text-base">{item.body}</p>
                <p className="text-sm opacity-80">{item.subline}</p>
              </>
            }
            header={item.header}
            className={item.className}
          />
        ))}
      </BentoGrid>
    </section>
  )
}
