import { useEffect } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import './WeeklySchedule.css';

export interface WeeklyScheduleConfig {
  weeklyTime: string;
  weekDays: boolean[];
}

interface WeeklyScheduleProps {
  config: WeeklyScheduleConfig;
  onChange: (config: Partial<WeeklyScheduleConfig>) => void;
  onCronChange: (cron: string | string[]) => void;
}

export function WeeklySchedule({ config, onChange, onCronChange }: WeeklyScheduleProps) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config);
    onCronChange(cron);
  }, [config, onCronChange]);

  const handleDayToggle = (index: number) => {
    const newDays = [...config.weekDays];
    newDays[index] = !newDays[index];
    onChange({ weekDays: newDays });
  };

  return (
    <div>
      <div className="form-group">
        <TimeSelector
          id="weekly-time"
          label="Time"
          value={config.weeklyTime}
          onChange={(value) => onChange({ weeklyTime: value })}
          step="60" 
        />
      </div>

      <div className="form-group">
        <label>Days of week</label>
        <div className="checkbox-group">
          {dayNames.map((day, index) => (
            <div key={day} className="checkbox-item">
              <input
                type="checkbox"
                id={`day-${index}`}
                checked={config.weekDays[index]}
                onChange={() => handleDayToggle(index)}
              />
              <label htmlFor={`day-${index}`}>{day}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(config: WeeklyScheduleConfig): string {
  const { weeklyTime, weekDays } = config;

  // Standard weekly schedule
  const [hours, mins] = (weeklyTime || '00:00').split(':');
  const days = weekDays
    ?.map((selected, index) => (selected ? index : null))
    .filter((day): day is number => day !== null)
    .join(',');

  return `${mins} ${hours} * * ${days || '*'}`;
}
