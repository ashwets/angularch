'use strict';

angular.module('lib.logging', [])
    .config(function ($provide, appConfig) {
        $provide.decorator('$log', function($delegate) {
            var priorities = {
                    error: 0,
                    warn: 1,
                    info: 2,
                    log: 2,
                    debug: 3
                },
                levelGetter = function () {
                    return appConfig.LOGGING_LEVEL || 'error';
                };

            _.each(_.keys(priorities), function (method) {
                $delegate[method] = decorateLogger(method, $delegate[method]);
                $delegate[method].logs = []; // for angular-mocks
            });

            $delegate.setLevelGetter = function (getter) {
                levelGetter = getter;
            };

            $delegate.getLevelGetter = function () {
                return levelGetter;
            };

            function decorateLogger(method, originalFn) {
                return function () {
                    var level = levelGetter();

                    if (priorities[level] >= priorities[method]) {
                        var args = Array.prototype.slice.call(arguments);
                        // inject datatime for example
                        args.unshift(new Date().toISOString());
                        originalFn.apply(null, args);
                    }
                };
            }

            return $delegate;
        });
    })
    .run(function ($log, $cookies) {
        var origLevelGetter = $log.getLevelGetter();
        $log.setLevelGetter(function () {
            return $cookies.loggingLevel || origLevelGetter();
        });
    });