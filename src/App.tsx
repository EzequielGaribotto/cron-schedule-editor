import { useState, useEffect, useRef } from 'react';
import { ScheduleEditor, type ScheduleType } from './components/editor/ScheduleEditor';
import { generateCronExpression as generateMinutesCron, type MinutesScheduleConfig } from './components/schedules/MinutesSchedule';
import { generateCronExpression as generateWeeklyCron, type WeeklyScheduleConfig } from './components/schedules/WeeklySchedule';
import { generateCronExpression as generateDailyCron, type DailyScheduleConfig } from './components/schedules/DailySchedule';
import { generateCronExpression as generateMonthlyCron, type MonthlyScheduleConfig } from './components/schedules/MonthlySchedule';
import { parseCronType } from './utils/cronParser';
import './App.css';

function App() {
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [rawInput, setRawInput] = useState('*/5 * * * *');
  const [error, setError] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('minutes');
  const [scheduleConfig, setScheduleConfig] = useState<unknown>({ minutes: 5 });
  const [isEditingRaw, setIsEditingRaw] = useState(false);

  const lastChangeSource = useRef<'cron' | 'editor' | 'user' | null>(null);

  const handleCronChange = (cron: string | string[]) => {
    if (isEditingRaw) return;
    const formattedCron = Array.isArray(cron) ? cron.join('\n') : cron;
    if (formattedCron === cronExpression) return;

    lastChangeSource.current = 'editor';
    setCronExpression(formattedCron);
    setRawInput(formattedCron);
    setError('');
  };

  const handleConfigChange = (type: ScheduleType, config: unknown) => {
    setScheduleType(type);
    setScheduleConfig(config);
  };

  useEffect(() => {
    if (lastChangeSource.current === 'cron' || isEditingRaw) return;

    let cron: string | string[] = '';
    switch (scheduleType) {
      case 'minutes':
        cron = generateMinutesCron(scheduleConfig as MinutesScheduleConfig);
        break;
      case 'weekly':
        cron = generateWeeklyCron(scheduleConfig as WeeklyScheduleConfig);
        break;
      case 'daily':
        cron = generateDailyCron((scheduleConfig as DailyScheduleConfig).dailyTimes);
        break;
      case 'monthly':
        {
          const monthly = scheduleConfig as MonthlyScheduleConfig;
          cron = generateMonthlyCron(monthly.monthlyTime, monthly.monthlyDays, monthly.monthlyMonths);
          break;
        }
      default:
        cron = '* * * * *';
    }

    lastChangeSource.current = 'cron';
    const formattedCron = Array.isArray(cron) ? cron.join('\n') : cron;
    setCronExpression(formattedCron);
    setRawInput(formattedCron);
    setError('');
  }, [scheduleType, scheduleConfig, isEditingRaw]);

  const handleRawInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRawInput(value);

    lastChangeSource.current = 'user';
    const parsed = parseCronType(value);
    if (parsed.type) {
      setCronExpression(value);
      setScheduleType(parsed.type);
      setScheduleConfig(parsed.config);
      setError('');
    } else if (parsed.error) {
      setError(parsed.error);
    } else if (value.trim() !== 'INVALID') {
      setError('Invalid CRON expression');
    }
  };

  useEffect(() => {
    if (lastChangeSource.current !== 'editor' && lastChangeSource.current !== 'cron') return;

    const parsed = parseCronType(cronExpression);
    if (parsed.type) {
      setScheduleType(parsed.type);
      setScheduleConfig(parsed.config);
      setError('');
    } else if (parsed.error) {
      setError(parsed.error);
    } else if (cronExpression.trim() !== 'INVALID') {
      setError('Invalid CRON expression');
    }

    lastChangeSource.current = null;
  }, [cronExpression]);

  const handleRawInputFocus = () => setIsEditingRaw(true);
  const handleRawInputBlur = () => {
    setIsEditingRaw(false);
    const parsed = parseCronType(rawInput);
    if (parsed.type) {
      setCronExpression(rawInput);
      setScheduleType(parsed.type);
      setScheduleConfig(parsed.config);
      setError('');
    }
  };

  return (
    <div className="app-container">
      <h1>Cron Schedule Editor</h1>

      <ScheduleEditor
        onCronChange={handleCronChange}
        scheduleType={scheduleType}
        scheduleConfig={scheduleConfig}
        onConfigChange={handleConfigChange}
      />

      <textarea
        className="cron-expression"
        value={rawInput}
        onChange={handleRawInputChange}
        onFocus={handleRawInputFocus}
        onBlur={handleRawInputBlur}
        placeholder="CRON expression (e.g., */5 * * * *)"
      />

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;