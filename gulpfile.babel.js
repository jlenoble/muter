import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import jscs from 'gulp-jscs';
import sourcemaps from 'gulp-sourcemaps';
import del from 'del';
import path from 'path';

const buildDir = 'build';
const srcGlob = 'src/muter.js';
const testGlob = 'test/**/*.js';

const build = () => {
  return gulp.src([srcGlob, testGlob], {base: process.cwd()})
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'));
};

const test = () => {
  return gulp.src(path.join(buildDir, testGlob))
    .pipe(mocha());
};

const dist = () => {
  return gulp.src(srcGlob)
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(babel())
    .pipe(gulp.dest('.'));
};

const clean = () => {
  return del(buildDir);
};

gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('test', gulp.series('build', test));
gulp.task('dist', dist);
gulp.task('prepublish', gulp.series('test', 'clean', 'dist'));
gulp.task('default', gulp.parallel('test'));
