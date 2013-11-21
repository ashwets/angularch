'use strict';

angular.module('common.resources', [])
    .factory('appResource', function ($http, $log, $cookies) {
        return function (resourcePath) {
            var url = '/api/' + resourcePath,
                defaultParams = {},

                getId = function (data) {
                    return data.id;
                },

                send = function (method, url, params, data) {
                    var config = {method: method, url: url};
                    params = params || {};

                    if (params.length > 0) {
                        config.params = params;
                    }
                    if (data) {
                        config.data = data;
                    }
                    if ($cookies.token) {
                        config.headers = {'X-Api-Token': $cookies.token};
                    }
                    return $http(config);
                },

                Resource = function (data) {
                    return angular.extend(this, data);
                };

            Resource.query = function (params, success, error) {
                params = angular.extend(defaultParams, params);
                return send('GET', url, params).then(function (response) {
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
                return send('GET', itemUrl).then(function (response) {
                    $log.debug('got ' + itemUrl);
                    success(response.data);
                });
            };

            Resource.save = function (data, success) {
                return send('POST', url, defaultParams, data).then(function (response) {
                    //$log.debug('POST return ' + angular.toJson(response.data))
                    var res = new Resource(response.data);
                    success(res);
                });
            };

            Resource.prototype.$save = function (success) {
                return Resource.save(this, success);
            };

            Resource.remove = function () {
                return send('DELETE', url, defaultParams).then(function (response) {
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
    })

    .factory('Auth', ['appResource',
        function (appResource) {
            return appResource('auth');
        }
    ]);