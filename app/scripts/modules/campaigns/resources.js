'use strict';

angular.module('campaigns.resources', ['common.resources'])
    .factory('Campaign', ['appResource',
        function (appResource) {
            return appResource('campaigns');
        }
    ]);

