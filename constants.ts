
import { TimestampFormat } from './types';

export const TIMESTAMP_FORMATS: TimestampFormat[] = [
    { char: 'f', name: 'Short Date/Time', description: 'e.g., 29 September 2025 at 12:40' },
    { char: 'F', name: 'Long Date/Time', description: 'e.g., Monday 29 September 2025 at 12:40' },
    { char: 'R', name: 'Relative Time', description: 'e.g., in 2 hours' },
    { char: 'd', name: 'Short Date', description: 'e.g., 29/09/2025' },
    { char: 'D', name: 'Long Date', description: 'e.g., 29 September 2025' },
    { char: 't', name: 'Short Time', description: 'e.g., 12:40' },
    { char: 'T', name: 'Long Time', description: 'e.g., 12:40:00' },
];
