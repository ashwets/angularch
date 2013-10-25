'use strict';

angular.module('app', [
        'ngCookies',
        'ngSanitize',
        'ngRoute',
        'ngMockE2E',
        'campaigns.controller'
    ])
    .config(function ($provide, $routeProvider, $httpProvider) {
        var JSON_START = /^\s*(\[|\{[^\{])/,
            JSON_END = /[\}\]]\s*$/;

        $httpProvider.defaults.transformResponse = function(data, headersGetter) {
            if (JSON_START.test(data) && JSON_END.test(data)) {
                var json = angular.fromJson(data);
                return json.data;
            }
            return data;
        };

        /*$httpProvider.defaults.transformRequest = function(data, headersGetter) {
            return angular.toJson(data);
        };*/

        $routeProvider
            .when('/', {
                templateUrl: '/scripts/modules/campaigns/templates/list.tpl.html',
                controller: 'CampaignController'
            })
            .otherwise({
                redirectTo: '/'
            });
    })

    .run(function($httpBackend) {

        var mockCampaigns = {
                123: {
                    "id": 123,
                    "name": "Elephant store",
                    "start_date": "2013-10-10"
                },
                456: {
                    "id": 456,
                    "name": "Magic mushrooms",
                    "start_date": "2013-09-10"
                }
            },
            campaignReturn = function(method, url, data) {
                var matches = url.match(/[0-9]*/),
                    id = matches[0];
                return angular.toJson({
                    "status": "success",
                    "data": mockCampaigns[id]
                });
            };

        $httpBackend.whenGET('/api/campaigns').respond(
            angular.toJson({
                "status": "success",
                "data": _.values(mockCampaigns),
                "total": 20
            })
        );
        $httpBackend.whenGET(/\/api\/campaigns\/[0-9]*/).respond(campaignReturn);
        $httpBackend.whenPOST(/\/api\/campaigns\/[0-9]*/).respond(campaignReturn);

        $httpBackend.whenGET(/.*\.html/).passThrough();
    });