'use client'

import { memo, useMemo } from 'react'
import { CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSection } from './shared'
import { formatNumber } from './utils'
import type { TransactionComplexity } from './types'

interface AdvancedDataSectionProps {
  transactionComplexity: TransactionComplexity[]
  notableTransactions: { count: number; transactions: any[] }
}

export const AdvancedDataSection = memo(function AdvancedDataSection({ 
  transactionComplexity, 
  notableTransactions 
}: AdvancedDataSectionProps) {
  const { typeBreakdown, avgCompute } = useMemo(() => {
    const breakdown = transactionComplexity.reduce((acc, tx) => {
      acc[tx.type] = (acc[tx.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avg = transactionComplexity.length > 0
      ? transactionComplexity.reduce((sum, tx) => sum + tx.compute_units, 0) / transactionComplexity.length
      : 0

    return { typeBreakdown: breakdown, avgCompute: avg }
  }, [transactionComplexity])

  return (
    <CollapsibleSection 
      title="Advanced / Raw Data" 
      description="Technical details for transparency"
      badge={<Badge variant="outline" className="text-xs">Debug</Badge>}
    >
      <div className="space-y-6">
        {/* Transaction Complexity */}
        <div>
          <h4 className="text-sm font-medium mb-3">Transaction Complexity ({transactionComplexity.length} transactions)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Avg Compute Units</p>
              <p className="font-semibold">{formatNumber(avgCompute, 0)}</p>
            </div>
            {Object.entries(typeBreakdown).map(([type, count]) => (
              <div key={type} className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">{type}</p>
                <p className="font-semibold">{count} txs</p>
              </div>
            ))}
          </div>

          {/* Hourly breakdown */}
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b border-border/40">
                  <th className="text-left p-2">Hour (UTC)</th>
                  <th className="text-left p-2">Compute Units</th>
                  <th className="text-left p-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactionComplexity.slice(0, 20).map((tx, i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td className="p-2">{tx.hour}:00</td>
                    <td className="p-2 font-mono">{tx.compute_units.toLocaleString()}</td>
                    <td className="p-2">
                      <Badge variant={tx.type === 'Jito Bundle' ? 'warning' : 'secondary'} className="text-[10px]">
                        {tx.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactionComplexity.length > 20 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                ... and {transactionComplexity.length - 20} more transactions
              </p>
            )}
          </div>
        </div>

        {/* Notable Transactions */}
        <div>
          <h4 className="text-sm font-medium mb-3">Notable Transactions</h4>
          {notableTransactions.count > 0 ? (
            <div className="space-y-2">
              {notableTransactions.transactions.map((tx, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(tx, null, 2)}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted/20 rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notable transactions flagged</p>
            </div>
          )}
        </div>
      </div>
    </CollapsibleSection>
  )
})
