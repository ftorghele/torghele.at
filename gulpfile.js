var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
                                              // them to the `plugins` object

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Archive tasks                                                     |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
        done);
});

// ---------------------------------------------------------------------
// | Copy tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('copy:misc', function () {
    return gulp.src([
        // Copy all files..
        dirs.src + '/**/*',
        // Except..
        '!' + dirs.src + '/css/*.css',
        '!' + dirs.src + '/js/*.js',
        '!' + dirs.src + '/img/*',
        '!' + dirs.src + '/index.html',
        '!' + dirs.src + '/{doc,doc/**}',
        '!' + dirs.src + '/{psd,psd/**}'
    ], {
        // Include hidden files by default
        dot: false
    }).pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:.htaccess', function () {
    return gulp.src('node_modules/apache-server-configs/dist/.htaccess')
        .pipe(plugins.replace(/# ErrorDocument/g, 'ErrorDocument'))
        .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(plugins.rename('jquery-' + pkg.devDependencies.jquery + '.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy', function (done) {
    runSequence(
        'copy:misc',
        'copy:.htaccess',
        'copy:jquery',
        done);
});

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('jshint', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(plugins.jscs())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('clean', function (done) {
    require('del')([
        dirs.archive,
        dirs.dist
    ], done);
});

// ---------------------------------------------------------------------
// | Optimization tasks                                                |
// ---------------------------------------------------------------------

gulp.task('images', function() {
    gulp.src(dirs.src + '/img/**/*')
        .pipe(plugins.changed(dirs.dist + '/img'))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(dirs.dist + '/img'));
});

gulp.task('minify', function () {
    var minifyInlineOptions = {
        js: false
    }
    return gulp.src(dirs.src + '/index.html')
        .pipe(plugins.usemin({
            css: [
                plugins.minifyCss(),
                plugins.rev(),
                'concat'
            ],
            html: [
                plugins.minifyInline(minifyInlineOptions),
                plugins.minifyHtml({ empty: true }),
                plugins.replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery)
            ],
            js: [
                plugins.stripDebug(),
                plugins.uglify()
            ]
        }))
        .pipe(gulp.dest(dirs.dist));
});

// ---------------------------------------------------------------------
// | Main tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('build', function (done) {
    runSequence('clean', 'copy', 'minify', 'images', done);
});

// default gulp task
gulp.task('default', ['build'], function() {
    // watch for HTML changes
    gulp.watch(dirs.src + '/*.html', ['minify']);

    // watch for JS changes
    gulp.watch(dirs.src + '/js/*.js', ['minify']);

    // watch for CSS changes
    gulp.watch(dirs.src + '/css/*.css', ['minify']);
});

