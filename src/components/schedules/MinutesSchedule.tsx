import { useEffect } from 'react';
import './MinutesSchedule.css';

export interface MinutesScheduleConfig {
  minutes: number;
}

interface MinutesScheduleProps {
  config: MinutesScheduleConfig;
  onChange: (config: MinutesScheduleConfig) => void;
  onCronChange: (cron: string) => void;
}

export function MinutesSchedule({ config, onChange, onCronChange }: MinutesScheduleProps) {
  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config);
    onCronChange(cron);
  }, [config, onCronChange]);

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    // Ensure value is between 1 and 59
    const validValue = Math.min(59, Math.max(1, value));
    onChange({ minutes: validValue });
  };

  return (
    <div>
      <div className="form-group">
        <label htmlFor="minutes-input">Run every</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            id="minutes-input"
            type="number"
            min="1"
            max="59"
            value={config.minutes}
            onChange={handleMinutesChange}
          />
          <span style={{ marginLeft: '10px' }}>minutes</span>
        </div>
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(config: MinutesScheduleConfig): string {
  // Ensure minutes is valid before generating expression
  const validMinutes = Math.min(59, Math.max(1, config.minutes));
  return `*/${validMinutes} * * * *`;
}