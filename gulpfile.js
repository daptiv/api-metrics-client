var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    tsProj = ts.createProject('tsconfig.json'),
    jasmine = require('gulp-jasmine'),
    plumber = require('gulp-plumber'),
    tsconfig = require('./tsconfig.json'),
    tslint = require('gulp-tslint'),
    outDir = tsconfig.compilerOptions.outDir || 'dist',
    testPattern = 'dist/**/spec/*.js';

var buildFailed = (buildName) => {
    return () => {
        process.on('exit', () => console.error(buildName, 'failed'));
        process.exitCode = 25;
    };
};

gulp.task('copy:typings', () => {
    return gulp
        .src('src/**/*.d.ts')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['tslint', 'copy:typings'], () => {
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

gulp.task('tslint', () => {
    return gulp
        .src(["./**/*.ts", "!./node_modules/**/*.ts", "!./dist/**/*.ts", "!./typings/**/*.ts"])
        .pipe(tslint())
        .pipe(tslint.report('verbose'))
        .on('error', buildFailed('tslint'));
});

gulp.task('watch', () => {
    gulp.start('test:watch');
    gulp.watch('src/**/*.ts', ['test:watch']);
});
