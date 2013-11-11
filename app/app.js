'use strict';

angular.module('app', [
        'ngCookies',
        'ngSanitize',
        'ngMockE2E',
        'ui.router',
        'common.controllers',
        'campaigns.controllers'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {
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

        $stateProvider
            .state('mainNavigable', {
                abstract: true,
                views: {
                    'navbar': {
                        templateUrl: '/scripts/modules/common/templates/navbar.tpl.html',
                        controller: 'NavBarController'
                    },
                    'main': {
                        template: '<ui-view/>'
                    }
                }
            })
            .state('home', {
                parent: 'mainNavigable',
                url: '/',
                templateUrl: '/scripts/modules/common/templates/home.tpl.html',
                controller: 'HomeController'
            })
            .state('signin', {
                parent: 'mainNavigable',
                url: '/signin',
                templateUrl: '/scripts/modules/common/templates/signin.tpl.html',
                controller: 'SigninController'
            })
            .state('campaignsList', {
                parent: 'mainNavigable',
                url: '/campaigns',
                templateUrl: '/scripts/modules/campaigns/templates/list.tpl.html',
                controller: 'CampaignListController'
            })
            .state('campaignsCreate', {
                parent: 'mainNavigable',
                url: '/campaigns/create',
                templateUrl: '/scripts/modules/campaigns/templates/create.tpl.html',
                controller: 'CampaignCreateController'
            })
            .state('campaignsEdit', {
                parent: 'mainNavigable',
                url: '/campaigns/:campaignId',
                templateUrl: '/scripts/modules/campaigns/templates/create.tpl.html',
                controller: 'CampaignEditController'
            });

        $urlRouterProvider.otherwise("/");
    })

    .run(function($httpBackend, $log) {

        var mockCampaigns = {
                123: {
                    "id": 123,
                    "name": "Elephant store",
                    "startDate": "2013-10-10"
                },
                456: {
                    "id": 456,
                    "name": "Magic mushrooms",
                    "startDate": "2013-09-10"
                }
            },
            campaignReturn = function(method, url, data, headers) {
                var matches = url.match(/[0-9]+/),
                    id = matches[0],
                    res = angular.toJson({
                        "status": "success",
                        "data": mockCampaigns[id]
                    });
                $log.debug(headers);

                return [200, res];
            };

        $httpBackend.whenGET('/api/campaigns').respond(
            angular.toJson({
                "status": "success",
                "data": _.values(mockCampaigns),
                "total": 20
            })
        );
        $httpBackend.whenGET('/api/campaigns/validation').respond(
            angular.toJson({
                "status": "success",
                "data": {
                  "name": [
                    {
                      "type": "NotBlank",
                      "message": "Задайте имя кампании"
                    },
                    {
                      "type": "Length",
                      "min": 10,
                      "max": 20,
                      "minMessage": "Имя кампании должно быть длиннее {{ limit }} символов",
                      "maxMessage": "Имя кампании должно быть короче {{ limit }} символов"
                    }
                  ],
                  "startDate": [
                    {
                      "type": "NotBlank",
                      "message": "Задайте дату начала кампании"
                    }
                  ]
                }
            })
        );
        $httpBackend.whenGET(/\/api\/campaigns\/[0-9]+/).respond(campaignReturn);
        $httpBackend.whenPOST(/\/api\/campaigns\/[0-9]+/).respond(campaignReturn);

        $httpBackend.whenPOST('/api/auth').respond(
            function (method, url, data) {
                $log.debug('Auth with ' + angular.toJson(data));
                return [200, angular.toJson({
                    status: "success",
                    data: {
                        token: "asd", 
                        expires: "2013-11-22T10:11:12"
                    }
                })];
            }
            
        );

        $httpBackend.whenGET(/.*\.html/).passThrough();
    });
