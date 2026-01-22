'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { Network, HelpCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn, shortenAddress } from '@/lib/utils'
import { Tooltip, CollapsibleSection, SolscanLink, WhyItMatters } from './shared'
import type { EgoNetwork } from './types'

interface EgoNetworkSectionProps {
  data: EgoNetwork
}

export const EgoNetworkSection = memo(function EgoNetworkSection({ data }: EgoNetworkSectionProps) {
  const [showAllLinks, setShowAllLinks] = useState(false)
  const toggleShowAllLinks = useCallback(() => setShowAllLinks(prev => !prev), [])

  // Precompute edge positions for better performance
  // Limit nodes on display for performance, show fewer on mobile via CSS
  const edgeData = useMemo(() => {
    return data.edges.slice(0, 10).map((edge, i) => {
      const targetNode = data.nodes.find(n => n.id === edge.target)
      if (!targetNode) return null
      const angle = (i / 10) * 2 * Math.PI - Math.PI / 2
      const radius = 100 + (edge.confidence * 30)
      const x = 300 + radius * Math.cos(angle)
      const y = 140 + radius * Math.sin(angle)
      const nodeColor = edge.has_funding ? '#22c55e' : edge.has_cashout ? '#ef4444' : '#868e96'
      return { edge, targetNode, x, y, nodeColor, angle, radius }
    }).filter(Boolean)
  }, [data.edges, data.nodes])

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <CardTitle>Ego Network</CardTitle>
            <Tooltip content="These are probabilistic links based on on-chain patterns, not confirmed identities. Similar methods are used by surveillance firms to cluster wallets.">
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </Tooltip>
          </div>
          <Badge variant="outline">{data.total_links} links</Badge>
        </div>
        <CardDescription>Who is this wallet linked to?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Visualization - Responsive */}
        <div className="relative h-56 sm:h-72 bg-muted/20 rounded-lg overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
            {/* Edges */}
            {edgeData.map((item, i) => {
              if (!item) return null
              return (
                <line key={i} x1="300" y1="140" x2={item.x} y2={item.y}
                  stroke={`rgba(59, 130, 246, ${item.edge.confidence})`}
                  strokeWidth={Math.max(1, item.edge.weight * 2)}
                  strokeDasharray={item.edge.has_funding ? "none" : "4,4"}
                />
              )
            })}
            {/* Center node */}
            <circle cx="300" cy="140" r="20" fill="oklch(0.75 0.15 175)" />
            <circle cx="300" cy="140" r="25" fill="none" stroke="oklch(0.75 0.15 175)" strokeWidth="2" opacity="0.3" />
            <text x="300" y="175" textAnchor="middle" fill="white" fontSize="10">Target</text>
            {/* Connected nodes */}
            {edgeData.map((item, i) => {
              if (!item) return null
              return (
                <g key={i} className="cursor-pointer">
                  <a href={`https://solscan.io/account/${item.targetNode.id}`} target="_blank" rel="noopener noreferrer">
                    <circle cx={item.x} cy={item.y} r={8 + item.edge.weight * 4} fill={item.nodeColor} opacity={0.8} />
                    <circle cx={item.x} cy={item.y} r={8 + item.edge.weight * 4 + 2} fill="none" stroke={item.nodeColor} strokeWidth="1" opacity="0" className="hover:opacity-50 transition-opacity" />
                    <text x={item.x} y={item.y + 20} textAnchor="middle" fill="#9ca3af" fontSize="8">
                      {item.targetNode.label}
                    </text>
                  </a>
                </g>
              )
            })}
          </svg>
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="outline" className="text-[10px] gap-1 bg-background/80">
              <div className="w-2 h-2 rounded-full bg-green-500" />Funding
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 bg-background/80">
              <div className="w-2 h-2 rounded-full bg-red-500" />Cashout
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1 bg-background/80 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-gray-500" />Other
            </Badge>
          </div>
        </div>

        {/* Risk Highlights */}
        {data.summary.risk_highlights.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.summary.risk_highlights.map((highlight, i) => (
              <Badge key={i} variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                <AlertTriangle className="w-3 h-3 mr-1" />{highlight}
              </Badge>
            ))}
          </div>
        )}

        {/* Strongest Links - Clickable */}
        <div>
          <h4 className="text-sm font-medium mb-3">Strongest Links</h4>
          <div className="space-y-2">
            {data.summary.strongest_links.slice(0, showAllLinks ? undefined : 5).map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/30 rounded-lg gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full shrink-0",
                    link.confidence >= 0.8 ? "bg-red-500" : link.confidence >= 0.5 ? "bg-yellow-500" : "bg-green-500"
                  )} />
                  <div className="min-w-0">
                    <SolscanLink address={link.address} className="font-mono text-sm">
                      {shortenAddress(link.address, 6)}
                    </SolscanLink>
                    <p className="text-xs text-muted-foreground truncate">{link.reasons}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-5 sm:ml-0">
                  <p className="text-sm font-medium">Score: {link.score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">{(link.confidence * 100).toFixed(0)}% confidence</p>
                </div>
              </div>
            ))}
          </div>
          {data.summary.strongest_links.length > 5 && (
            <Button variant="ghost" size="sm" className="w-full mt-2" onClick={toggleShowAllLinks}>
              {showAllLinks ? 'Show Less' : `Show All (${data.summary.strongest_links.length})`}
            </Button>
          )}
        </div>

        {/* Repeated Counterparties - Collapsed by default */}
        <CollapsibleSection 
          title="Repeated Counterparties" 
          description={`${data.summary.repeated_counterparties.length} wallets with multiple interactions`}
          whyItMatters="Repeated counterparties increase the likelihood of wallet clustering by surveillance systems."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.summary.repeated_counterparties.map((cp, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                <SolscanLink address={cp.address} className="font-mono text-xs truncate">
                  {shortenAddress(cp.address, 6)}
                </SolscanLink>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-muted-foreground">{cp.interactions}x</span>
                  <Badge variant="outline" className="text-[10px]">{(cp.confidence * 100).toFixed(0)}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <div className="p-3 bg-muted/20 rounded text-xs text-muted-foreground">
          <Info className="w-3 h-3 inline mr-1" />
          {data.note}
        </div>

        <WhyItMatters>
          Graph analysis links wallets through shared behaviors, timing patterns, and fund flows.
          These heuristic connections are how surveillance firms build identity clusters.
        </WhyItMatters>
      </CardContent>
    </Card>
  )
})
