'use strict';

angular.module('common.resources', [])
	.factory('appResource', function ($http, $log) {
		return function (resourcePath) {
			var url = '/api/' + resourcePath,
				defaultParams = {},

				getId = function (data) {
					return data.id;
				},

				Resource = function (data) {
					return angular.extend(this, data);
				};

			Resource.query = function (params, success, error) {
				var params = angular.extend(defaultParams, params),
					get = function () { 
						return params ? $http.get(url, params) : $http.get(url);
					};
				return get().then(function (response) {
					var result = [];
					angular.forEach(response.data, function (v, k) {
						result[k] = new Resource(v);
					});
					success(result);
				});
			};

			Resource.get = function (params, success, error) {
				var itemUrl = url + '/' + params.id;
				$log.debug('get ' + itemUrl);
				return $http.get(itemUrl).then(function (response) {
					$log.debug('got ' + itemUrl);
					success(response.data);
				});
			};

			Resource.save = function (data) {
				return $http.post(url, data, {params: defaultParams}).then(function (response) {
					return new Resource(response.data);
				})
			};

			Resource.prototype.$save = function () {
				return Resource.save(this);
			};

			Resource.remove = function () {
				return $http.delete(url, defaultParams).then(function (response) {
					return new Resource(response.data);
				});
			};

			Resource.prototype.$remove = function () {
				return Resource.remove(this);
			};

			Resource.prototype.$id = function () {
				return getId(this);
			};

			return Resource;
		};
	});