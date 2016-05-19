var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    tsProj = ts.createProject('tsconfig.json'),
    jasmine = require('gulp-jasmine'),
    plumber = require('gulp-plumber'),
    tsconfig = require('./tsconfig.json'),
    outDir = tsconfig.compilerOptions.outDir || 'dist',
    testPattern = 'dist/**/spec/*.js';

gulp.task('copy:typings', () => {
    return gulp
        .src('src/**/*.d.ts')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['copy:typings'], () => {
    return tsProj
        .src()
        .pipe(ts(tsProj))
        .pipe(gulp.dest(outDir));
});

gulp.task('test', ['build'], () => {
    gulp.src(testPattern)
        .pipe(jasmine());
});

gulp.task('test:watch', ['build'], () => {
    gulp.src(testPattern)
        .pipe(plumber({ errorHandler: () => {} }))
        .pipe(jasmine());
});

gulp.task('watch', () => {
    gulp.start('test:watch');
    gulp.watch('src/**/*.ts', ['test:watch']);
});
