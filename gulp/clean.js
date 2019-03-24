import gulp from 'gulp';
import del from 'del';

export const clean = () => {
  return del('build');
};

gulp.task('clean', clean);
