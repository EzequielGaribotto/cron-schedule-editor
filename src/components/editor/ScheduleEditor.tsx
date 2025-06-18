/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from 'react';
import { MinutesSchedule, type MinutesScheduleConfig, generateCronExpression as generateMinutesCron } from '../schedules/MinutesSchedule';
import { WeeklySchedule, type WeeklyScheduleConfig, generateCronExpression as generateWeeklyCron } from '../schedules/WeeklySchedule';
import { DailySchedule, type DailyScheduleConfig, generateCronExpression as generateDailyCron } from '../schedules/DailySchedule';
import { MonthlySchedule, type MonthlyScheduleConfig, generateCronExpression as generateMonthlyCron } from '../schedules/MonthlySchedule';
import './ScheduleEditor.css';

export type ScheduleType = 'minutes' | 'weekly' | 'daily' | 'monthly';

export interface ScheduleEditorProps {
  onCronChange: (cron: string | string[]) => void;
  scheduleType?: ScheduleType;
  scheduleConfig?: any;
  onConfigChange?: (type: ScheduleType, config: any) => void;
}

export function ScheduleEditor({
  onCronChange,
  scheduleType: externalType,
  scheduleConfig: externalConfig,
  onConfigChange
}: ScheduleEditorProps) {
  const [scheduleType, setScheduleType] = useState<ScheduleType>(externalType || 'minutes');
  const [minutesConfig, setMinutesConfig] = useState<MinutesScheduleConfig>({ minutes: 5 });
  const [weeklyConfig, setWeeklyConfig] = useState<WeeklyScheduleConfig>({
    weeklyTime: '09:00',
    weekDays: [false, true, true, true, true, true, false],
  });
  const [dailyConfig, setDailyConfig] = useState<DailyScheduleConfig>({ dailyTimes: ['09:00'] });
  const [monthlyConfig, setMonthlyConfig] = useState<MonthlyScheduleConfig>({
    monthlyTime: '09:00',
    monthlyDays: [1],
    monthlyMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  });

  // Sync with external props
  useEffect(() => {
    if (externalType) setScheduleType(externalType);
    if (externalConfig) {
      switch (externalType) {
        case 'minutes':
          setMinutesConfig(externalConfig);
          break;
        case 'weekly':
          setWeeklyConfig(externalConfig);
          break;
        case 'daily':
          setDailyConfig(externalConfig);
          break;
        case 'monthly':
          setMonthlyConfig({
            ...externalConfig,
            monthlyMonths: Array.isArray(externalConfig.monthlyMonths)
              ? externalConfig.monthlyMonths
              : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          });
          break;
        default:
          break;
      }
    }
  }, [externalType, externalConfig]);

  // Handle schedule type change
  const handleTypeChange = (type: ScheduleType) => {
    setScheduleType(type);
    let cron: string | string[];
    let config: any;
    switch (type) {
      case 'minutes':
        cron = generateMinutesCron(minutesConfig);
        config = minutesConfig;
        break;
      case 'weekly':
        cron = generateWeeklyCron(weeklyConfig);
        config = weeklyConfig;
        break;
      case 'daily':
        cron = generateDailyCron(dailyConfig.dailyTimes);
        config = dailyConfig;
        break;
      case 'monthly':
        {
          // Default to day 1 of every month
          const monthly = {
            ...monthlyConfig,
            monthlyDays: monthlyConfig.monthlyDays?.length ? monthlyConfig.monthlyDays : [1],
            monthlyMonths: monthlyConfig.monthlyMonths?.length ? monthlyConfig.monthlyMonths : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
          };
          cron = generateMonthlyCron(monthly.monthlyTime, monthly.monthlyDays, monthly.monthlyMonths);
          config = monthly;
          setMonthlyConfig(monthly); // Update the internal state with valid defaults
        }
        break;
      default:
        cron = '* * * * *';
        config = {};
    }
    onCronChange(cron);
    onConfigChange && onConfigChange(type, config);
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
            onChange={(cfg) => { setMinutesConfig(cfg); onConfigChange && onConfigChange('minutes', cfg); }}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'weekly' && (
          <WeeklySchedule
            config={weeklyConfig}
            onChange={(updates) => {
              const newCfg = { ...weeklyConfig, ...updates };
              setWeeklyConfig(newCfg);
              onConfigChange && onConfigChange('weekly', newCfg);
            }}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'daily' && (
          <DailySchedule
            config={dailyConfig}
            onChange={(cfg) => { setDailyConfig(cfg); onConfigChange && onConfigChange('daily', cfg); }}
            onCronChange={onCronChange}
          />
        )}

        {scheduleType === 'monthly' && (
          <MonthlySchedule
            config={monthlyConfig}
            onChange={(updates) => {
              const newCfg = {
                ...monthlyConfig,
                ...updates,
                monthlyMonths:
                  updates.monthlyMonths !== undefined
                    ? updates.monthlyMonths
                    : monthlyConfig.monthlyMonths,
                monthlyDays:
                  updates.monthlyDays !== undefined
                    ? updates.monthlyDays
                    : monthlyConfig.monthlyDays,
              };
              setMonthlyConfig(newCfg);
              onConfigChange && onConfigChange('monthly', newCfg);
            }}
            onCronChange={onCronChange}
          />
        )}
      </div>
    </div>
  );
}