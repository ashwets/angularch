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
            'name': '',
            'startDate': new Date()
        });

        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

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

        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

        return $q.all([p1, p2]);
    });

