import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const FocusTimer = ({ onStartMonitoring }: { onStartMonitoring?: () => void }) => {
  const { theme } = useTheme();
  const [duration, setDuration] = useState(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (duration === 0) return 0;
    return ((duration - timeRemaining) / duration) * 100;
  };

  const handleStart = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration);
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(duration);
  };

  const handleDurationChange = (value: string) => {
    const minutes = parseInt(value);
    if (!isNaN(minutes) && minutes > 0) {
      setDuration(minutes * 60);
      setIsActive(false);
    }
  };

  const handleCustomDuration = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
      setDuration(minutes * 60);
      setIsActive(false);
      setCustomMinutes('');
    }
  };

  const progress = calculateProgress();
  const circumference = 2 * Math.PI * 120;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-soft p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">Focus Timer</h2>
        <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-sky flex items-center justify-center hover:scale-105 transition-transform">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <div className="relative">
          <svg className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="120"
              stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={isActive ? circumference - (progress / 100) * circumference : circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                timeRemaining === 0
                  ? 'text-red-500'
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <div className={`text-xs sm:text-sm mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {isActive ? 'Focus Time' : timeRemaining === duration ? 'Set a duration' : 'Paused'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Select
            value={String(duration / 60)}
            onValueChange={handleDurationChange}
            disabled={isActive}
          >
            <SelectTrigger className="flex-1 h-10 sm:h-12 rounded-xl sm:rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl sm:rounded-2xl">
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="25">25 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Custom"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              disabled={isActive}
              className="w-20 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-center"
              min="1"
              max="180"
            />
            <Button
              onClick={handleCustomDuration}
              disabled={isActive || !customMinutes}
              size="sm"
              variant="outline"
              className="h-10 sm:h-12 rounded-xl sm:rounded-2xl px-3"
            >
              Set
            </Button>
          </div>
        </div>

        <p className={`text-xs mt-2 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Monitoring will run until the timer ends.
        </p>
      </div>

      <div className="flex gap-3">
        {!isActive ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-mint to-sky hover:scale-[1.02] transition-transform shadow-lg shadow-mint/20 text-sm sm:text-base"
            disabled={timeRemaining === 0}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {timeRemaining === duration ? 'Start Monitoring' : 'Resume'}
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            size="lg"
            className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 hover:scale-[1.02] transition-transform shadow-lg shadow-orange-400/20 text-sm sm:text-base"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Pause
          </Button>
        )}

        <Button
          onClick={handleReset}
          size="lg"
          variant="outline"
          className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base"
        >
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </div>
  );
};

export default FocusTimer;