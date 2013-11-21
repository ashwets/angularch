'use strict';

angular.module('common.validation', [])
    .factory('appValidators', function () {
        var formatMessage = function (message, params) {
                params = params || {};
                _.each(params, function (v, k) {
                    message = message.replace('{{ ' + k + ' }}', v);
                });
                return message;
            },
            invalidRes = function (message, params) {
                return {isValid: false, message: formatMessage(message, params)};
            },
            validRes = {isValid: true};

        return {
            NotBlank: function (value, params) {
                if (!(value + '').length) {
                    return invalidRes(params.message);
                }
                return validRes;
            },
            Length: function (value, params) {
                var len = value.length;

                if (params.min === params.max && len !== params.min) {
                    return invalidRes(params.exactMessage, {limit: params.min, value: value});
                } else if (params.min && len < params.min) {
                    return invalidRes(params.minMessage, {limit: params.min, value: value});
                } else if (params.max && len > params.max) {
                    return invalidRes(params.maxMessage, {limit: params.max, value: value});
                }
                return validRes;
            }
        };
    })

    .directive('appValidator', function ($log, appValidators) {
        return {
            require: 'ngModel',
            restrict: 'A',

            link: function(scope, element, attributes, ngModelCtrl) {
                $log.debug(attributes);
                element.bind('blur', function () {
                    var value = ngModelCtrl.$modelValue;
                    $log.debug(value);
                    var ruleName = attributes.appValidator || ngModelCtrl.$name,
                        validators = scope.validation[ruleName],
                        isValid = true,
                        message = '';
                    _.every(validators, function (vd) {
                        var res = appValidators[vd.type](value, vd);
                        $log.debug(vd.type, res);
                        isValid = res.isValid;
                        if (!isValid) {
                            message = res.message;
                        }
                        return isValid;
                    });
                    ngModelCtrl.$setValidity('validator', isValid);
                    element.popover('destroy');
                    if (message) {
                        element.popover({
                            content: message,
                            placement: attributes.appValidatorMessagePosition || 'right',
                            trigger: 'manual'
                        }).popover('show');
                    }
                });
            }
        };
    });
