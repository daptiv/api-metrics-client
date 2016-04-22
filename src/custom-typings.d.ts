// restify ----

declare module 'restify' {
    interface RouteSpec {
        path: string;
        name: string;
        method: string;
        versions: string[];
    }
}

