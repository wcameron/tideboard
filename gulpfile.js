'use strict';
// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');

gulp.task('default', function(){
    return bundle();
});

gulp.task('watch', function(){
    return bundle(true);
});

function bundle(watch) {
    var b;
    var opts;
    var browserifyOpts = {
        entries: ['./client/js/app.js'],
        debug: true
    };

    if (watch === true){
        opts = assign({}, watchify.args, browserifyOpts);
        b = watchify(browserify(opts));
        b.on('update', bundle); // on any dep update, runs the bundler
    } else {
        opts = browserifyOpts;
        b = browserify(opts);
    }

    b.on('log', gutil.log); // output build logs to terminal
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
            // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./client/build/'));
}
