'use strict';

angular.module('campaigns.controller', ['campaigns.resources'])
  .controller('CampaignController', function ($scope, $log, Campaign) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.campaigns = Campaign.query(function() {
        $log.debug($scope.campaigns);

        $scope.campaign = $scope.campaigns[0];

        $scope.campaign.name = "asdfgh";
        $scope.campaign.$save();
    });
  });
