import { useEffect } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import './DailySchedule.css';

export interface DailyScheduleConfig {
  dailyTimes: string[];
}

interface DailyScheduleProps {
  config: DailyScheduleConfig;
  onChange: (config: DailyScheduleConfig) => void;
  onCronChange: (cron: string | string[]) => void;
}

export function DailySchedule({ config, onChange, onCronChange }: DailyScheduleProps) {
  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config.dailyTimes);
    onCronChange(cron);
  }, [config, onCronChange]);

  const addTime = () => {
    onChange({ ...config, dailyTimes: [...config.dailyTimes, '12:00'] });
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...config.dailyTimes];
    newTimes[index] = value;
    onChange({ ...config, dailyTimes: newTimes });
  };

  const removeTime = (index: number) => {
    const newTimes = config.dailyTimes.filter((_, i) => i !== index);
    onChange({ ...config, dailyTimes: newTimes });
  };

  return (
    <div>
      <div className="form-group">
        <label>Times to run each day</label>
        {config.dailyTimes.map((time, index) => (
          <div key={index} className="time-inputs">
            <TimeSelector
              value={time}
              onChange={(value) => updateTime(index, value)}
              showRemoveButton={config.dailyTimes.length > 1}
              onRemove={() => removeTime(index)}
              step="60"
            />
          </div>
        ))}

        <button type="button" className="add-time-btn" onClick={addTime}>
          + Add another time
        </button>
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(dailyTimes: string[]): string | string[] {
  if (!dailyTimes || dailyTimes.length === 0) {
    return '0 0 * * *'; // Default to midnight
  }

  if (dailyTimes.length === 1) {
    const [hours, minutes] = dailyTimes[0].split(':');
    return `${minutes} ${hours} * * *`;
  }

  const times = dailyTimes.map(time => {
    const [hours, minutes] = time.split(':');
    return { hours, minutes };
  });

  const hourGroups = new Map<string, Set<string>>();
  times.forEach(time => {
    if (!hourGroups.has(time.hours)) {
      hourGroups.set(time.hours, new Set());
    }
    hourGroups.get(time.hours)!.add(time.minutes);
  });

  const minuteGroups = new Map<string, Set<string>>();
  times.forEach(time => {
    if (!minuteGroups.has(time.minutes)) {
      minuteGroups.set(time.minutes, new Set());
    }
    minuteGroups.get(time.minutes)!.add(time.hours);
  });

  const hourExpressions = Array.from(hourGroups.entries()).map(
    ([hour, minutes]) => `${Array.from(minutes).join(',')} ${hour} * * *`
  );

  const minuteExpressions = Array.from(minuteGroups.entries()).map(
    ([minute, hours]) => `${minute} ${Array.from(hours).join(',')} * * *`
  );

  if (hourExpressions.length <= minuteExpressions.length) {
    return hourExpressions.length === 1 ? hourExpressions[0] : hourExpressions;
  } else {
    return minuteExpressions.length === 1 ? minuteExpressions[0] : minuteExpressions;
  }
}