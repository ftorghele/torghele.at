/* jshint mocha: true */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var pkg = require('./../package.json');
var dirs = pkg['h5bp-configs'].directories;

var expectedFilesInArchiveDir = [
    pkg.name + '_v' + pkg.version + '.zip'
];

var expectedFilesInDistDir = [

    '.htaccess',
    '404.html',
    'apple-touch-icon.png',
    'browserconfig.xml',
    'crossdomain.xml',

    'css/', // for directories, a `/` character
            // should be included at the end
        'css/styles.css',

    'files/',
        'files/Master_Thesis_Torghele.pdf',

    'font/',
        'font/FontAwesome.otf',
        'font/fontawesome-webfont.eot',
        'font/fontawesome-webfont.svg',
        'font/fontawesome-webfont.ttf',
        'font/fontawesome-webfont.woff',

    'favicon.ico',
    'humans.txt',

    'img/',
        'img/api.jpg',
        'img/franz_torghele.jpg',
        'img/load.gif',
        'img/movlib.jpg',
        'img/snups.jpg',
        'img/stack.jpg',
        'img/thesis.jpg',
        'img/wtk.jpg',
        'img/bg/',
            'img/bg/pw_maze_black.png',
            'img/bg/slash_it.png',
            'img/bg/triangles.png',

    'index.html',

    'js/',
        'js/scripts.js',
        'js/vendor/',
            'js/vendor/jquery-' + pkg.devDependencies.jquery + '.min.js',
            'js/vendor/modernizr-2.6.2-respond-1.1.0.min.js',

    'robots.txt',
    'tile-wide.png',
    'tile.png'

];

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function checkFiles(directory, expectedFiles) {

    // Get the list of files from the specified directory
    var files = require('glob').sync('**/*', {
        'cwd': directory,
        'dot': true,      // include hidden files
        'mark': true      // add a `/` character to directory matches
    });

    // Check if all expected files are present in the
    // specified directory, and are of the expected type
    expectedFiles.forEach(function (file) {

        var ok = false;
        var expectedFileType = (file.slice(-1) !== '/' ? 'regular file' : 'directory');

        // If file exists
        if (files.indexOf(file) !== -1) {

            // Check if the file is of the correct type
            if (file.slice(-1) !== '/') {
                // Check if the file is really a regular file
                ok = fs.statSync(path.resolve(directory, file)).isFile();
            } else {
                // Check if the file is a directory
                // (Since glob adds the `/` character to directory matches,
                // we can simply check if the `/` character is present)
                ok = (files[files.indexOf(file)].slice(-1) === '/');
            }

        }

        it('"' + file + '" should be present and it should be a ' + expectedFileType, function () {
            assert.equal(true, ok);
        });

    });

    // List all files that should be NOT
    // be present in the specified directory
    (files.filter(function (file) {
        return expectedFiles.indexOf(file) === -1;
    })).forEach(function (file) {
        it('"' + file + '" should NOT be present', function () {
            assert(false);
        });
    });

}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function runTests() {

    describe('Test if all the expected files, and only them, are present in the build directories', function () {

        describe(dirs.archive, function () {
            checkFiles(dirs.archive, expectedFilesInArchiveDir);
        });

        describe(dirs.dist, function () {
            checkFiles(dirs.dist, expectedFilesInDistDir);
        });

    });

}

runTests();
