import { useState } from 'react';
import { ScheduleEditor } from './components/editor/ScheduleEditor';
import './App.css';

function App() {
  const [cronExpression, setCronExpression] = useState('*/5 * * * *');
  const [error, setError] = useState('');

  // Handle cron expression change
  const handleCronChange = (cron: string | string[]) => {
    try {
      // Handle both string and array return types
      const formattedCron = Array.isArray(cron) ? cron.join('\n') : cron;
      setCronExpression(formattedCron);
      setError('');
    } catch (err) {
      setError('Error generating CRON expression: ' + (err as Error).message);
    }
  };

  return (
    <div className="app-container">
      <h1>Cron Schedule Editor</h1>

      <ScheduleEditor onCronChange={handleCronChange} />

      <textarea
        className="cron-expression"
        value={cronExpression}
        onChange={(e) => setCronExpression(e.target.value)}
        placeholder="CRON expression (e.g., */5 * * * *)"
      />

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;