'use strict';

angular.module('common.controllers', ['common.resources'])
    .controller('HomeController', function ($log) { $log.debug('homectl'); })
    .controller('NavBarController', function ($log) {  $log.debug('navbarctl'); })
    .controller('SigninController', function ($scope, $log, $cookies, Auth) {
    	$log.debug('signinctl'); 

    	$scope.auth = new Auth();

    	$scope.submit = function () {
    		$scope.auth.$save(function (auth) {
    			$log.debug(auth);
    			$cookies.token = auth.token;
    		});
    	}
    });
