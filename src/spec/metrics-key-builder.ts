import { MetricsKeyBuilder } from '../metrics-key-builder';
import { RouteSpec } from 'restify';

try {
describe('MetricsKeyBuilder', () => {
    let builder: MetricsKeyBuilder;

    beforeEach(() => {
        builder = new MetricsKeyBuilder();
    });

    describe('fromUrlAndStatus', () => {
        it('should convert .\'s to underscores', () => {
            expect(builder.fromUrlAndStatus('http://daptiv.com/page.html.tmpl')).toEqual('page_html_tmpl');
        });

        it('should convert /\'s to .\'s', () => {
            expect(builder.fromUrlAndStatus('http://daptiv.com/deep/resource/here')).toEqual('deep.resource.here');
        });

        it('should strip query strings', () => {
            expect(builder.fromUrlAndStatus('https://daptiv.io/users/123.456/tasks?start=12345')).toEqual('users.123_456.tasks');
        });

        it('should append statusCode if it exists', () => {
            expect(builder.fromUrlAndStatus('http://daptiv.com/page.html.tmpl', 200)).toEqual('page_html_tmpl.200');
        });

        it('should not append statusCode if it does not exist', () => {
            expect(builder.fromUrlAndStatus('http://daptiv.com/page.html.tmpl')).toEqual('page_html_tmpl');
        });
    });

    describe('fromRouteSpecAndStatus', () => {
        let routeSpec: RouteSpec;
        const statusCode: number = 200;

        beforeEach(() => {
            routeSpec = {
                path: '/tasks',
            method: null,
            versions: [],
            name: 'routeHandlerName'
            };
        });

        it('should return empty string when routeSpec is null', () => {
            expect(builder.fromRouteSpecAndStatus(null, statusCode)).toEqual('');
        });

        it('should remove the leading / before processing path', () => {
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks.${statusCode}`);
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks_flagged.${statusCode}`);
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks_flagged.${statusCode}`);
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks.flagged.${statusCode}`);
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks.get.${statusCode}`);
        });

        it('should append statusCode if it exists', () => {
            expect(builder.fromRouteSpecAndStatus(routeSpec, statusCode)).toEqual(`tasks.${statusCode}`);
        });

        it('should not append statusCode if it does not exist', () => {
             expect(builder.fromRouteSpecAndStatus(routeSpec)).toEqual(`tasks`);
        });

        describe('when path is a regular expression', () => {
            const prefix = 'regex.';
            let setPath = (regExpPath: RegExp) => {
                routeSpec.path = <any>regExpPath;
            };
            it(`should prepend key with '${prefix}'`, () => {
                setPath(/path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec);

                expect(key.startsWith(prefix)).toBeTruthy(`"${key}" should start with "${prefix}"`);
            });
            it('should strip / from start and end of expression', () => {
                setPath(/path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should trim leading /', () => {
                setPath(/\/some\/test\/path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'some.test.path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should trim trailing /', () => {
                setPath(/some\/test\/path\//);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'some.test.path.'  + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert \\/ in pattern to .', () => {
                setPath(/test\/path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'test.path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert \\. in pattern to _', () => {
                setPath(/test\.path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'test_path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert . (any one character symbol) in pattern to _', () => {
                setPath(/test.ed\.path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'test_ed_path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert : in pattern to _', () => {
                setPath(/test:path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'test_path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert other escaped characters (not including \\/) in pattern to _', () => {
                setPath(/test\wthis\/path/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);
                let expected = prefix + 'test_this.path.' + statusCode;
                expect(key).toEqual(expected);
            });

            it('should convert any non-alphanumeric character (not including / ) to _', () => {
                setPath(/v1\/[Tt]est(this)?\/path\/:param/);

                let key = builder.fromRouteSpecAndStatus(routeSpec, statusCode);

                let expected = prefix + 'v1._Tt_est_this__.path._param.'  + statusCode;
                expect(key).toEqual(expected);
            });
        });

    });

});
} catch (e) {
    console.log(e);
}
