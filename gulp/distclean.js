import gulp from 'gulp';
import del from 'del';

import './clean';

export const distClean = () => {
  return del('lib');
};

gulp.task('distclean', gulp.parallel('clean', distClean));
