import { ApiStatKeyBuilder } from '../api-stat-key-builder';
import { RouteSpec } from 'restify';

describe('api-stat-key-builder', () => {
    let statKeyBuilder: ApiStatKeyBuilder;

    describe('fromRouteSpec', () => {
        let routeSpec: RouteSpec;
        const statusCode: number = 400;

        beforeEach(() => {
            statKeyBuilder = new ApiStatKeyBuilder();

            routeSpec = {
                path: '/tasks',
                method: 'PUT',
                versions: [],
                name: 'routeHandlerName'
            };
        });

        it('should return empty string when routeSpec is null', () => {
            expect(statKeyBuilder.fromRouteSpec(null, statusCode)).toEqual('');
        });

        it('should remove the leading / before processing path', () => {
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks.put.failure.4xx');
        });

        it('should convert . in path to _', () => {
            routeSpec.path = '/tasks.flagged';
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks_flagged.put.failure.4xx');
        });

        it('should convert : in path to _', () => {
            routeSpec.path = '/tasks:flagged';
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks_flagged.put.failure.4xx');
        });

        it('should convert / in path to .', () => {
            routeSpec.path = '/tasks/flagged';
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks.flagged.put.failure.4xx');
        });

        it('should append lowercased method when method is defined', () => {
            routeSpec.method = 'GET';
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks.get.failure.4xx');
        });

        it('should append statusCode if it exists', () => {
            expect(statKeyBuilder.fromRouteSpec(routeSpec, statusCode)).toEqual('tasks.put.failure.4xx');
        });

        it('should not append statusCode if it does not exist', () => {
             expect(statKeyBuilder.fromRouteSpec(routeSpec, null)).toEqual('tasks.put.failure.unknown');
        });

        describe('when path is a regular expression', () => {
            const prefix = 'regex.';
            let setPath = (regExpPath: RegExp) => {
                routeSpec.path = <any>regExpPath;
            };

            it(`should prepend key with '${prefix}'`, () => {
                setPath(/path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, null);

                expect(key.startsWith(prefix)).toBeTruthy(`"${key}" should start with "${prefix}"`);
            });
            
            it('should strip / from start and end of expression', () => {
                setPath(/path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.path.put.failure.4xx');
            });

            it('should trim leading /', () => {
                setPath(/\/some\/test\/path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.some.test.path.put.failure.4xx');
            });

            it('should trim trailing /', () => {
                setPath(/some\/test\/path\//);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.some.test.path.put.failure.4xx');
            });

            it('should convert \\/ in pattern to .', () => {
                setPath(/test\/path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.test.path.put.failure.4xx');
            });

            it('should convert \\. in pattern to _', () => {
                setPath(/test\.path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.test_path.put.failure.4xx');
            });

            it('should convert . (any one character symbol) in pattern to _', () => {
                setPath(/test.ed\.path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.test_ed_path.put.failure.4xx');
            });

            it('should convert : in pattern to _', () => {
                setPath(/test:path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.test_path.put.failure.4xx');
            });

            it('should convert other escaped characters (not including \\/) in pattern to _', () => {
                setPath(/test\wthis\/path/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);
                expect(key).toEqual('regex.test_this.path.put.failure.4xx');
            });

            it('should convert any non-alphanumeric character (not including / ) to _', () => {
                setPath(/v1\/[Tt]est(this)?\/path\/:param/);

                let key = statKeyBuilder.fromRouteSpec(routeSpec, statusCode);

                expect(key).toEqual('regex.v1._Tt_est_this__.path._param.put.failure.4xx');
            });
        });

    });

});
