import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardMetric } from '../../types';

interface MetricCardProps {
  metric: DashboardMetric;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const { title, value, unit, change, changeDirection, changeLabel, color } = metric;

  const getTrendIcon = () => {
    switch (changeDirection) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    // For metrics where down is good (like costs, findings)
    if (changeLabel?.toLowerCase().includes('cost') || title.toLowerCase().includes('finding')) {
      return changeDirection === 'down' ? 'text-green-600' : 'text-red-600';
    }
    // For metrics where up is good (like compliance, score)
    return changeDirection === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow',
        className
      )}
      style={{ borderTopColor: color, borderTopWidth: color ? '4px' : undefined }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {change !== undefined && (
          <div className={clsx('flex items-center gap-1 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      
      {changeLabel && (
        <p className="text-xs text-gray-400 mt-2">{changeLabel}</p>
      )}
    </div>
  );
}

// Quick metrics grid for dashboards
interface MetricsGridProps {
  metrics: DashboardMetric[];
  columns?: 2 | 3 | 4 | 5;
}

export function MetricsGrid({ metrics, columns = 4 }: MetricsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  };

  return (
    <div className={clsx('grid gap-4', gridCols[columns])}>
      {metrics.map((metric) => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

// Severity-based metric card for security findings
interface SeverityMetricCardProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  count: number;
  change?: number;
}

export function SeverityMetricCard({ severity, count, change }: SeverityMetricCardProps) {
  const severityConfig = {
    CRITICAL: { color: '#DC2626', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    HIGH: { color: '#EA580C', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    MEDIUM: { color: '#CA8A04', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    LOW: { color: '#16A34A', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    INFORMATIONAL: { color: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  };

  const config = severityConfig[severity];

  return (
    <div className={clsx('rounded-xl border p-4', config.bg, config.border)}>
      <div className="flex items-center justify-between mb-2">
        <span className={clsx('text-sm font-medium', config.text)}>{severity}</span>
        {change !== undefined && (
          <span className={clsx('text-xs', change > 0 ? 'text-red-600' : 'text-green-600')}>
            {change > 0 ? '+' : ''}{change}
          </span>
        )}
      </div>
      <span className={clsx('text-2xl font-bold', config.text)}>{count}</span>
    </div>
  );
}

// Compliance Score Card
interface ComplianceScoreCardProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ComplianceScoreCard({ score, label = 'Compliance Score', size = 'md' }: ComplianceScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600 bg-green-100 border-green-300';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    if (score >= 50) return 'text-orange-600 bg-orange-100 border-orange-300';
    return 'text-red-600 bg-red-100 border-red-300';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-3xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={clsx(
          'rounded-full border-4 flex items-center justify-center font-bold',
          getScoreColor(),
          sizeClasses[size]
        )}
      >
        {score}%
      </div>
      <span className="text-sm text-gray-500 mt-2">{label}</span>
    </div>
  );
}
