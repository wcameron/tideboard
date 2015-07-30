'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function() {

  var bundler = browserify({
    entries: ['./client/js/app.js'],
    debug: true
  });

  var bundle = function() {
    return bundler
      .bundle()
      .on('error', function (err) {
            console.log(err.toString());
            this.emit("end");
        })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./client/build/'));
  };

  return bundle();
});
