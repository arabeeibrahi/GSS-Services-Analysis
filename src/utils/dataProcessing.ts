import Papa from 'papaparse';

export interface SRData {
  'Respond Result'?: string;
  'Respond Total Bus Hrs'?: string;
  'FL Region'?: string;
  'Original Severity'?: string;
  'Date Created'?: string;
  'Responded By'?: string;
  'Product Name'?: string;
  [key: string]: any;
}

export const parseCSV = (file: File): Promise<SRData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as SRData[]),
      error: (error) => reject(error)
    });
  });
};

export const getWeekLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  const weekNum = Math.ceil(date.getDate() / 7);
  const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  return `${monthYear} W${weekNum}`;
};

export const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};
