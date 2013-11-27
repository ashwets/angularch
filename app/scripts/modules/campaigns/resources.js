'use strict';

angular.module('campaigns.resources', ['lib.resources', 'lib.moment'])
    .factory('Campaign', function (appResource, appMoment) {
        return appResource('campaigns', function (self, data) {
            if (data.startDate) {
                data.startDate = appMoment(data.startDate).toDate();
            }
            return angular.extend(self, data);
        });
    })
    .factory('CampaignValidation', function (appResource) {
        return appResource('campaigns/validation');
    });

