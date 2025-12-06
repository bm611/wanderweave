import * as chrono from 'chrono-node';

export interface ParsedDate {
  year: number | null;
  month: number | null;
  startDate: Date | null;
  endDate: Date | null;
  originalText: string;
}

export const parseDate = (text: string): ParsedDate => {
  if (!text.trim()) {
    return { year: null, month: null, startDate: null, endDate: null, originalText: text };
  }

  const result = chrono.parse(text)[0];
  if (!result) {
    return { year: null, month: null, startDate: null, endDate: null, originalText: text };
  }

  const start = result.start.date();
  const end = result.end?.date() || start;

  return {
    year: result.start.get('year') ?? null,
    month: result.start.get('month') ?? null,
    startDate: start,
    endDate: end,
    originalText: text,
  };
};
