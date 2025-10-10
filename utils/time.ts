
import moment from 'moment';
import { TimestampFormat } from '../types';

// Configure Moment.js to better match Discord's relative time thresholds.
// Discord seems to switch from seconds to a minute at 45s, etc.
moment.relativeTimeThreshold('s', 59);
moment.relativeTimeThreshold('ss', 4); // "a few seconds ago" for 1-4 seconds
moment.relativeTimeThreshold('m', 59);
moment.relativeTimeThreshold('h', 23);
moment.relativeTimeThreshold('d', 29);
moment.relativeTimeThreshold('M', 11);

export const generateTimestampCode = (date: Date, formatChar: TimestampFormat['char']): string => {
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return `<t:${unixTimestamp}:${formatChar}>`;
};

export const generatePreview = (date: Date, formatChar: TimestampFormat['char']): string => {
    const m = moment(date);
    switch (formatChar) {
        case 't':
            return m.format('HH:mm');
        case 'T':
            return m.format('HH:mm:ss');
        case 'd':
            return m.format('DD/MM/YYYY');
        case 'D':
            return m.format('D MMMM YYYY');
        case 'f':
            return m.format('D MMMM YYYY [at] HH:mm');
        case 'F':
            return m.format('dddd, D MMMM YYYY [at] HH:mm');
        case 'R':
            // Moment.js fromNow() can say "a few seconds ago" for "now".
            // Discord shows "1 seconds ago". We'll replicate that quirk.
            const diff = moment().diff(m, 'seconds');
            if (Math.abs(diff) < 2) {
                return '1 seconds ago';
            }
            return m.fromNow();
        default:
            return '';
    }
};

export const parseTimestampCode = (code: string): Date | null => {
    const match = code.trim().match(/<t:(\d+)(?::\w)?>/);
    if (match && match[1]) {
        const unixTimestamp = parseInt(match[1], 10);
        // Unix timestamp is in seconds, Date wants milliseconds
        return new Date(unixTimestamp * 1000);
    }
    return null;
};
