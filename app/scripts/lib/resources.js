'use strict';

angular.module('lib.resources', [])
    .factory('appResource', function ($http, $log, $cookies) {
        return function (resourcePath, constructor) {
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
                    return constructor ? constructor(this, data) : angular.extend(this, data);
                };

            Resource.query = function (params, success, error) {
                params = angular.extend(defaultParams, params);
                return send('GET', url, params).then(
                    function (response) {
                        var data = angular.fromJson(response.data),
                            result = [];
                        angular.forEach(data.data, function (v, k) {
                            result[k] = new Resource(v);
                        });
                        success(result);
                    },
                    function (response) {
                        error(response);
                    }
                );
            };

            Resource.get = function (params, success, error) {
                var itemUrl = params.id ? url + '/' + params.id : url;
                $log.debug('get ' + itemUrl);
                return send('GET', itemUrl).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        $log.debug('got ' + itemUrl);
                        success(new Resource(data.data));
                    },
                    function (response) {
                        error(response);
                    }
                );
            };

            Resource.save = function (data, success, error) {
                var id = getId(data),
                    method = id ? 'PUT' : 'POST',
                    methodUrl = id ? url + '/' + id : url;
                return send(method, methodUrl, defaultParams, data).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        $log.debug('save return ', response.data);
                        var res = new Resource(data.data);
                        success(res);
                    },
                    function (response) {
                        error(response);
                    }
                );
            };

            Resource.prototype.$save = function (success, error) {
                return Resource.save(this, success, error);
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
    });