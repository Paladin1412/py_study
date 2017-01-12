var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var rootDir = "../";

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: rootDir
        }
    });


    gulp.watch(rootDir + '/**/*.html').on('change', reload);
    gulp.watch(rootDir + '/common/template/*.html').on('change', reload);


    //gulp.watch(rootDir + '**/*.js').on('change', reload);

    gulp.watch(rootDir + '/common/**/*.js').on('change', reload);
    gulp.watch(rootDir + '/module-advertiser/**/*.js').on('change', reload);
    gulp.watch(rootDir + '/module-creativity/**/*.js').on('change', reload);
    gulp.watch(rootDir + '/module-management/**/*.js').on('change', reload);
    gulp.watch(rootDir + '/module-advertisermanage/**/*.js').on('change', reload);


    gulp.watch(rootDir + '/**/*.less', ['compile-less']);
    //test
    gulp.watch(rootDir + '/less/_custome/*.less', ['compile-less']);
    //watch advertisermanage
    gulp.watch(rootDir + '/module-advertisermanage/less/*.less',['advertisermanage-compile-less']);

});

gulp.task('compile-less', function() {
    gulp.src(rootDir + '/less/*.less')
        .pipe(less())
        .pipe(gulp.dest(rootDir + '/css/'))
        .pipe(reload({ stream: true }))
});

gulp.task('advertisermanage-compile-less',function(){
    gulp.src(rootDir + '/module-advertisermanage/less/*.less')
        .pipe(less())
        .pipe(gulp.dest(rootDir + '/module-advertisermanage/css/'))
        .pipe(reload({stream : true}))
});
