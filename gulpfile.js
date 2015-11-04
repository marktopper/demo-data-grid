var gulp = require('gulp');
var gutil = require('gulp-util');
var elixir = require('laravel-elixir');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

elixir(function(mix) {

    // Copy any required assets to public
    mix.copy('resources/assets/images', 'public/images'),
    mix.copy('resources/assets/fonts', 'public/fonts'),
    mix.scripts([
        'jquery.js',
        'exoskeleton.min.js',
        'lodash.min.js',
        'data-grid.js',
        'material.min.js'
    ]),
    mix.sass('app.scss'),
    mix.browserSync({
        proxy: 'data-grid.dev'
    });


});


gulp.task('build', function() {

    // Scripts
    gulp.src([
        'vendor/cartalyst/data-grid/resources/assets/js/data-grid.js',
        'vendor/cartalyst/data-grid/resources/assets/js/exoskeleton.min.js',
        'vendor/cartalyst/data-grid/resources/assets/js/lodash.min.js',
        'node_modules/material-design-lite/dist/material.min.js',
    ])
    .pipe(gulp.dest('resources/assets/js/'));

    // Material Design Lite
    gulp.src('node_modules/material-design-lite/src/**/*.scss')
    .pipe(gulp.dest('resources/assets/sass/material-design-lite/'));

    // Material Design Icons
    gulp.src('node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*')
    .pipe(gulp.dest('resources/assets/font/'));

});
