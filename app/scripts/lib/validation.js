'use strict';

angular.module('lib.validation', [])
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

    .factory('appValidationErrors', function ($log) {
        var subscribers = {},
            setMessage = function (fieldName, message) {
                _.each(subscribers[fieldName], function (subscriber) {
                    subscriber(message, fieldName);
                });
            };
        return {
            setMessage: setMessage,
            setMessages: function (messages) {
                $log.debug('subscribers', subscribers);
                _.each(messages, function (v, k) {
                    setMessage(k, v);
                });
            },
            subscribe: function (fieldName, subscriber) {
                if (!subscribers[fieldName]) {
                    subscribers[fieldName] = []
                }
                subscribers[fieldName].push(subscriber);
            }
        };
    })

    .directive('appValidator', function ($log, appValidators, appValidationErrors) {
        var showMessage = function (element, message, attributes) {
            element.popover('destroy');
            if (message) {
                element.popover({
                    content: message,
                    placement: attributes.appValidatorMessagePosition || 'right',
                    trigger: 'manual'
                }).popover('show');
            }
        };

        return {
            require: 'ngModel',
            restrict: 'A',

            link: function(scope, element, attributes, ngModelCtrl) {
                var ruleName = attributes.appValidator;
                element.bind('blur', function () {
                    var value = ngModelCtrl.$modelValue,
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
                    showMessage(element, message, attributes);
                });

                appValidationErrors.subscribe(ruleName, function (message) {
                    ngModelCtrl.$setValidity('validator', !!message);
                    showMessage(element, message, attributes);
                });
            }
        };
    })

    .factory('appErrorsHandler', function ($log, notificationService, appValidationErrors) {
        return {
            handle: function (response) {
                if (response.status === 400) {
                    $log.debug('POST errors', response.data.errors);
                    appValidationErrors.setMessages(response.data.errors);
                    notificationService.error('Please, correct values');
                } else {
                    notificationService.error('Something terrible happened');
                }
            }
        };
    });
