var gulp = require('gulp');
//var gutil = require('gulp-util');
//var bower = require('bower');
var concat = require('gulp-concat');
//var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
//var sh = require('shelljs');

var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var nib = require('nib');
var jsmin = require('gulp-jsmin');
var concat = require('gulp-concat');


var paths = {
  sass: ['./scss/**/*.scss']
};

/* ------------- Tareas de template -------------*/
//Minifar Js Template

gulp.task('app-level-js', function() {
  gulp.src([
      './www/js/theme/app.js',
      // './www/js/theme/controllers/main.js',
      //'./www/js/theme/services.js',
      './www/js/theme/templates.js'
    ])
    .pipe(concat('app.level.min.js'))
    .pipe(jsmin())
    .pipe(gulp.dest('./www/js/theme/dist'));
});

gulp.task('template-modules-js', function() {
  gulp.src([
      './www/js/theme/modules/template.js',
      './www/js/theme/modules/ui.js',
      './www/js/theme/modules/charts/flot.js',
      './www/js/theme/modules/charts/other-charts.js',
      './www/js/theme/modules/form.js',
      './www/js/theme/modules/media.js',
      './www/js/theme/modules/components.js',
      './www/js/theme/modules/calendar.js'
    ])
    .pipe(concat('template.modules.min.js'))
    .pipe(jsmin())
    .pipe(gulp.dest('./www/js/theme/dist'));
});

gulp.task('library-bower-js', function() {
  gulp.src([
      //'../../public/library/bower_components/jquery/dist/jquery.min.js',
      // '../public/library/bower_components/angular/angular.min.js',
      '../../public/library/bower_components/angular-animate/angular-animate.min.js',
      '../../public/library/bower_components/angular-resource/angular-resource.min.js',
      '../../public/library/bower_components/angular-ui-router/release/angular-ui-router.min.js',
      '../../public/library/bower_components/angular-loading-bar/src/loading-bar.js',
      //'../../public/library/bower_components/oclazyload/dist/ocLazyLoad.min.js',
      '../../public/library/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      //'../../public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
      '../../public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.min.js',
      '../../public/library/bower_components/Waves/dist/waves.min.js',
      '../../public/library/bootstrap-growl/bootstrap-growl.min.js',
      '../../public/library/bower_components/ng-table/dist/ng-table.min.js',
      '../../public/library/bower_components/flot/jquery.flot.js',
      // '../../public/library/bower_components/flot.curvedlines/curvedLines.js',
      '../../public/library/bower_components/flot/jquery.flot.resize.js',
      '../../public/library/bower_components/moment/min/moment.min.js',
      '../../public/library/bower_components/fullcalendar/dist/fullcalendar.min.js',
      '../../public/library/bower_components/flot-orderBars/js/jquery.flot.orderBars.js',
      //'../../public/library/bower_components/flot/jquery.flot.pie.js',
      //'../../public/library/bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js',
      '../../public/library/bower_components/angular-nouislider/src/nouislider.min.js'
    ])
    .pipe(concat('library.bower.min.js'))
    //.pipe(jsmin())
    .pipe(gulp.dest('./www/js/theme/dist'));
});

gulp.task('min-css-vendor', function() {
  gulp.src([
      '../../public/library/bower_components/animate.css/animate.min.css',
      '../../public/library/bower_components/material-design-iconic-font/dist/css/material-design-iconic-font.css',
      '../../public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.css',
      '../../public/library/bower_components/angular-loading-bar/src/loading-bar.css',
      '../../public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css'
    ])
    .pipe(minifyCss())
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('./www/css/theme/dist'));
});

// Preprocesa el css para las tablet
gulp.task('stylus-tablet', function() {
  gulp.src('./www/css/app/main.tablet.styl')
    .pipe(stylus({
      use: nib()
    }))
    .pipe(minifyCss())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./www/css/app'));
});

gulp.task('min-css-theme', function() {
  gulp.src([
      './www/css/theme/app.min.1.css',
      './www/css/theme/app.min.2.css',
      './www/css/theme/demo.css'
    ])
    .pipe(minifyCss())
    .pipe(concat('theme.min.css'))
    .pipe(gulp.dest('./www/css/theme/dist'));
});



/*gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});*/

gulp.task('watch', function() {
  gulp.watch(['./www/css/app/main.tablet.styl'], ['stylus-tablet']);
  gulp.watch([
    './www/css/theme/app.min.1.css',
    './www/css/theme/app.min.2.css',
    './www/css/theme/demo.css'
  ], ['min-css-theme']);
});

/*gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});*/


gulp.task('default', ['watch', 'app-level-js', 'template-modules-js', 'library-bower-js', 'min-css-vendor', 'min-css-theme', 'stylus-tablet']);