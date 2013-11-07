'use strict';

angular.module('campaigns.controllers', ['common.validation', 'campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        $scope.campaigns = Campaign.query(function () {
            $log.debug($scope.campaigns);
        });

        return $scope.campaigns;
    })

    .controller('CampaignCreateController', function ($scope, $log, Campaign) {
        $scope.validation = Campaign.get({id: 'validation'}, function () {
            $log.debug($scope.validation);
        });
        $scope.campaign = new Campaign({
            'name': 'New campaign',
            'startDate': '2014-01-01'
        });

        return $scope.validation;
    });

