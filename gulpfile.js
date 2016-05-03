var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    tsProj = ts.createProject('tsconfig.json'),
    jasmine = require('gulp-jasmine'),
    plumber = require('gulp-plumber'),
    tsconfig = require('./tsconfig.json'),
    outDir = tsconfig.compilerOptions.outDir || 'dist';

function onError(error) {
    console.log(error);
}

gulp.task('build', () => {

    return tsProj
        .src()
        .pipe(plumber({ errorHandler: onError }))
        .pipe(ts(tsProj))
        .pipe(gulp.dest(outDir));
});

gulp.task('test', ['build'], () => {
    gulp.src('dist/**/spec/*.js')
        .pipe(plumber({ errorHandler: () => {} }))
        .pipe(jasmine());
});
gulp.task('watch', () => {
    gulp.start('test');
    gulp.watch('src/**/*.ts', ['test']);
});
