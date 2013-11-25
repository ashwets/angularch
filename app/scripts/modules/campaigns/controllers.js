'use strict';

angular.module('campaigns.controllers', ['common.validation', 'campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        return Campaign.query({}, function (campaigns) {
            $log.debug(campaigns);
            $scope.campaigns = campaigns;
        });
    })

    .factory('CampaignSaver', function ($state, $log, CampaignValidation, notificationService, appErrorsHandler) {
        return {
            getValidation: function (scope) {
                return CampaignValidation.get({}, function (validation) {
                    $log.debug('Using validation', validation);
                    scope.validation = validation;
                });
            },
            save: function (scope) {
                appErrorsHandler.clear(scope);
                scope.campaign.$save(
                    function () {
                        notificationService.success('Campaign is successfully saved');
                        $state.go('campaignsList');
                    },
                    function (response) {
                        appErrorsHandler.handle(response, scope);
                    }
                );
            }
        };
    })

    .controller('CampaignCreateController', function ($scope, $log, $state, Campaign, CampaignSaver) {
        $scope.campaign = new Campaign({
            'name': '',
            'startDate': new Date()
        });

        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

        $scope.onSubmit = function () { CampaignSaver.save($scope); };

        return CampaignSaver.getValidation($scope);
    })

    .controller('CampaignEditController', function ($scope, $stateParams, $q, $log, Campaign, CampaignSaver) {
        $scope.regions = [{id: 0, name: 'Moscow'}, {id: 1, name: 'St. Petersburg'}];
        $scope.regionFormat = function format(item) { return item.name; };

        $scope.onSubmit = function () { CampaignSaver.save($scope); };

        return $q.all([
            Campaign.get({id: $stateParams.campaignId}, function (campaign) {
                $log.debug(campaign);
                $scope.campaign = campaign;
            }),
            CampaignSaver.getValidation($scope)
        ]);
    });

