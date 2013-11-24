'use strict';

angular.module('campaigns.resources', ['common.resources', 'common.providers'])
    .factory('Campaign', ['appResource', 'appMoment',
        function (appResource, appMoment) {
            return appResource('campaigns', function (self, data) {
                if (data.startDate) {
                    data.startDate = appMoment(data.startDate).toDate();
                }
                return angular.extend(self, data);
            });
        }
    ])
    .factory('CampaignValidation', ['appResource',
        function (appResource) {
            return appResource('campaigns/validation');
        }
    ]);

