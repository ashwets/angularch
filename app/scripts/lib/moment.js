'use strict';

angular.module('lib.moment', [])
    .factory('appMoment', function($window) {
        return $window.moment;
    });