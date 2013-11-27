'use strict';

angular.module('lib.resources', [])
    .factory('appResource', function ($http, $log, $cookies, appErrorsHandler) {
        return function (resourcePath, constructor) {
            var url = '/api/' + resourcePath,
                defaultParams = {},

                getId = function (data) {
                    return data.id;
                },

                send = function (method, url, params, data) {
                    var config = {method: method, url: url};
                    params = params || {};

                    if (_.keys(params).length > 0) {
                        config.params = params;
                    }
                    if (data) {
                        config.data = data;
                    }
                    if ($cookies.token) {
                        config.headers = {'X-Api-Token': $cookies.token};
                    }
                    $log.debug('config', config, params);
                    return $http(config);
                },

                errorDefaultFn = function (response) {
                    appErrorsHandler.handle(response);
                },

                Resource = function (data) {
                    return constructor ? constructor(this, data) : angular.extend(this, data);
                };

            Resource.query = function (params, success, error) {
                params = angular.extend(defaultParams, params);
                error = error || errorDefaultFn;
                return send('GET', url, params).then(
                    function (response) {
                        var data = angular.fromJson(response.data),
                            result = [];
                        angular.forEach(data.data, function (v, k) {
                            result[k] = new Resource(v);
                        });
                        $log.debug(data);
                        success(result, data.total);
                    },
                    function (response) {
                        error(response);
                    }
                );
            };

            Resource.get = function (params, success, error) {
                var itemUrl = params.id ? url + '/' + params.id : url;
                $log.debug('get ' + itemUrl);
                error = error || errorDefaultFn;
                return send('GET', itemUrl).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        $log.debug('got ' + itemUrl, response);
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
                error = error || errorDefaultFn;
                return send(method, methodUrl, defaultParams, data).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        $log.debug('save return ', response.data);
                        success(new Resource(data.data));
                    },
                    function (response) {
                        error(response);
                    }
                );
            };

            Resource.prototype.$save = function (success, error) {
                return Resource.save(this, success, error);
            };

            Resource.remove = function (success, error) {
                error = error || errorDefaultFn;
                return send('DELETE', url, defaultParams).then(
                    function (response) {
                        var data = angular.fromJson(response.data);
                        success(new Resource(data.data));
                    },
                    function (response) {
                        error(response);
                    }
                );
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