'use strict';

angular.module('campaigns.controllers', ['lib.validation', 'campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        $scope.currentPage = 0;
        $scope.itemsPerPage = 2;

        var queryCampaigns = function () {
            $log.debug('page', $scope.currentPage);
            return Campaign.query(
                {
                    _page: $scope.currentPage,
                    _perPage: $scope.itemsPerPage
                },
                function (campaigns, total) {
                    $log.debug(campaigns, total);
                    $scope.campaigns = campaigns;
                    $scope.campaignsTotal = total;
                }
            );
        };

        $scope.onPageChange = function (page) {
            $scope.currentPage = page;
            queryCampaigns();
        };

        return queryCampaigns();
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
                scope.campaign.$save(
                    function () {
                        notificationService.success('Campaign is successfully saved');
                        $state.go('campaignsList');
                    }
                );
            }
        };
    })

    .controller('CampaignCreateController', function ($scope, $log, $state, Campaign, CampaignSaver) {
        $scope.campaign = new Campaign({
            'name': '',
            'startDate': new Date(),
            'budget': 0
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

