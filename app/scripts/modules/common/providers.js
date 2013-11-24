'use strict';

angular.module('common.providers', [])
    .factory('appMoment', function($window) {
        return $window.moment;
    });