'use strict';

angular.module('common.controllers', [])
    .controller('HomeController', function ($log) { $log.debug('homectl'); })
    .controller('NavBarController', function ($log) {  $log.debug('navbarctl'); });
