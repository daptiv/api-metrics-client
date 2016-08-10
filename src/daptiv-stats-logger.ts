export interface StatsClient {
  timing(statKey: string, milliseconds: number, sample_rate?: number, tags?: string[]): void;

  increment(statKey: string, sample_rate?: number, tags?: string[]): void;
  incrementBy(statKey: string, value?: number, tags?: string[]): void;

  decrement(statKey: string, sample_rate?: number, tags?: string[]): void;
  decrementBy(statKey: string, value?: number, tags?: string[]): void;

  gauge(statKey: string, value: number, sample_rate?: number, tags?: string[]): void;

  histogram(statKey: string, value: number, sample_rate?: number, tags?: string[]): void;

  close(): void;
}

export interface DaptivStatsLoggerOpts {
    prefix?: string;
    globalTags?: string[];
    client: StatsClient;
}

export class DaptivStatsLogger {
    private client: StatsClient;
    private prefix: string;
    private globalTags: string[];

    constructor(options: DaptivStatsLoggerOpts) {
        this.prefix = this.sanitizeStatKey(options.prefix);
        if (!options.client) {
          throw new Error('Metrics will not be logged. No metrics client was provided to the DaptivStatsLogger');
        }
        this.client = options.client;
        this.globalTags = (options.globalTags || []).map(this.sanitizeStatKey);
    }

    timing(statKey: string, milliseconds: number, sampleRate?: number, tags?: string[]): void {
      this.client.timing(this.decorateStatName(statKey), milliseconds, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    increment(statKey: string, sampleRate?: number, tags?: string[]): void {
      this.client.increment(this.decorateStatName(statKey), sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    incrementBy(statKey: string, value?: number, tags?: string[]): void {
      this.client.incrementBy(this.decorateStatName(statKey), value, this.mergeWithGlobalTags(tags));
    }

    decrement(statKey: string, sampleRate?: number, tags?: string[]): void {
      this.client.decrement(this.decorateStatName(statKey), sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    decrementBy(statKey: string, value?: number, tags?: string[]): void {
      this.client.decrementBy(this.decorateStatName(statKey), value, this.mergeWithGlobalTags(tags));
    }

    gauge(statKey: string, value: number, sampleRate?: number, tags?: string[]): void {
      this.client.gauge(this.decorateStatName(statKey), value, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    histogram(statKey, value: number, sampleRate?: number, tags?: string[]): void {
      this.client.histogram(this.decorateStatName(statKey), value, sampleRate || 1, this.mergeWithGlobalTags(tags));
    }

    close(): void {
      this.client.close();
    }

    private mergeWithGlobalTags(tags: string[]): string[] {
      return tags
        ? this.globalTags.concat(tags.map(this.sanitizeStatKey))
        : this.globalTags;
    }

    private decorateStatName(statKey: string): string {
      let sanitizedStatKey = this.sanitizeStatKey(statKey);
      return !this.prefix
          ? sanitizedStatKey
          : `${this.prefix}.${sanitizedStatKey}`;
    }

    private sanitizeStatKey(statKey: string): string {
        if (!statKey) {
            return statKey;
        }
        return statKey.toLowerCase().replace(/[^a-z0-9\.]/g, '_');
    }
}
