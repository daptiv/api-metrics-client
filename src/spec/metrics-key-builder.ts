import { MetricsKeyBuilder } from '../metrics-key-builder';
import { RouteSpec } from 'restify';

try {
describe('MetricsKeyBuilder', () => {
    let builder: MetricsKeyBuilder;

    beforeEach(() => {
        builder = new MetricsKeyBuilder();
    });
    describe('fromUrl', () => {
        it('should convert .\'s to underscores', () => {
            expect(builder.fromUrl('http://daptiv.com/page.html.tmpl')).toEqual('page_html_tmpl');
        });

        it('should convert /\'s to .\'s', () => {
            expect(builder.fromUrl('http://daptiv.com/deep/resource/here')).toEqual('deep.resource.here');
        });

        it('should strip query strings', () => {
            expect(builder.fromUrl('https://daptiv.io/users/123.456/tasks?start=12345')).toEqual('users.123_456.tasks');
        });
    });

    describe('fromRouteSpec', () => {
        let routeSpec: RouteSpec;

        beforeEach(() => {
            routeSpec = {
                path: '/tasks',
            method: null,
            versions: [],
            name: 'routeHandlerName'
            };
        });

        it('should return empty string when routeSpec is null', () => {
            expect(builder.fromRouteSpec(null)).toEqual('');
        });

        it('should remove the leading / before processing path', () => {
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks');
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks_flagged');
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks_flagged');
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks.flagged');
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            expect(builder.fromRouteSpec(routeSpec)).toEqual('tasks.get');
        });

        describe('when path is a regular expression', () => {
            const prefix = 'regex.';
            let setPath = (regExpPath: RegExp) => {
                routeSpec.path = <any>regExpPath;
            };
            it(`should prepend key with '${prefix}'`, () => {
                setPath(/path/);

                let key = builder.fromRouteSpec(routeSpec);

                expect(key.startsWith(prefix)).toBeTruthy(`"${key}" should start with "${prefix}"`);
            });
            it('should strip / from start and end of expression', () => {
                setPath(/path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'path';
                expect(key).toEqual(expected);
            });

            it('should trim leading /', () => {
                setPath(/\/some\/test\/path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'some.test.path';
                expect(key).toEqual(expected);
            });

            it('should trim trailing /', () => {
                setPath(/some\/test\/path\//);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'some.test.path';
                expect(key).toEqual(expected);
            });

            it('should convert \\/ in pattern to .', () => {
                setPath(/test\/path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'test.path';
                expect(key).toEqual(expected);
            });

            it('should convert \\. in pattern to _', () => {
                setPath(/test\.path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'test_path';
                expect(key).toEqual(expected);
            });

            it('should convert . (any one character symbol) in pattern to _', () => {
                setPath(/test.ed\.path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'test_ed_path';
                expect(key).toEqual(expected);
            });

            it('should convert : in pattern to _', () => {
                setPath(/test:path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'test_path';
                expect(key).toEqual(expected);
            });

            it('should convert other escaped characters (not including \\/) in pattern to _', () => {
                setPath(/test\wthis\/path/);

                let key = builder.fromRouteSpec(routeSpec);
                let expected = prefix + 'test_this.path';
                expect(key).toEqual(expected);
            });

            it('should convert any non-alphanumeric character (not including / ) to _', () => {
                setPath(/v1\/[Tt]est(this)?\/path\/:param/);

                let key = builder.fromRouteSpec(routeSpec);

                let expected = prefix + 'v1._Tt_est_this__.path._param';
                expect(key).toEqual(expected);
            });
        });
    });

});
} catch (e) {
    console.log(e);
}
