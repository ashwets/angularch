// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    var distDir = 'dist/scripts/';

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'app/bower_components/jquery/jquery.js',
            'app/bower_components/jquery-ui/ui/jquery-ui.js',
            'app/bower_components/autoNumeric/autoNumeric.js',
            'app/bower_components/moment/moment.js',
            'app/bower_components/pines-notify/jquery.pnotify.js',
            'app/bower_components/select2/select2.js',
            'app/bower_components/bootstrap-sass/js/tooltip.js',
            'app/bower_components/bootstrap-sass/js/popover.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-gettext/dist/angular-gettext.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-moment/angular-moment.js',
            'app/bower_components/angular-pines-notify/src/pnotify.js',
            'app/bower_components/angular-ui-bootstrap/src/pagination/pagination.js',
            'app/bower_components/angular-ui-date/src/date.js',
            'app/bower_components/angular-ui-router/release/angular-ui-router.js',
            'app/bower_components/angular-ui-select2/src/select2.js',
            'app/scripts/lib/**/*.js',
            'app/scripts/modules/**/*.js',
            'app/app.js',
            'app/routing.js',
            'app/mock.js',
            'test/mock/**/*.js',
            'test/spec/**/*.js'
        ],
        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8083,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Firefox'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
