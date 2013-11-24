'use strict';

angular.module('app', [
        'mock',
        'ngCookies',
        'ngSanitize',
        'ngMockE2E',
        'ui.router',
        'ui.date',
        'ui.select2',
        'ui.notify',
        'angularMoment',
        'common.directives',
        'common.controllers',
        'campaigns.controllers'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {

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
    });