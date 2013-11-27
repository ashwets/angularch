'use strict';

angular.module('common.resources', ['lib.resources'])
    .factory('Auth', ['appResource',
        function (appResource) {
            return appResource('auth');
        }
    ]);