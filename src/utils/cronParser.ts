import { type ScheduleType } from '../components/editor/ScheduleEditor';

export const WEEKDAY_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
};

export const MONTH_MAP: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12
};

export function expandRange(expr: string, map: Record<string, number>): string {
  if (!expr.includes('-')) return expr;
  const [start, end] = expr.split('-');
  const keys = Object.keys(map);
  const startIdx = keys.indexOf(start);
  const endIdx = keys.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return expr;
  const range = keys.slice(startIdx, endIdx + 1).map(k => map[k]);
  return range.join(',');
}

export function normalizeCronField(field: string, type: 'weekday' | 'month'): string {
  if (type === 'weekday') {
    field = field.replace(/([A-Z]{3})-([A-Z]{3})/g, (_, a, b) => expandRange(`${a}-${b}`, WEEKDAY_MAP));
    field = field.replace(/[A-Z]{3}/g, (d) => WEEKDAY_MAP[d].toString());
    field = field.replace(/(\d)-(\d)/g, (_, a, b) => {
      const start = parseInt(a, 10), end = parseInt(b, 10);
      if (start <= end && start >= 0 && end <= 6) {
        return Array.from({length: end - start + 1}, (_, i) => (start + i)).join(',');
      }
      return `${a}-${b}`;
    });
  } else if (type === 'month') {
    field = field.replace(/([A-Z]{3})-([A-Z]{3})/g, (_, a, b) => expandRange(`${a}-${b}`, MONTH_MAP));
    field = field.replace(/[A-Z]{3}/g, (m) => MONTH_MAP[m].toString());
    field = field.replace(/(\d{1,2})-(\d{1,2})/g, (_, a, b) => {
      const start = parseInt(a, 10), end = parseInt(b, 10);
      if (start <= end && start >= 1 && end <= 12) {
        return Array.from({length: end - start + 1}, (_, i) => (start + i)).join(',');
      }
      return `${a}-${b}`;
    });
  }
  return field;
}

function expandAndValidate(values: string, min: number, max: number, label: string): number[] | string {
  const arr = values.split(',').map(v => v.trim());
  for (const v of arr) {
    if (!/^\d+$/.test(v)) return `Invalid ${label}`;
    const n = parseInt(v, 10);
    if (n < min || n > max) return `${label} must be between ${min} and ${max}`;
  }
  return arr.map(v => parseInt(v, 10));
}

export function cleanNumericValue(value: string): string {
  return value.replace(/^0+/, '') || '0';
}

// Convert consecutive numbers to ranges, using hyphen for 3+ consecutive numbers
export function convertToRanges(values: number[]): string {
  if (!values || values.length === 0) return '*';
  
  // For very small non-sequential arrays, just use comma-separated values
  if (values.length <= 2) {
    return values.sort((a, b) => a - b).join(',');
  }
  
  const sortedValues = [...values].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sortedValues[0];
  let rangeEnd = rangeStart;
  let currentRange: number[] = [rangeStart];
  
  for (let i = 1; i < sortedValues.length; i++) {
    if (sortedValues[i] === rangeEnd + 1) {
      // Consecutive number, extend the current range
      rangeEnd = sortedValues[i];
      currentRange.push(rangeEnd);
    } else {
      // Non-consecutive, finish the current range and start a new one
      if (currentRange.length >= 3) {
        // For 3+ consecutive numbers, use range notation
        ranges.push(`${rangeStart}-${rangeEnd}`);
      } else {
        // For 1-2 consecutive numbers, use comma notation
        ranges.push(currentRange.join(','));
      }
      
      rangeStart = rangeEnd = sortedValues[i];
      currentRange = [rangeStart];
    }
  }
  
  // Handle the last range
  if (currentRange.length >= 3) {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  } else {
    ranges.push(currentRange.join(','));
  }
  
  return ranges.join(',');
}

