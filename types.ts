
export interface SavedEntry {
  id: number;
  content: string;
  wordCount: number;
  savedAt: number; // Stored as a timestamp
}

// FIX: Define and export missing types used across the application.
export type TimestampFormatChar = 'f' | 'F' | 'R' | 'd' | 'D' | 't' | 'T';

export interface TimestampFormat {
  char: TimestampFormatChar;
  name: string;
  description: string;
}

export interface TimestampSuggestion {
  date: Date;
  format: TimestampFormat;
}

export interface TimeApiResponse {
  conversionResult: {
    dateTime: string;
    time: string;
  };
}
