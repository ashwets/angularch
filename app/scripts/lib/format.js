'use strict';

angular.module('lib.format', [])
    .filter('checkmark', function() {
        return function(input) {
            return input ? '\u2713' : '\u2718';
        }
    });