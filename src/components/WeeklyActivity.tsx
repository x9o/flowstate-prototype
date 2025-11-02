interface WeeklyActivityProps {
  data: { month: string; value: number; color: string }[];
}

export const WeeklyActivity = ({ data }: WeeklyActivityProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 md:gap-3 h-24 sm:h-28 md:h-32 px-2 sm:px-4">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;

        return (
          <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <div className="relative w-full flex items-end justify-center h-16 sm:h-20 md:h-24">
              <div
                className="w-4 sm:w-6 md:w-8 rounded-full transition-all duration-500 ease-out hover:scale-105"
                style={{
                  height: `${height}%`,
                  backgroundColor: item.color,
                  minHeight: '6px',
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium truncate">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};
