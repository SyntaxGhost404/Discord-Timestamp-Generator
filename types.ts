
export interface TimestampFormat {
    char: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';
    name: string;
    description: string;
}

export interface TimestampSuggestion {
    date: Date;
    format: TimestampFormat;
}
