const gulp = require("gulp");
const minify = require("gulp-minify");

gulp.task('minify', () => {
  return gulp.src('declare_mvc.js', { allowEmpty: true })
    .pipe(minify({noSource: true}))
    .pipe(gulp.dest('min'))
})

gulp.task('default', gulp.series(['minify']));
gulp.watch('*.js', gulp.series(['minify']));
