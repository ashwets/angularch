'use strict';

angular.module('campaigns.resources', ['common.resources'])
    .factory('Campaign', ['appResource',
        function ($resource) {
             return $resource('campaigns');
        }
    ]);

