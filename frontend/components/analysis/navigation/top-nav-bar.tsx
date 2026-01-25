'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Copy, Download, Wallet, CheckCircle, 
  Menu, Search, FileJson, FileText, Table
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatAddress, cn } from '@/lib/utils'
import { getSeverityColor } from '../utils'
import { exportJSON, exportCSV, exportPDF } from '@/lib/export'
import { MobileBottomSheet } from './mobile-menu'
import type { AnalysisResult } from '../types'

// ============================================================================
// TYPES
// ============================================================================

interface TopNavBarProps {
  wallet: string
  copied: boolean
  onCopy: () => void
  confidence: string
  riskLevel?: string
  data?: AnalysisResult | null
}

interface ExportMenuItemProps {
  icon: React.ReactNode
  label: string
  status: 'available' | 'coming-soon'
  onClick?: () => void
}

// ============================================================================
// EXPORT MENU ITEM
// ============================================================================

const ExportMenuItem = memo(function ExportMenuItem({ icon, label, status, onClick }: ExportMenuItemProps) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left",
        status === 'coming-soon' ? "text-muted-foreground cursor-not-allowed" : "hover:bg-muted/50"
      )}
      onClick={status === 'available' ? onClick : undefined}
      disabled={status === 'coming-soon'}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {status === 'coming-soon' && (
        <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">Soon</span>
      )}
    </button>
  )
})

// ============================================================================
// TOP NAVIGATION BAR
// ============================================================================

export const TopNavBar = memo(function TopNavBar({ 
  wallet, 
  copied, 
  onCopy, 
  confidence,
  riskLevel = 'MEDIUM',
  data = null
}: TopNavBarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const handleAnalyzeDifferent = useCallback(() => {
    router.push('/')
  }, [router])

  const closeExport = useCallback(() => setExportMenuOpen(false), [])

  const handleExportPDF = useCallback(() => {
    if (data) {
      exportPDF(data, wallet)
      closeExport()
    }
  }, [data, wallet, closeExport])

  const handleExportJSON = useCallback(() => {
    if (data) {
      exportJSON(data, wallet)
      closeExport()
    }
  }, [data, wallet, closeExport])

  const handleExportCSV = useCallback(() => {
    if (data) {
      exportCSV(data, wallet)
      closeExport()
    }
  }, [data, wallet, closeExport])

  const riskColors = getSeverityColor(riskLevel)
  const canExport = !!data

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <span className="font-bold text-lg">LeakLens</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border/60">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-sm">{formatAddress(wallet)}</span>
                <button onClick={onCopy} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <CheckCircle className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                SCAN COMPLETE
              </Badge>
              <Badge variant="outline" className="text-xs">
                {confidence} Confidence
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {/* Export Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {exportMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setExportMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                      <ExportMenuItem icon={<FileText className="w-4 h-4" />} label="PDF Report" status={canExport ? 'available' : 'coming-soon'} onClick={handleExportPDF} />
                      <ExportMenuItem icon={<FileJson className="w-4 h-4" />} label="JSON Data" status={canExport ? 'available' : 'coming-soon'} onClick={handleExportJSON} />
                      <ExportMenuItem icon={<Table className="w-4 h-4" />} label="CSV Export" status={canExport ? 'available' : 'coming-soon'} onClick={handleExportCSV} />
                    </div>
                  </>
                )}
              </div>
              <Button 
                size="sm" 
                className="gap-2 bg-primary text-primary-foreground"
                onClick={handleAnalyzeDifferent}
              >
                <Search className="w-4 h-4" />
                Analyze Different Wallet
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-primary" />
              </div>
              <span className="font-bold">LeakLens</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-card border border-border/60">
                <span className="font-mono text-xs">{formatAddress(wallet)}</span>
                <button onClick={onCopy} className="text-muted-foreground">
                  {copied ? <CheckCircle className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <Badge className={cn("text-[10px] px-1.5", riskColors.bg, riskColors.text)}>
                {riskLevel}
              </Badge>
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Sheet */}
      <MobileBottomSheet 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        wallet={wallet}
        onAnalyzeDifferent={handleAnalyzeDifferent}
        onExportPDF={handleExportPDF}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
      />
    </>
  )
})
