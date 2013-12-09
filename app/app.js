'use strict';

angular.module('app', [
        'config',
        'routing',
        'mock',
        'gettext',
        'ngCookies',
        'ngMockE2E',
        'ngRaven',
        'ui.date',
        'ui.select2',
        'ui.notify',
        'common.pagination',
        'angularMoment',
        'lib.logging',
        'lib.moment',
        'lib.numeric',
        'lib.filters',
        'common.controllers',
        'campaigns.controllers'
    ])
    .config(function(appConfig, RavenProvider) {
        RavenProvider.development(appConfig.RAVEN_DEVELOPMENT);
    })
   .run(function (appMoment, appNumericSettings, gettextCatalog, appConfig, $window, $log) {
        $log.info('Application running');

        if (!appConfig.RAVEN_DEVELOPMENT) {
            $window.Raven.config(appConfig.RAVEN_DSN, {}).install();
        }

        appMoment.lang('ru');
        appNumericSettings.locale('ru');
        appNumericSettings.currency('ruble');
        gettextCatalog.currentLanguage = 'ru';
        gettextCatalog.debug = true;
    });