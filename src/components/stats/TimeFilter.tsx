import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface TimeFilterProps {
  value: 'today' | 'week' | 'month' | 'all';
  onChange: (value: 'today' | 'week' | 'month' | 'all') => void;
}

const timeFilters = [
  {
    value: 'today' as const,
    label: 'Today',
    icon: Clock,
    description: 'Last 24 hours'
  },
  {
    value: 'week' as const,
    label: 'Week',
    icon: Calendar,
    description: 'Last 7 days'
  },
  {
    value: 'month' as const,
    label: 'Month',
    icon: TrendingUp,
    description: 'Last 30 days'
  },
  {
    value: 'all' as const,
    label: 'All Time',
    icon: BarChart3,
    description: 'All recorded data'
  }
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {timeFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = value === filter.value;

        return (
          <Button
            key={filter.value}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(filter.value)}
            className={`gap-2 transition-all duration-200 ${
              isActive
                ? 'bg-mint hover:bg-mint/90 text-mint-foreground border-mint shadow-sm'
                : 'hover:bg-muted/80 border-border/50'
            }`}
            title={filter.description}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
          </Button>
        );
      })}
    </div>
  );
}