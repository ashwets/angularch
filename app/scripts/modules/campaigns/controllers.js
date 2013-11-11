'use strict';

angular.module('campaigns.controllers', ['common.validation', 'campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        return Campaign.query({}, function (campaigns) {
            $log.debug(campaigns);
            $scope.campaigns = campaigns;
        });
    })

    .controller('CampaignCreateController', function ($scope, $log, Campaign) {
        $scope.campaign = new Campaign({
            'name': 'New campaign',
            'startDate': '2014-01-01'
        });

        return Campaign.get({id: 'validation'}, function (validation) {
            $log.debug(validation);
            $scope.validation = validation;
        });
    })

    .controller('CampaignEditController', function ($scope, $stateParams, $q, $log, Campaign) {
        $log.debug($stateParams.campaignId);
        var p1 = Campaign.get({id: $stateParams.campaignId}, function (campaign) {
                $log.debug(campaign);
                $scope.campaign = campaign;
            }),

            p2 = Campaign.get({id: 'validation'}, function (validation) {
                $log.debug(validation);
                $scope.validation = validation;
            });
        return $q.all([p1, p2]);
    });

