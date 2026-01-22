'use client'

import { memo } from 'react'
import { Cpu, HelpCircle, Zap, DollarSign, BarChart3, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, ProfileBar, StatCard } from './shared'
import type { MempoolForensics } from './types'

interface MempoolForensicsSectionProps {
  data: MempoolForensics
}

export const MempoolForensicsSection = memo(function MempoolForensicsSection({ data }: MempoolForensicsSectionProps) {
  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <CardTitle>Mempool & Execution Analysis</CardTitle>
          <Tooltip content="Analyzes how transactions are submitted - through retail RPC, priority fees, or MEV infrastructure like Jito.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <CardDescription>How does this wallet submit transactions?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-4">Execution Profile</h4>
            <div className="space-y-3">
              <ProfileBar label="Retail" value={data.profile_percentages.RETAIL} 
                description="Standard RPC submission" color="bg-blue-500" />
              <ProfileBar label="Urgent User" value={data.profile_percentages.URGENT_USER}
                description="Uses priority fees" color="bg-yellow-500" />
              <ProfileBar label="Pro Trader" value={data.profile_percentages.PRO_TRADER}
                description="Optimized execution" color="bg-green-500" />
              <ProfileBar label="MEV Style" value={data.profile_percentages.MEV_STYLE}
                description="Jito bundles / searcher patterns" color="bg-red-500" />
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Aggregate Profile</p>
              <p className="text-lg font-bold">{data.aggregate_profile}</p>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h4 className="text-sm font-medium mb-4">Execution Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                label="Avg Priority Fee" 
                value={`${data.statistics.avg_priority_fee_microlamports} μL`}
                icon={<Zap className="w-4 h-4" />}
              />
              <StatCard 
                label="Jito Tips (Total)" 
                value={`${data.statistics.total_jito_tips_sol.toFixed(4)} SOL`}
                icon={<DollarSign className="w-4 h-4" />}
              />
              <StatCard 
                label="Jito Tip Count" 
                value={data.statistics.jito_tip_count.toString()}
                icon={<BarChart3 className="w-4 h-4" />}
              />
              <StatCard 
                label="Jito Usage" 
                value={`${data.statistics.jito_tip_percentage}%`}
                icon={<Activity className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
