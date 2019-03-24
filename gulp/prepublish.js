import gulp from 'gulp';

import './test';
import './distclean';
import './dist';
import './doc';

gulp.task('prepublish', gulp.series('test', 'distclean', 'dist', 'doc'));
