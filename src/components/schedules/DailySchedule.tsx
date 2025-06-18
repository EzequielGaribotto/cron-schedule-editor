import { useEffect } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import './DailySchedule.css';
import { cleanNumericValue } from '../../utils/cronParser';

export interface DailyScheduleConfig {
  dailyTimes: string[];
}

interface DailyScheduleProps {
  config: DailyScheduleConfig;
  onChange: (config: DailyScheduleConfig) => void;
  onCronChange: (cron: string | string[]) => void;
}

export function DailySchedule({ config, onChange, onCronChange }: DailyScheduleProps) {
  useEffect(() => {
    // Ensure we never have more than 2 times
    if (config.dailyTimes.length > 2) {
      onChange({
        ...config,
        dailyTimes: config.dailyTimes.slice(0, 2)
      });
      return;
    }
    
    // Generate cron expression
    const cron = generateCronExpression(config.dailyTimes);
    onCronChange(cron);
  }, [config, onChange, onCronChange]);

  const addSecondTime = () => {
    onChange({
      ...config,
      dailyTimes: [...config.dailyTimes, '18:00']
    });
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...config.dailyTimes];
    newTimes[index] = value;
    onChange({ ...config, dailyTimes: newTimes });
  };

  const removeSecondTime = () => {
    onChange({
      ...config,
      dailyTimes: [config.dailyTimes[0]]
    });
  };

  // Get first and second time values
  const firstTime = config.dailyTimes[0] || '09:00';
  const hasSecondTime = config.dailyTimes.length > 1;

  return (
    <div>
      <div className="form-group">
        <label>Times to run each day</label>
        <div className="time-inputs-container">
          <div className="time-inputs">
            <span className="time-label">First time:</span>
            <TimeSelector
              value={firstTime}
              onChange={(value) => updateTime(0, value)}
              step="60"
            />
          </div>

          {hasSecondTime ? (
            <div className="time-inputs">
              <span className="time-label">Second time:</span>
              <TimeSelector
                value={config.dailyTimes[1]}
                onChange={(value) => updateTime(1, value)}
                showRemoveButton={true}
                onRemove={removeSecondTime}
                step="60"
              />
            </div>
          ) : (
            <button
              type="button"
              className="add-time-btn"
              onClick={addSecondTime}
              aria-label="Add second time"
            >
              + Add second time
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function generateCronExpression(dailyTimes: string[]): string | string[] {
  if (!dailyTimes || dailyTimes.length === 0) {
    return '0 0 * * *';  // Default to midnight
  }

  if (dailyTimes.length === 1) {
    const [hours, minutes] = dailyTimes[0].split(':');
    return `${cleanNumericValue(minutes)} ${cleanNumericValue(hours)} * * *`;
  }

  // For exactly 2 times, just return the two expressions directly
  return dailyTimes.map(time => {
    const [hours, minutes] = time.split(':');
    return `${cleanNumericValue(minutes)} ${cleanNumericValue(hours)} * * *`;
  });
}