'use strict';

angular.module('campaigns.controllers', ['common.validation', 'campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        return Campaign.query({}, function (campaigns) {
            $log.debug(campaigns);
            $scope.campaigns = campaigns;
        });
    })

    .controller('CampaignCreateController', function (
            $scope, $log, $state, notificationService, appErrorsHandler, Campaign, CampaignValidation
        ) {
        $scope.campaign = new Campaign({
            'name': '',
            'startDate': new Date()
        });

        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

        $scope.onSubmit = function () {
            $scope.errors = {};
            $scope.campaign.$save(
                function () {
                    notificationService.success('Campaign is successfully added');
                    $state.go('campaignsList');
                },
                function (response) {
                    appErrorsHandler.handle(response, $scope);
                }
            );
        };

        return CampaignValidation.get({}, function (validation) {
            $log.debug(validation);
            $scope.validation = validation;
        });
    })

    .controller('CampaignEditController', function ($scope, $stateParams, $q, $log, Campaign, CampaignValidation) {
        $log.debug($stateParams.campaignId);
        var p1 = Campaign.get({id: $stateParams.campaignId}, function (campaign) {
                $log.debug(campaign);
                $scope.campaign = campaign;
            }),

            p2 = CampaignValidation.get({}, function (validation) {
                $log.debug(validation);
                $scope.validation = validation;
            });

        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

        return $q.all([p1, p2]);
    });

