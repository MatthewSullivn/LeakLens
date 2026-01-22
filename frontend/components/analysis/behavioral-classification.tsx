'use client'

import { memo, useMemo } from 'react'
import { Users, HelpCircle, User, Bot, Building2, Briefcase, Fish, Sprout, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, ClassificationBar, WhyItMatters } from './shared'
import type { TraderClassification, ProfileClassification, ReactionSpeed } from './types'

interface BehavioralClassificationSectionProps {
  trader: TraderClassification
  profile: ProfileClassification
  reactionSpeed: ReactionSpeed
}

export const BehavioralClassificationSection = memo(function BehavioralClassificationSection({ 
  trader, 
  profile, 
  reactionSpeed 
}: BehavioralClassificationSectionProps) {
  const humanConfidence = useMemo(() => 100 - reactionSpeed.bot_confidence, [reactionSpeed.bot_confidence])

  return (
    <Card className="border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <CardTitle>Behavioral & Profile Classification</CardTitle>
          <Tooltip content="These signals classify behavior patterns, not identity. They indicate how this wallet operates compared to known actor types.">
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <CardDescription>What kind of actor does this wallet look like?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trader Classification */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Trader Type</h4>
            <ClassificationBar 
              label="Institutional" 
              value={trader.institutional} 
              icon={<Building2 className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Professional" 
              value={trader.professional} 
              icon={<Briefcase className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Retail" 
              value={trader.retail} 
              icon={<User className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
          </div>

          {/* Profile Classification */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Profile Match</h4>
            <ClassificationBar 
              label="Institutional" 
              value={profile.institutional} 
              icon={<Building2 className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Professional" 
              value={profile.professional} 
              icon={<Briefcase className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Whale" 
              value={profile.whale} 
              icon={<Fish className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Airdrop Farmer" 
              value={profile.airdrop_farmer} 
              icon={<Sprout className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
            <ClassificationBar 
              label="Bot" 
              value={profile.bot} 
              icon={<Cpu className="w-3.5 h-3.5 text-muted-foreground" />} 
            />
          </div>

          {/* Human vs Bot */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Human vs Automated</h4>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Human</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Bot</span>
                  <Bot className="w-5 h-5 text-orange-500" />
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-green-500 to-green-500/60" 
                  style={{ width: `${humanConfidence}%` }} />
              </div>
              <p className="text-center text-sm font-medium mt-2">
                {humanConfidence.toFixed(1)}% Human Confidence
              </p>
            </div>

            {/* Reaction Speed Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{reactionSpeed.avg_reaction_time}s</p>
                <p className="text-[10px] text-muted-foreground">Avg Response</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{reactionSpeed.median_reaction_time}s</p>
                <p className="text-[10px] text-muted-foreground">Median Response</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{reactionSpeed.fastest_reaction}s</p>
                <p className="text-[10px] text-muted-foreground">Fastest</p>
              </div>
              <div className="p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{reactionSpeed.total_pairs}</p>
                <p className="text-[10px] text-muted-foreground">TX Pairs</p>
              </div>
            </div>
          </div>
        </div>

        <WhyItMatters>
          Behavioral fingerprints help surveillance systems classify wallets even without direct identity links.
          Consistent patterns make you easier to track across the network.
        </WhyItMatters>
      </CardContent>
    </Card>
  )
})
