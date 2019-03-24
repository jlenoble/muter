import gulp from 'gulp';
import {usePlumbedGulpSrc} from 'plumb-gulp';
import autoreload from 'autoreload-gulp';

import './gulp/build';
import './gulp/clean';
import './gulp/distclean';
import './gulp/dist';
import './gulp/doc';
import './gulp/prepublish';
import './gulp/test';
import './gulp/tdd';
import './gulp/watch';
import './gulp/lint';

usePlumbedGulpSrc();

gulp.task('default', autoreload('tdd'));
