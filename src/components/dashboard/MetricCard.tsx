import * as React from 'react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: React.ReactNode;
  icon?: React.ReactNode;
  linkTo?: string;
  className?: string;
  valueColor?: 'default' | 'success' | 'danger' | 'warning' | 'brand';
}

export function MetricCard({ label, value, sublabel, icon, linkTo, className, valueColor = 'default' }: MetricCardProps) {
  const colorMap = {
    default: 'text-white',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    brand: 'text-brand-primary',
  };

  const content = (
    <Card padding="md" className={`h-full flex flex-col justify-between hover:bg-surface-raised transition-colors ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div>
        <div className={`text-2xl font-bold ${colorMap[valueColor]}`}>
          {value}
        </div>
        {sublabel && (
          <div className="text-xs text-muted mt-1 font-medium">{sublabel}</div>
        )}
      </div>
    </Card>
  );

  if (linkTo) {
    return <Link href={linkTo} className="block h-full">{content}</Link>;
  }

  return content;
}
