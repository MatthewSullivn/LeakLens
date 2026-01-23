'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Copy, Download, Wallet, CheckCircle, Eye, AlertTriangle, 
  Menu, X, Search, FileJson, FileText, Table, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { shortenAddress, formatAddress, cn } from '@/lib/utils'
import { getSeverityColor } from './utils'

// ============================================================================
// TOP NAVIGATION BAR - Desktop & Mobile Responsive
// ============================================================================

interface TopNavBarProps {
  wallet: string
  copied: boolean
  onCopy: () => void
  confidence: string
  riskLevel?: string
}

export const TopNavBar = memo(function TopNavBar({ 
  wallet, 
  copied, 
  onCopy, 
  confidence,
  riskLevel = 'MEDIUM'
}: TopNavBarProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)

  const handleAnalyzeDifferent = useCallback(() => {
    router.push('/')
  }, [router])

  const riskColors = getSeverityColor(riskLevel)

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
                  {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
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
                      <ExportMenuItem icon={<FileText className="w-4 h-4" />} label="PDF Report" status="coming-soon" />
                      <ExportMenuItem icon={<FileJson className="w-4 h-4" />} label="JSON Data" status="coming-soon" />
                      <ExportMenuItem icon={<Table className="w-4 h-4" />} label="CSV Export" status="coming-soon" />
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
                  {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
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
      />
    </>
  )
})

// ============================================================================
// EXPORT MENU ITEM
// ============================================================================

interface ExportMenuItemProps {
  icon: React.ReactNode
  label: string
  status: 'available' | 'coming-soon'
  onClick?: () => void
}

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
// MOBILE BOTTOM SHEET
// ============================================================================

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  wallet: string
  onAnalyzeDifferent: () => void
}

const MobileBottomSheet = memo(function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  wallet,
  onAnalyzeDifferent 
}: MobileBottomSheetProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 md:hidden"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl md:hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-4">
          {/* Handle */}
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
          
          {/* Wallet Info */}
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Analyzing wallet</p>
            <p className="font-mono text-sm break-all">{wallet}</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <BottomSheetAction 
              icon={<Search className="w-5 h-5" />}
              label="Analyze Different Wallet"
              onClick={() => {
                onClose()
                onAnalyzeDifferent()
              }}
              primary
            />
            <BottomSheetAction 
              icon={<Download className="w-5 h-5" />}
              label="Export Report"
              sublabel="Coming soon"
              disabled
            />
            <BottomSheetAction 
              icon={<X className="w-5 h-5" />}
              label="Close"
              onClick={onClose}
            />
          </div>

          {/* Trust Signal */}
          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Read-only analysis • No wallet connection required
          </p>
        </div>
      </div>
    </>
  )
})

// ============================================================================
// BOTTOM SHEET ACTION ITEM
// ============================================================================

interface BottomSheetActionProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
}

const BottomSheetAction = memo(function BottomSheetAction({ 
  icon, 
  label, 
  sublabel,
  onClick, 
  primary,
  disabled 
}: BottomSheetActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
        primary ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
      <div className="flex-1 text-left">
        <p className="font-medium">{label}</p>
        {sublabel && <p className="text-xs opacity-70">{sublabel}</p>}
      </div>
      <ChevronRight className="w-4 h-4 opacity-50" />
    </button>
  )
})

// ============================================================================
// LOADING STATE
// ============================================================================

interface LoadingStateProps {
  wallet: string
}

export const LoadingState = memo(function LoadingState({ wallet }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-border" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
            <Eye className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold">Analyzing Wallet</h2>
          <p className="text-muted-foreground font-mono text-xs sm:text-sm break-all max-w-xs mx-auto">
            {formatAddress(wallet)}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Cross-referencing 50+ data points...</p>
        </div>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// ERROR STATE
// ============================================================================

interface ErrorStateProps {
  error: string
  wallet: string
}

export const ErrorState = memo(function ErrorState({ error, wallet }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="w-14 h-14 sm:w-16 sm:h-16 text-red-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold">Analysis Failed</h2>
          <p className="text-muted-foreground font-mono text-xs sm:text-sm break-all">
            {formatAddress(wallet)}
          </p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    </div>
  )
})