export function formatMonths(months: number[]): string {
  if (!months || months.length === 0) return '*';
  
  const rangeString = convertToRanges(months);
  
  return rangeString.replace(/(\d+)-(\d+)/g, (_, start, end) => {
    const startMonth = Object.keys(MONTH_MAP).find(key => MONTH_MAP[key] === parseInt(start));
    const endMonth = Object.keys(MONTH_MAP).find(key => MONTH_MAP[key] === parseInt(end));
    if (startMonth && endMonth) {
      return `${startMonth}-${endMonth}`;
    }
    return `${start}-${end}`;
  }).replace(/\b(\d+)\b/g, (_, num) => {
    const month = Object.keys(MONTH_MAP).find(key => MONTH_MAP[key] === parseInt(num));
    return month || num;
  });
}

export function formatWeekdays(days: number[]): string {
  if (!days || days.length === 0) return '*';
  
  const rangeString = convertToRanges(days);
  
  return rangeString.replace(/(\d+)-(\d+)/g, (_, start, end) => {
    const startDay = Object.keys(WEEKDAY_MAP).find(key => WEEKDAY_MAP[key] === parseInt(start));
    const endDay = Object.keys(WEEKDAY_MAP).find(key => WEEKDAY_MAP[key] === parseInt(end));
    if (startDay && endDay) {
      return `${startDay}-${endDay}`;
    }
    return `${start}-${end}`;
  }).replace(/\b(\d+)\b/g, (_, num) => {
    const day = Object.keys(WEEKDAY_MAP).find(key => WEEKDAY_MAP[key] === parseInt(num));
    return day || num;
  });
}

