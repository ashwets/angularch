'use strict';

angular.module('config', [])
    .constant('appConfig', {
        LOGGING_LEVEL: 'info',
        RAVEN_DEVELOPMENT: true,
        RAVEN_DSN: ''
    });