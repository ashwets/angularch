'use strict';

angular.module('app', [
        'routing',
        'mock',
        'ngCookies',
        'ngSanitize',
        'ngMockE2E',
        'ui.date',
        'ui.select2',
        'ui.notify',
        'common.pagination',
        'angularMoment',
        'lib.moment',
        'lib.numeric',
        'lib.format',
        'common.controllers',
        'campaigns.controllers'
    ])
   .run(function (appMoment, appNumericSettings) {
        appMoment.lang('ru');
        appNumericSettings.locale('ru');
        appNumericSettings.currency('ruble');
    });