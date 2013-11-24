'use strict';

angular.module('common.providers', [], function($provide) {
    $provide.factory('appMoment', function($window) {
        return $window.moment;
    });
});