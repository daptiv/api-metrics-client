import { StatsDClient } from '../statsd-client';

describe('statsd', () => {
    let statsd;
    let statsdSpy;
    beforeEach(() => {
        statsdSpy = jasmine.createSpyObj('statsdSpy', ['timing', 'increment', 'gauge']);
        statsd = new StatsDClient({host: 'test.test.com', statsdClient: statsdSpy});
    });

    it('gauge should call through to statsd-client.gauge', () => {
        let key = 'test.key';
        let value = 29;

        statsd.gauge(key, value);

        expect(statsdSpy.gauge).toHaveBeenCalledWith(key, value);
    });

    it('increment should call through to statsd-client.increment', () => {
        let key = 'test.key';

        statsd.increment(key);

        expect(statsdSpy.increment).toHaveBeenCalledWith(key);
    });

    it('timing should call through to statsd-client.timing', () => {
        let key = 'test.key';
        let value = 37;

        statsd.timing(key, value);

        expect(statsdSpy.timing).toHaveBeenCalledWith(key, value);
    });

    describe('when prefix option is provided', () => {
        const prefix = 'env.prefix';
        beforeEach(() => {
            statsd = new StatsD({host: 'test.test.com', statsdClient: statsdSpy, prefix: prefix});
        });

        it('should lowercase prefix and replace all non-alphanumeric characters (or . ) with _', () => {
            let oddPrefix       = 'Environment.Prefix&format test';
            let formattedPrefix = 'environment.prefix_format_test';
            let key = 'my.key';

            statsd = new StatsD({host: 'test.test.com', statsdClient: statsdSpy, prefix: oddPrefix});
            statsd.increment(key);

            expect(statsdSpy.increment).toHaveBeenCalledWith(`${formattedPrefix}.${key}`);
        });

        it('counter should prefix key with env key', () => {
            let key = 'test.key';
            let value = 11;

            statsd.counter(key, value);

            expect(statsdSpy.counter).toHaveBeenCalledWith(`${prefix}.${key}`, value);
        });

        it('gauge should prefix key with env key', () => {
            let key = 'test.key';
            let value = 29;

            statsd.gauge(key, value);

            expect(statsdSpy.gauge).toHaveBeenCalledWith(`${prefix}.${key}`, value);
        });

        it('increment should prefix key with env key', () => {
            let key = 'test.key';

            statsd.increment(key);

            expect(statsdSpy.increment).toHaveBeenCalledWith(`${prefix}.${key}`);
        });

        it('timing should prefix key with env key', () => {
            let key = 'test.key';
            let value = 37;

            statsd.timing(key, value);

            expect(statsdSpy.timing).toHaveBeenCalledWith(`${prefix}.${key}`, value);
        });
    });
});
