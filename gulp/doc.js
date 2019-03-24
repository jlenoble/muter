import gulp from 'gulp';
import md from 'markdown-include';
import replace from 'gulp-replace';
import rename from 'gulp-rename';
import wrap from 'gulp-wrap';

const docConf = 'markdown.json';
const examplesGlob = [
  'docs/examples/**/*.test.js'
];
const buildDir = 'build';

md.includePattern = /^#include\s"\/?((\w|-)+\/)*(\w|-)+(\.test)?\.md"/gm;

md.reset = function () {
  md.tableOfContents = '';
  md.build = {};
};

md.buildLink = function (title, _anchor) {
  const anchor = _anchor
    .replace(/\W+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-/, '')
    .replace(/-$/, '')
    .toLowerCase();

  return '[' + title + '](#' + anchor + ')\n';
};

export const doc = () => {
  md.reset();
  return md.compileFiles(docConf);
};

export const examples = () => {
  return gulp.src(examplesGlob, {
    base: process.cwd(),
    since: gulp.lastRun(examples),
  })
  .pipe(replace(/describe.*\n  it.*\n    /, ''))
  .pipe(replace(/\n  }\);\n}\);\n/, '\n'))
  .pipe(replace(/\n    /g, '\n'))
  .pipe(replace(/\.\.\/\.\.\/src\//g, ''))
  .pipe(replace(/import \{expect\} from 'chai';\n/g, ''))
  .pipe(replace(/expect\((.*)\).to.equal\((.*)\)/gm, '$1 === $2'))
  .pipe(replace(/expect\((.*)\).not.to.equal\((.*)\)/gm, '$1 !== $2'))
  .pipe(replace(/expect\((.*)\).to.be.(.*)/gm, '$1; // $2'))
  .pipe(replace(/expect\(\(\) => (.*)\).to.throw\(\)/gm, '$1; // throws'))
  .pipe(replace(/expect\(\(\) => (.*)\).not.to.throw\(\)/gm, `$1; // doesn't throw`))
  .pipe(replace(/(expect.*)\n?(  )?(.*;)/gm, '$1$3'))
  .pipe(replace(/expect\((.*)\).to.equal\((.*)\)/gm, '$1 === $2'))
  .pipe(replace(/expect\((.*)\).not.to.equal\((.*)\)/gm, '$1 !== $2'))
  .pipe(replace(/expect\((.*)\).to.be.(.*)/gm, '$1; // $2'))
  .pipe(replace(/expect\(\(\) => (.*)\).to.throw\(\)/gm, '$1; // throws'))
  .pipe(replace(/expect\(\(\) => (.*)\).not.to.throw\(\)/gm,
    `$1; // doesn't throw`))
  .pipe(wrap('```js\n<%= contents %>```', {}, {parse: false}))
  .pipe(rename({
    extname: '.md',
  }))
  .pipe(gulp.dest(buildDir));
};

gulp.task('doc', gulp.series(examples, doc));
