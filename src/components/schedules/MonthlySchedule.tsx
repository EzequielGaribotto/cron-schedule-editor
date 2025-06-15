import { useEffect } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import './MonthlySchedule.css';

export interface MonthlyScheduleConfig {
  monthlyTime: string;
  monthlyDays: number[];
}

interface MonthlyScheduleProps {
  config: MonthlyScheduleConfig;
  onChange: (config: Partial<MonthlyScheduleConfig>) => void;
  onCronChange: (cron: string) => void;
}

export function MonthlySchedule({ config, onChange, onCronChange }: MonthlyScheduleProps) {
  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config.monthlyTime, config.monthlyDays);
    onCronChange(cron);
  }, [config, onCronChange]);

  const toggleDay = (day: number) => {
    if (config.monthlyDays.includes(day)) {
      onChange({
        monthlyDays: config.monthlyDays.filter(d => d !== day)
      });
    } else {
      onChange({
        monthlyDays: [...config.monthlyDays, day].sort((a, b) => a - b)
      });
    }
  };

  return (
    <div>
      <div className="form-group">
        <TimeSelector
          id="monthly-time"
          label="Time"
          value={config.monthlyTime}
          onChange={(value) => onChange({ monthlyTime: value })}
          step="60"
        />
      </div>

      <div className="form-group">
        <label>Days of month</label>
        <div className="month-days">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              type="button"
              className={`day-btn ${config.monthlyDays.includes(day) ? 'selected' : ''}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(monthlyTime: string, monthlyDays: number[]): string {
  const [hours, minutes] = (monthlyTime || '00:00').split(':');
  const days = monthlyDays?.join(',') || '*';
  return `${minutes} ${hours} ${days} * *`;
}
