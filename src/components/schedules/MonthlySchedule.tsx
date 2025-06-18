import { useEffect, useState } from 'react';
import { TimeSelector } from '../common/TimeSelector';
import { SelectorGrid } from '../common/SelectorGrid';
import { ValidationMessage } from '../common/ValidationMessage';
import './MonthlySchedule.css';
import { cleanNumericValue, convertToRanges, formatMonths } from '../../utils/cronParser';

export interface MonthlyScheduleConfig {
  monthlyTime: string;
  monthlyDays: number[];
  monthlyMonths: number[];
}

interface MonthlyScheduleProps {
  config: MonthlyScheduleConfig;
  onChange: (config: Partial<MonthlyScheduleConfig>) => void;
  onCronChange: (cron: string) => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function MonthlySchedule({ config, onChange, onCronChange }: MonthlyScheduleProps) {
  const [showDayWarning, setShowDayWarning] = useState(false);
  const [showMonthWarning, setShowMonthWarning] = useState(false);

  // Convert to cron expression and notify parent
  useEffect(() => {
    const cron = generateCronExpression(config.monthlyTime, config.monthlyDays, config.monthlyMonths);
    onCronChange(cron);
  }, [config, onCronChange]);

  // Ensure arrays are defined
  const monthlyDays = config.monthlyDays ?? [];
  const monthlyMonths = config.monthlyMonths ?? [];

  const toggleDay = (day: number) => {
    const isCurrentlySelected = monthlyDays.includes(day);

    // If trying to unselect the last selected day, show warning and prevent change
    if (isCurrentlySelected && monthlyDays.length === 1) {
      setShowDayWarning(true);
      // Clear warning after 3 seconds
      setTimeout(() => setShowDayWarning(false), 3000);
      return;
    }

    // Otherwise, hide warning if shown
    if (showDayWarning) {
      setShowDayWarning(false);
    }

    // Apply change
    let updated: number[];
    if (isCurrentlySelected) {
      updated = monthlyDays.filter(d => d !== day);
    } else {
      updated = [...monthlyDays, day].sort((a, b) => a - b);
    }
    onChange({ monthlyDays: updated });
  };

  const toggleMonth = (month: number) => {
    const isCurrentlySelected = monthlyMonths.includes(month);

    // If trying to unselect the last selected month, show warning and prevent change
    if (isCurrentlySelected && monthlyMonths.length === 1) {
      setShowMonthWarning(true);
      // Clear warning after 3 seconds
      setTimeout(() => setShowMonthWarning(false), 3000);
      return;
    }

    // Otherwise, hide warning if shown
    if (showMonthWarning) {
      setShowMonthWarning(false);
    }

    // Apply change
    let updated: number[];
    if (isCurrentlySelected) {
      updated = monthlyMonths.filter(m => m !== month);
    } else {
      updated = [...monthlyMonths, month].sort((a, b) => a - b);
    }
    onChange({ monthlyMonths: updated });
  };

  // Create day items for the selector grid
  const dayItems = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1)
  }));

  // Create month items for the selector grid
  const monthItems = MONTH_NAMES.map((name, idx) => ({
    value: idx + 1,
    label: name
  }));

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
        <ValidationMessage 
          message="At least one day must be selected" 
          visible={showDayWarning} 
        />
        <SelectorGrid
          items={dayItems}
          selectedValues={monthlyDays}
          onToggle={toggleDay}
          columns={7}
        />
      </div>

      <div className="form-group">
        <label>Months</label>
        <ValidationMessage 
          message="At least one month must be selected" 
          visible={showMonthWarning} 
        />
        <SelectorGrid
          items={monthItems}
          selectedValues={monthlyMonths}
          onToggle={toggleMonth}
          columns={6}
        />
      </div>
    </div>
  );
}

// Generate cron expression from config
export function generateCronExpression(monthlyTime: string, monthlyDays: number[], monthlyMonths: number[]): string {
  const [hours, minutes] = (monthlyTime || '00:00').split(':');
  const cleanMins = cleanNumericValue(minutes);
  const cleanHours = cleanNumericValue(hours);

  // Format days as ranges (1-3 instead of 1,2,3)
  // Since we now enforce at least one day, we don't need the fallback
  const days = convertToRanges(monthlyDays);

  // Format months as named ranges (JAN-MAR instead of 1,2,3)
  // Since we now enforce at least one month, we don't need the fallback
  const months = formatMonths(monthlyMonths);

  return `${cleanMins} ${cleanHours} ${days} ${months} *`;
}