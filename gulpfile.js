var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        stylus = require('gulp-stylus'),
        nib = require('nib'),
        //gulpif = require('gulp-if');
        jsmin = require('gulp-jsmin'),
        concat = require('gulp-concat'),
        minifyCss = require('gulp-minify-css'),
        rename = require('gulp-rename');

var env = "dev"; // [dev || dist]
var distributionApp = 'public/app/theme/js';
var distributionStyleApp = 'public/app/theme/css';

/* ------------- Tareas de template -------------*/
//Minifar Js Template
var filesAppLevelJs = [
    'public/js/theme/app.js',
    'public/js/theme/config.js',
    'public/js/theme/controllers/main.js',
    'public/js/theme/services.js',
    'public/js/theme/controllers/ui-bootstrap.js',
    'public/js/theme/controllers/table.js',
    'public/js/theme/templates.js'
];
var filenameAppLevelJs = "app.level.min.js";
gulp.task('app-level-js', function () {
    gulp.src(filesAppLevelJs)
            .pipe(concat(filenameAppLevelJs))
            //.pipe(jsmin())
            .pipe(gulp.dest(distributionApp));
});

var filesTemplateModulesJs = [
    'public/js/theme/modules/template.js',
    'public/js/theme/modules/ui.js',
    'public/js/theme/modules/charts/flot.js',
    'public/js/theme/modules/charts/other-charts.js',
    'public/js/theme/modules/form.js',
    'public/js/theme/modules/media.js',
    'public/js/theme/modules/components.js',
    'public/js/theme/modules/calendar.js'
];

var filenameTemplateModulesJs = "template.modules.min.js";
gulp.task('template-modules-js', function () {
    gulp.src(filesTemplateModulesJs)
            .pipe(concat(filenameTemplateModulesJs))
            //.pipe(jsmin())
            .pipe(gulp.dest(distributionApp));
});

var filesLibraryBowerJs = [
    'public/library/bower_components/jquery/dist/jquery.min.js',
    'public/library/bower_components/angular/angular.min.js',
    'public/library/bower_components/angular-locale/angular-locale_es-mx.min.js',
    'public/library/bower_components/angular-animate/angular-animate.min.js',
    'public/library/bower_components/angular-resource/angular-resource.min.js',
    'public/library/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'public/library/bower_components/angular-loading-bar/src/loading-bar.min.js', //--
    //'public/library/bower_components/oclazyload/dist/ocLazyLoad.min.js',
    'public/library/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
    'public/library/bower_components/ng-scrollbars/dist/scrollbars.min.js',
    'public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.min.js',
    'public/library/bower_components/Waves/dist/waves.min.js',
    'public/library/bootstrap-growl/bootstrap-growl.min.js',
    'public/library/bower_components/ng-table/dist/ng-table.min.js',
    'public/library/bower_components/flot/jquery.flot.min.js', //--
    'public/library/bower_components/flot.curvedlines/curvedLines.min.js', //--
    'public/library/bower_components/flot/jquery.flot.resize.min.js', //--
    'public/library/bower_components/moment/min/moment.min.js',
    'public/library/bower_components/moment/locale/es.js',
    'public/library/bower_components/fullcalendar/dist/fullcalendar.min.js',
    'public/library/bower_components/flot-orderBars/js/jquery.flot.orderBars.min.js', //--
    'public/library/bower_components/flot/jquery.flot.pie.min.js', //--
    'public/library/bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js',
    'public/library/bower_components/angular-nouislider/src/nouislider.min.js',
    'public/library/bower_components/angular-ui-router-title/angular-ui-router-title.js',
    'public/library/bower_components/jscolor/jscolor.js'
];
var filenameLibraryBowerJs = "library.bower.min.js";
gulp.task('library-bower-js', function () {
    gulp.src(filesLibraryBowerJs)
            .pipe(concat(filenameLibraryBowerJs))
            // .pipe(jsmin())
            .pipe(gulp.dest(distributionApp));
});


var FilesCssVendor = [
    'public/library/bower_components/animate.css/animate.min.css',
        'public/library/bower_components/material-design-iconic-font/dist/css/material-design-iconic-font.css',
        'public/library/bower_components/bootstrap-sweetalert/lib/sweet-alert.css',
        'public/library/bower_components/angular-loading-bar/src/loading-bar.css',
        'public/library/bower_components/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
        'public/library/bower_components/jquery-ui/themes/smoothness/jquery-ui.css',
];
var FilenameCssVendor = "vendor.min.css";
gulp.task('min-css-vendor', function () {
    gulp.src(FilesCssVendor)
            .pipe(minifyCss())
            .pipe(concat(FilenameCssVendor))
            .pipe(gulp.dest(distributionStyleApp));
});


var FilesCssTheme = [
    'public/css/theme/app.min.1.css',
        'public/css/theme/app.min.2.css',
        'public/css/theme/demo.css',
        'public/css/app/main.min.css'
];
var FilenameCssTheme = "theme.min.css";
gulp.task('min-css-theme', function () {
    gulp.src(FilesCssTheme)
            .pipe(minifyCss())
            .pipe(concat(FilenameCssTheme))
            .pipe(gulp.dest(distributionStyleApp));
});

var FilesMainApp = [
    'public/css/app/main.styl'
];
var FilenameMainApp = "main.min.css";
gulp.task('css-main-app', function () {
    gulp.src(FilesMainApp)
            .pipe(stylus({
                use: nib()
            }))
            .pipe(minifyCss())
            .pipe(concat(FilenameMainApp))
//            .pipe(rename({
//                suffix: '.min'
//            }))
            .pipe(gulp.dest(distributionStyleApp));
});

//Automatizamos esta tarea
gulp.task('watch', function () {
    gulp.watch(['public/css/app/main.styl'], ['css-main-app']);
    gulp.watch(['public/css/app/main.min.css'], ['min-css-theme']);
});

//ejecutamos el servidor y todos los archivos
gulp.task('default', ['watch', 'app-level-js', 'template-modules-js', 'library-bower-js', 'min-css-vendor', 'min-css-theme', 'css-main-app']);