// Parse a day or month range, e.g. "1-5" to [1,2,3,4,5]
function expandCronRange(rangeStr: string): number[] {
  if (!rangeStr.includes('-')) {
    return [parseInt(rangeStr, 10)];
  }
  
  const [start, end] = rangeStr.split('-').map(n => parseInt(n, 10));
  if (isNaN(start) || isNaN(end) || start > end) {
    return [parseInt(rangeStr, 10)]; // Return as is if invalid range
  }
  
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// Parse comma-separated values with ranges, e.g. "1,3-5,7" to [1,3,4,5,7]
function expandCronDaysOrMonths(value: string): number[] {
  if (value === '*') return [];
  
  const parts = value.split(',');
  const result: number[] = [];
  
  for (const part of parts) {
    result.push(...expandCronRange(part));
  }
  
  return result;
}

export function parseCronType(cron: string): { type: ScheduleType | null, config: unknown, error?: string } {
  const lines = cron.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  if (lines.length > 1) {
    const dailyTimes: string[] = [];
    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length !== 5) return { type: null, config: null, error: 'Invalid CRON expression' };
      const [m, h, d, mo, w] = parts;
      if (d !== '*' || mo !== '*' || w !== '*') return { type: null, config: null, error: 'Only daily multi-time supported for multi-line' };

      const mins = expandAndValidate(m, 0, 59, 'Minute');
      const hours = expandAndValidate(h, 0, 23, 'Hour');
      if (typeof mins === 'string') return { type: null, config: null, error: mins };
      if (typeof hours === 'string') return { type: null, config: null, error: hours };

      for (const hour of hours) {
        for (const min of mins) {
          dailyTimes.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        }
      }
    }
    return { type: 'daily', config: { dailyTimes } };
  }

  const line = lines[0];
  const parts = line.split(/\s+/);
  if (parts.length !== 5) return { type: null, config: null, error: 'Invalid CRON expression' };
  // eslint-disable-next-line prefer-const
  let [m, h, d, mo, w] = parts;

  mo = normalizeCronField(mo, 'month');
  w = normalizeCronField(w, 'weekday');

  if (/^\*\/(\d+)$/.test(m) && h === '*' && d === '*' && mo === '*' && w === '*') {
    const minutes = parseInt(m.slice(2), 10);
    if (minutes < 1 || minutes > 59) return { type: null, config: null, error: 'Minutes interval must be between 1 and 59' };
    return { type: 'minutes', config: { minutes } };
  }

  if (/^[\d,]+$/.test(m) && /^[\d,]+$/.test(h) && d === '*' && mo === '*' && w === '*') {
    const mins = expandAndValidate(m, 0, 59, 'Minute');
    const hours = expandAndValidate(h, 0, 23, 'Hour');
    if (typeof mins === 'string') return { type: null, config: null, error: mins };
    if (typeof hours === 'string') return { type: null, config: null, error: hours };
    const dailyTimes: string[] = [];
    for (const hour of hours) {
      for (const min of mins) {
        dailyTimes.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      }
    }
    return { type: 'daily', config: { dailyTimes } };
  }

  if (/^\d+$/.test(m) && /^\d+$/.test(h) && d === '*' && mo === '*' && (w === '*' || /^[0-6](,[0-6])*$/.test(w))) {
    const min = parseInt(m, 10);
    const hour = parseInt(h, 10);
    if (min < 0 || min > 59) return { type: null, config: null, error: 'Minute must be between 0 and 59' };
    if (hour < 0 || hour > 23) return { type: null, config: null, error: 'Hour must be between 0 and 23' };
    if (w !== '*') {
      for (const idx of w.split(',')) {
        const day = parseInt(idx, 10);
        if (day < 0 || day > 6) return { type: null, config: null, error: 'Weekday must be between 0 (Sun) and 6 (Sat)' };
      }
    }
    const weekDays = [false, false, false, false, false, false, false];
    if (w !== '*') {
      w.split(',').forEach(idx => { weekDays[parseInt(idx, 10)] = true; });
    }
    return { type: 'weekly', config: { weeklyTime: `${h.padStart(2, '0')}:${m.padStart(2, '0')}`, weekDays } };
  }

  if (
    /^\d+$/.test(m) &&
    /^\d+$/.test(h) &&
    d !== '*' &&
    mo.split(',').every(x => /^\d{1,2}$/.test(x) && +x >= 1 && +x <= 12 || x.includes('-')) &&
    w === '*'
  ) {
    const min = parseInt(m, 10);
    const hour = parseInt(h, 10);
    if (min < 0 || min > 59) return { type: null, config: null, error: 'Minute must be between 0 and 59' };
    if (hour < 0 || hour > 23) return { type: null, config: null, error: 'Hour must be between 0 and 23' };
    
    // Parse day ranges like "1-5,10,15-20"
    const monthlyDays = expandCronDaysOrMonths(d);
    for (const day of monthlyDays) {
      if (isNaN(day) || day < 1 || day > 31) return { type: null, config: null, error: 'Day of month must be between 1 and 31' };
    }
    
    // Parse month ranges
    const monthlyMonths = expandCronDaysOrMonths(mo);
    for (const month of monthlyMonths) {
      if (isNaN(month) || month < 1 || month > 12) return { type: null, config: null, error: 'Month must be between 1 and 12' };
    }
    
    return { type: 'monthly', config: { monthlyTime: `${h.padStart(2, '0')}:${m.padStart(2, '0')}`, monthlyDays, monthlyMonths } };
  }

  // Monthly: "m h d[,d...] * *" (fallback for old config)
  if (/^\d+$/.test(m) && /^\d+$/.test(h) && d !== '*' && mo === '*' && w === '*') {
    const min = parseInt(m, 10);
    const hour = parseInt(h, 10);
    if (min < 0 || min > 59) return { type: null, config: null, error: 'Minute must be between 0 and 59' };
    if (hour < 0 || hour > 23) return { type: null, config: null, error: 'Hour must be between 0 and 23' };
    
    // Parse day ranges
    const monthlyDays = expandCronDaysOrMonths(d);
    for (const day of monthlyDays) {
      if (isNaN(day) || day < 1 || day > 31) return { type: null, config: null, error: 'Day of month must be between 1 and 31' };
    }
    return { type: 'monthly', config: { monthlyTime: `${h.padStart(2, '0')}:${m.padStart(2, '0')}`, monthlyDays, monthlyMonths: [1,2,3,4,5,6,7,8,9,10,11,12] } };
  }

  return { type: null, config: null, error: 'This CRON expression is not supported by the editor. Supported types: every X minutes (*/N * * * *), daily (m h * * *), weekly (m h * * w[,w...]), monthly (m h d[,d...] * *).' };
}