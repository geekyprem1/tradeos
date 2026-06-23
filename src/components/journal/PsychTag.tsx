import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import { TradeJournal } from '@/lib/types';

interface PsychTagProps {
  tag: TradeJournal['psychology_tag'];
}

export function PsychTag({ tag }: PsychTagProps) {
  let variant: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';

  if (tag === 'focus' || tag === 'confident') {
    variant = 'success';
  } else if (tag === 'fomo' || tag === 'restlessness') {
    variant = 'warning';
  } else if (tag === 'fear' || tag === 'greed' || tag === 'revenge') {
    variant = 'danger';
  }

  // Capitalize first letter for display
  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return (
    <Badge variant={variant} size="sm" className="uppercase tracking-wider">
      {displayTag}
    </Badge>
  );
}
