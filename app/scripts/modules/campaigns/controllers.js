'use strict';

angular.module('campaigns.controllers', ['campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        $scope.campaigns = Campaign.query(function () {
            $log.debug($scope.campaigns);
        });
    })

    .controller('CampaignCreateController', function ($scope, $log, Campaign) {

    });
