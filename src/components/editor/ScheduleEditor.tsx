import { useState } from 'react';
import { MinutesSchedule, type MinutesScheduleConfig, generateCronExpression as generateMinutesCron } from '../schedules/MinutesSchedule';
import { WeeklySchedule, type WeeklyScheduleConfig, generateCronExpression as generateWeeklyCron } from '../schedules/WeeklySchedule';
import { DailySchedule, type DailyScheduleConfig, generateCronExpression as generateDailyCron } from '../schedules/DailySchedule';
import { MonthlySchedule, type MonthlyScheduleConfig, generateCronExpression as generateMonthlyCron } from '../schedules/MonthlySchedule';
import './ScheduleEditor.css';

export type ScheduleType = 'minutes' | 'weekly' | 'daily' | 'monthly';

export interface ScheduleEditorProps {
  onCronChange: (cron: string | string[]) => void;
}

export function ScheduleEditor({ onCronChange }: ScheduleEditorProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>('minutes');
  const [minutesConfig, setMinutesConfig] = useState<MinutesScheduleConfig>({
    minutes: 5
  });
  
  const [weeklyConfig, setWeeklyConfig] = useState<WeeklyScheduleConfig>({
    weeklyTime: '09:00',
    weekDays: [false, true, true, true, true, true, false], // Mon-Fri
  });
  
  const [dailyConfig, setDailyConfig] = useState<DailyScheduleConfig>({
    dailyTimes: ['09:00']
  });
  
  const [monthlyConfig, setMonthlyConfig] = useState<MonthlyScheduleConfig>({
    monthlyTime: '09:00',
    monthlyDays: [1]
  });

  // Handle schedule type change
  const handleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    
    // Generate the appropriate cron expression based on the selected type
    let cron: string | string[];
    
    switch (type) {
      case 'minutes':
        cron = generateMinutesCron(minutesConfig);
        break;
      case 'weekly':
        cron = generateWeeklyCron(weeklyConfig);
        break;
      case 'daily':
        cron = generateDailyCron(dailyConfig.dailyTimes);
        break;
      case 'monthly':
        cron = generateMonthlyCron(monthlyConfig.monthlyTime, monthlyConfig.monthlyDays);
        break;
      default:
        cron = '* * * * *';
    }
    
    onCronChange(cron);
  };

  return (
    <div className="schedule-editor">
      <div className="schedule-tabs">
        <button
          className={`schedule-tab ${scheduleType === 'minutes' ? 'active' : ''}`}
          onClick={() => handleTypeChange('minutes')}
        >
          Every X Minutes
        </button>
        <button
          className={`schedule-tab ${scheduleType === 'weekly' ? 'active' : ''}`}
          onClick={() => handleTypeChange('weekly')}
        >
          Weekly
        </button>
        <button
          className={`schedule-tab ${scheduleType === 'daily' ? 'active' : ''}`}
          onClick={() => handleTypeChange('daily')}
        >
          Daily
        </button>
        <button
          className={`schedule-tab ${scheduleType === 'monthly' ? 'active' : ''}`}
          onClick={() => handleTypeChange('monthly')}
        >
          Monthly
        </button>
      </div>

      <div className="schedule-content">
        {scheduleType === 'minutes' && (
          <MinutesSchedule
            config={minutesConfig}
            onChange={setMinutesConfig}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'weekly' && (
          <WeeklySchedule
            config={weeklyConfig}
            onChange={(updates) => setWeeklyConfig({ ...weeklyConfig, ...updates })}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'daily' && (
          <DailySchedule
            config={dailyConfig}
            onChange={setDailyConfig}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'monthly' && (
          <MonthlySchedule
            config={monthlyConfig}
            onChange={(updates) => setMonthlyConfig({ ...monthlyConfig, ...updates })}
            onCronChange={onCronChange}
          />
        )}
      </div>
    </div>
  );
}
