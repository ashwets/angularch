'use strict';

angular.module('campaigns.resources', ['ngResource'])
    .factory('Campaign', ['$resource',
        function ($resource) {
             return $resource('/api/campaigns/:id', {id: '@id'});
        }
    ]);

