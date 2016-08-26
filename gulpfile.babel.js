import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import jscs from 'gulp-jscs';
import sourcemaps from 'gulp-sourcemaps';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import del from 'del';
import path from 'path';

const originalSrc = gulp.src;
const plumbedSrc = function() {
  return originalSrc.apply(gulp, arguments)
    .pipe(plumber({
      errorHandler: function(err) {
        console.error(err);
        this.emit('end');
      }
    }));
};

const buildDir = 'build';
const distDir = 'lib';
const srcGlob = 'src/*.js';
const testSrcGlob = 'test/*.test.js';
const helperSrcGlob = 'test/*.help.js';

const allSrcGlob = [srcGlob, testSrcGlob, helperSrcGlob];
const testBuildGlob = path.join(buildDir, testSrcGlob);
const allBuildGlob = [
  path.join(buildDir, srcGlob),
  path.join(buildDir, testSrcGlob),
  path.join(buildDir, helperSrcGlob)
];

const build = () => {
  return plumbedSrc.call(gulp, allSrcGlob, {
    base: process.cwd(),
    since: gulp.lastRun(build)
  })
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildDir));
};

const testFuncs = new Map();
const test = (gulpSrc) => {
  var test = testFuncs.get(gulpSrc);
  if (!test) {
    test = () => gulpSrc.call(gulp, testBuildGlob).pipe(mocha());
    testFuncs.set(gulpSrc, test);
  }
  return test;
};

const watch = (done) => {
  gulp.watch(allSrcGlob, build);
  gulp.watch(allBuildGlob, test(plumbedSrc));
  done();
};

const dist = () => {
  return originalSrc.call(gulp, srcGlob)
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'))
    .pipe(babel())
    .pipe(gulp.dest(distDir));
};

const clean = () => {
  return del([buildDir, distDir]);
};

gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('test:build', gulp.series('build', test(plumbedSrc)));
gulp.task('test:dist', gulp.series('build', test(originalSrc)));

gulp.task('watch', watch);
gulp.task('tdd', gulp.series('test:build', 'watch'));

gulp.task('dist', dist);
gulp.task('prepublish', gulp.series('test:dist', 'clean', 'dist'));

gulp.task('default', gulp.parallel('tdd'));
