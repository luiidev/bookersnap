
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    stylus = require('gulp-stylus'),
    nib = require('nib'),
    //gulpif = require('gulp-if');
    jsmin = require('gulp-jsmin'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename');


/* ------------- Tareas de template -------------*/
//Minifar Js Template
gulp.task('app-level-js', function () {
  gulp.src([
    'public/js/theme/app.js',
    'public/js/theme/config.js',
    'public/js/theme/controllers/main.js',
    'public/js/theme/services.js',
    'public/js/theme/controllers/ui-bootstrap.js',
    'public/js/theme/controllers/table.js',
    'public/js/theme/templates.js'])
  .pipe(concat('app.level.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('public/js/theme/dist'))
});

gulp.task('template-modules-js', function () {
  gulp.src([
    'public/js/theme/modules/template.js',
    'public/js/theme/modules/ui.js',
    'public/js/theme/modules/charts/flot.js',
    'public/js/theme/modules/charts/other-charts.js',
    'public/js/theme/modules/form.js',
    'public/js/theme/modules/media.js',
    'public/js/theme/modules/components.js',
    'public/js/theme/modules/calendar.js'])
  .pipe(concat('template.modules.min.js'))
  .pipe(jsmin())
  .pipe(gulp.dest('public/js/theme/dist'))
});

gulp.task('library-bower-js', function () {
  gulp.src([
    'public/library/bower_components/jquery/dist/jquery.min.js',
    'public/library/bower_components/angular/angular.min.js',
    'public/library/bower_components/angular-animate/angular-animate.min.js',
    'public/library/bower_components/angular-resource/angular-resource.min.js',
    'public/library/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'public/library/bower_components/angular-loading-bar/src/loading-bar.js',
    'public/library/bower_components/oclazyload/dist/ocLazyLoad.min.js',
    'public/library/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
    'public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.min.js',
    'public/library/bower_components/Waves/dist/waves.min.js',
    'public/library/bootstrap-growl/bootstrap-growl.min.js',
    'public/library/bower_components/ng-table/dist/ng-table.min.js',
    'public/library/bower_components/flot/jquery.flot.js',
    'public/library/bower_components/flot.curvedlines/curvedLines.js',
    'public/library/bower_components/flot/jquery.flot.resize.js',
    'public/library/bower_components/moment/min/moment.min.js',
    'public/library/bower_components/fullcalendar/dist/fullcalendar.min.js',
    'public/library/bower_components/flot-orderBars/js/jquery.flot.orderBars.js',
    'public/library/bower_components/flot/jquery.flot.pie.js',
    'public/library/bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js',
    'public/library/bower_components/angular-nouislider/src/nouislider.min.js'
    ])
  .pipe(concat('library.bower.min.js'))
  //.pipe(jsmin())
  .pipe(gulp.dest('public/js/theme/dist'))
});

gulp.task('min-css-vendor', function() {
    gulp.src([
        'public/library/bower_components/animate.css/animate.min.css',
        'public/library/bower_components/material-design-iconic-font/dist/css/material-design-iconic-font.css',
        'public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.css',
        'public/library/bower_components/angular-loading-bar/src/loading-bar.css',
        'public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css'
        ])
        .pipe(minifyCss())
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest('public/css/theme/dist'))
});

gulp.task('min-css-theme', function() {
    gulp.src([
        'public/css/theme/app.min.1.css',
        'public/css/theme/app.min.2.css',
        'public/css/theme/demo.css'
        ])
        .pipe(minifyCss())
        .pipe(concat('theme.min.css'))
        .pipe(gulp.dest('public/css/theme/dist'))
});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['app-level-js','template-modules-js','library-bower-js','min-css-vendor','min-css-theme']);