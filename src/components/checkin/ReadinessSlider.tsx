import * as React from 'react';
import { Slider } from '@/components/ui/Slider';

interface ReadinessSliderProps {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  isInverted?: boolean;
}

export function ReadinessSlider({ label, name, value, onChange, isInverted = false }: ReadinessSliderProps) {
  const lowLabel = isInverted ? '1 = Excellent' : '1 = Poor';
  const highLabel = isInverted ? '10 = Poor' : '10 = Excellent';

  return (
    <div className="space-y-1">
      <Slider
        label={label}
        name={name}
        value={value}
        min={1}
        max={10}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
      <div className="flex justify-between text-xs text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
