var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    tsProj = ts.createProject('tsconfig.json'),
    jasmine = require('gulp-jasmine');

gulp.task('build', () => {
    gulp.src('src/**/*.ts')
        .pipe(ts(tsProj))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', () => {
    gulp.src('dist/**/spec/*.js')
        .pipe(jasmine());
});

