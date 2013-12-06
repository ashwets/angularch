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
            };

            _.each(_.keys(priorities), function (method) {
                if (priorities[appConfig.LOGGING_LEVEL] >= priorities[method]) {
                    $delegate[method] = decorateLogger($delegate[method]);
                } else {
                    $delegate[method] = function () {};
                }
                $delegate[method].logs = []; // for angular-mocks
            });

            function decorateLogger(originalFn) {
                return function () {
                    var args = Array.prototype.slice.call(arguments);
                    // inject datatime for example
                    args.unshift(new Date().toISOString());
                    originalFn.apply(null, args);
                };
            }

            return $delegate;
        });
    });