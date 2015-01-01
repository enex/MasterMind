// We need a bunch of dependencies, but they all do an important
// part of this workflow
var gulp         = require('gulp');
var source       = require('vinyl-source-stream');
var browserify   = require('browserify');
var watchify     = require('watchify');
var reactify     = require('reactify');
var gulpif       = require('gulp-if');
var uglify       = require('gulp-uglify');
var streamify    = require('gulp-streamify');
var notify       = require('gulp-notify');
var concat       = require('gulp-concat');
//var cssmin       = require('gulp-cssmin');
var gutil        = require('gulp-util');
var shell        = require('gulp-shell');
var livereload   = require('gulp-livereload');
var sourcemaps   = require('gulp-sourcemaps');
var buffer       = require('vinyl-buffer');
//var less         = require('gulp-less');
var path         = require('path');
var gutil        = require('gulp-util');
var fs           = require('fs');
var autoprefixer = require('gulp-autoprefixer');
var rename       = require('gulp-rename');
//var sftp       = require("gulp-sftp");

var libs = [
	"react",
	//"react-router",
	"promise"
	//"jsonld",
];

//copy the html to the build directory
gulp.task("html", function(){
	return gulp.src("./src/**/*.html")
		.pipe(gulp.dest("./build"));
});

//compile the styles
gulp.task("style", function(){
	//gulp.src("./src/**/main.less")
	/*	.pipe(sourcemaps.init())
		.pipe(less().on('error', gutil.log))
		.pipe(autoprefixer({
            browsers: ['last 3 versions'],
            cascade: false
        }))
		.pipe(sourcemaps.write("maps"))//save source maps in maps directory
		.pipe(gulp.dest('./build/style/'))
		//TODO: combine all fiels
		.pipe(livereload());
	//TODO: compress
	//TODO: make sourcemaps work
	*/
});

//build all vendor files
gulp.task("vendors", function(){
	var bundler = browserify({
		debug: false
	});

	libs.map(function(e){bundler.require(e);});//include externel dependencys

	bundler.bundle()
	.pipe(source('vendors.js'))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest("build"))
	.pipe(livereload());
});

//compile javascript
gulp.task("javascript", function(){
	gutil.log('Starting browserify');
	//es6ify.traceurOverrides = {experimental: true, asyncFunctions: true};

	var debug = true;
	var bundler = browserify({
		entries: ['./src/main.jsx'],
		transform: [reactify], // Convert JSX style
		debug: debug,

		//for watchify
		cache: {},
		packageCache: {},
		fullPaths: true
	});

	libs.map(function(e){bundler.external(e)});//add external dependency
	var rebundle = function () {
		console.log('Building APP bundle');
		bundler.bundle()
			.on('error', gutil.log)
			.pipe(source('main.js'))
			.pipe(buffer())
			.pipe(gulpif(!debug, uglify()))
			.pipe(gulp.dest("build"))
			.pipe(livereload());
	}
	//make it a watchify task
	bundler = watchify(bundler);
	bundler.on('update', rebundle);

	//TODO: compress output
	//TODO: save sourcemap external

	return rebundle();
})

//start livereload and watch
gulp.task("watch",function(){
	gulp.watch(["./src/**/*.html"], ["html"]);
	gulp.watch(["./src/**/*.json"], ["json"]);
	gulp.watch(["./src/**/*.css","./src/**/*.less"], ["style"]);
	//gulp.watch(["./build/**/*.js"], ["upload_js"]);
});

// Starts our development workflow
gulp.task('default', ["html","style","vendors","javascript","watch"], function () {
	var lrServer = livereload();//start the live reload server
	gulp.watch(['./build/**/*'], function(evt){
		lrServer.changed(evt.path);//watch the build directory and reload on change
	});
});

// Runs the test with phantomJS and produces XML files
// that can be used with f.ex. jenkins
gulp.task('test', function () {
	return gulp.src('./build/testrunner-phantomjs.html').pipe(jasminePhantomJs());
});

//TODO: add ftp upload
