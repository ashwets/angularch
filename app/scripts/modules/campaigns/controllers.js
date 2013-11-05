'use strict';

angular.module('campaigns.controllers', ['campaigns.resources'])
    .controller('CampaignListController', function ($scope, $log, Campaign) {
        $scope.campaigns = Campaign.query(function () {
            $log.debug($scope.campaigns);
        });

        return $scope.campaigns;
    })

    .controller('CampaignCreateController', function ($scope, $log, Campaign) {
        $scope.validation = Campaign.get({id: 'validation'}, function () {
            $log.debug($scope.validation);
        });
        $scope.campaign = new Campaign({
            'name': 'New campaign',
            'startDate': '2014-01-01'
        });

        return $scope.validation;
    })

    .factory('appValidators', function () {
        var formatMessage = function (message, params) {
                params = params || {};
                angular.forEach(params, function (v, k) {
                    message = message.replace('{{ ' + k + ' }}', v);
                });
                return message;
            },
            invalidRes = function (message, params) {
                return {isValid: false, message: formatMessage(message, params)};
            },
            validRes = {isValid: true};

        return {
            Required: function (value, params) {
                if (!value) {
                    return invalidRes(params.message);
                }
                return validRes;
            },
            Length: function (value, params) {
                var len = value.length;

                if (params.min === params.max && len != params.min) {
                    return invalidRes(params.exactMessage, {limit: params.min, value: value});
                } else if (params.min && len < params.min) {
                    return invalidRes(params.minMessage, {limit: params.min, value: value});
                } else if (params.max && len > params.max) {
                    return invalidRes(params.maxMessage, {limit: params.max, value: value});
                }
                return validRes;
            }
        }
    })

    .directive('appValidator', function ($log, appValidators) {
        return {
            require: 'ngModel',
            restrict: 'A',

            link: function(scope, element, attributes, ngModelCtrl) {
                element.bind('blur', function () {
                    var value = ngModelCtrl.$modelValue;
                    $log.debug(value);
                    var validators = scope.validation[ngModelCtrl.$name],
                        isValid = true,
                        message = '';
                    angular.forEach(validators, function (vd) {
                        var res = appValidators[vd.type](value, vd);
                        if (!res.isValid) {
                            isValid = false;
                            message = res.message;
                            return false;
                        }
                    });
                    ngModelCtrl.$setValidity('validator', isValid);
                    element.popover('destroy');
                    if (message) {
                        element.popover({
                            content: message,
                            placement: 'right',  // TODO: get from element attributes
                            trigger: 'manual'
                        }).popover('show');
                    }
                });
            }
        }
    });
