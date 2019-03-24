import gulp from 'gulp';
import babel from 'gulp-babel';

import sourcemaps from 'gulp-sourcemaps';

const buildDir = 'build';
const allSrcGlob = [
  'src/**/*.js',
  'test/**/*.js'
];

export const build = () => {
  return gulp.src(allSrcGlob, {
    base: process.cwd(),
    since: gulp.lastRun(build)
  })
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(buildDir));
};

gulp.task('build', build);
