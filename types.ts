
export interface TimestampFormat {
    char: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';
    name: string;
    description: string;
}

export interface TimestampSuggestion {
    date: Date;
    format: TimestampFormat;
}

export interface TimeApiResponse {
    fromTimezone: string;
    fromDateTime: string;
    toTimeZone: string;
    conversionResult: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        seconds: number;
        milliSeconds: number;
        dateTime: string;
        date: string;
        time: string;
        timeZone: string;
        dstActive: boolean;
    };
}
