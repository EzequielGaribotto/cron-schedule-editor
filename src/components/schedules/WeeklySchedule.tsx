import { useEffect, useState } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import { SelectorGrid } from '../common/SelectorGrid';
import './WeeklySchedule.css';
import { cleanNumericValue, formatWeekdays } from '../../utils/cronParser';

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
  const [showWarning, setShowWarning] = useState(false);

  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config);
    onCronChange(cron);
  }, [config, onCronChange]);

  // Get the count of selected days
  const selectedDayCount = config.weekDays.filter(Boolean).length;

  const toggleDay = (dayIndex: number) => {
    const isCurrentlySelected = config.weekDays[dayIndex];

    // If trying to unselect the last selected day, show warning and prevent change
    if (isCurrentlySelected && selectedDayCount === 1) {
      setShowWarning(true);
      // Clear warning after 3 seconds
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }

    // Otherwise, hide warning if shown
    if (showWarning) {
      setShowWarning(false);
    }

    // Apply change
    const newDays = [...config.weekDays];
    newDays[dayIndex] = !newDays[dayIndex];
    onChange({ weekDays: newDays });
  };

  // Create day items for the selector grid
  const dayItems = dayNames.map((name, idx) => ({
    value: idx,
    label: name
  }));

  // Convert boolean array to array of selected indices
  const selectedDays = config.weekDays
    .map((isSelected, index) => isSelected ? index : -1)
    .filter(index => index !== -1);

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
        <div className="label-container">
          <label>Days of week</label>
          {showWarning && (
            <span className="validation-warning">At least one day must be selected</span>
          )}
        </div>
        <SelectorGrid
          items={dayItems}
          selectedValues={selectedDays}
          onToggle={toggleDay}
          columns={7}
        />
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(config: WeeklyScheduleConfig): string {
  const { weeklyTime, weekDays } = config;

  // Get clean hour and minute values
  const [hours, mins] = (weeklyTime || '00:00').split(':');
  const cleanMins = cleanNumericValue(mins);
  const cleanHours = cleanNumericValue(hours);

  // Convert weekdays to array of numbers - we now ensure at least one day is selected
  const selectedDays = weekDays
    .map((selected, index) => (selected ? index : null))
    .filter((day): day is number => day !== null);

  // Format weekdays using named ranges (MON-FRI)
  const formattedDays = formatWeekdays(selectedDays);

  return `${cleanMins} ${cleanHours} * * ${formattedDays}`;
}
