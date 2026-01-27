'use client'

import { memo } from 'react'
import { ExternalLink, Search, AlertTriangle, Link2, Globe, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ARKHAM_BASE = 'https://intel.arkm.com/explorer/address'
const X_SEARCH_BASE = 'https://x.com/search'
const SOLSCAN_BASE = 'https://solscan.io/account'

interface SearchWalletElsewhereProps {
  wallet: string
}

export const SearchWalletElsewhere = memo(function SearchWalletElsewhere({
  wallet,
}: SearchWalletElsewhereProps) {
  const arkhamUrl = `${ARKHAM_BASE}/${wallet}`
  const xSearchUrl = `${X_SEARCH_BASE}?q=${encodeURIComponent(wallet)}`
  const solscanUrl = `${SOLSCAN_BASE}/${wallet}`

  return (
    <Card className="border-border/40 bg-card overflow-hidden relative h-full flex flex-col">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, oklch(0.75 0.15 195 / 0.5), transparent)',
        }}
      />
      <CardContent className="py-6 px-6 flex-1 flex flex-col">
        <div className="space-y-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Identity Leakage: Look Up Address on External Platforms</h3>
          </div>

          {/* Platform Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={arkhamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg',
                'border border-border/60 bg-muted/20',
                'hover:border-primary/40 hover:bg-primary/5 transition-colors',
                'font-medium text-sm'
              )}
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Search on Arkham
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <a
              href={xSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg',
                'border border-border/60 bg-muted/20',
                'hover:border-primary/40 hover:bg-primary/5 transition-colors',
                'font-medium text-sm'
              )}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Search on X
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center justify-between gap-2 px-4 py-3 rounded-lg',
                'border border-border/60 bg-muted/20',
                'hover:border-primary/40 hover:bg-primary/5 transition-colors',
                'font-medium text-sm sm:col-span-2'
              )}
            >
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                View on Solscan
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>

          {/* Main Description */}
          <div className="rounded-lg bg-muted/20 border border-border/40 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platforms like <span className="text-foreground font-medium">Arkham</span> label
              wallets and link them to entities (exchanges, funds, known addresses). Searching
              this address on <span className="text-foreground font-medium">X</span> can surface
              posts that mention it—including links from Arkham, blockscanners, or users—which
              may reveal identity links or public discussion about the wallet.
            </p>
          </div>

          {/* Identity Leakage Vectors */}
          <div className="flex-1 flex flex-col">
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-semibold text-orange-400">Common Identity Leakage Vectors</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Public labeling:</span> Surveillance platforms tag wallets with known entity names (exchanges, funds, individuals).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Social media mentions:</span> Public posts linking addresses to identities or discussing wallet activity.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Cross-platform linking:</span> Same address used across multiple services creates permanent identity bridges.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">KYC exposure:</span> Exchange deposits/withdrawals link on-chain addresses to verified identities.
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-3 p-3 rounded-lg bg-muted/10 border border-border/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Note:</span> Once an address is publicly linked to an identity, this connection persists permanently on-chain and across surveillance databases.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
