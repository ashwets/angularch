'use strict';

angular.module('lib.numeric', [])
    .constant('appNumericLocales', {
        en: {
            thousands: ',',
            decimal: '.'
        },
        ru: {
            thousands: ' ',
            decimal: ','
        }
    })
    .constant('appNumericCurrency', {
        dollar: {
            sign: '$',
            pos: 'p'
        },
        ruble: {
            sign: ' руб.',
            pos: 's'
        }
    })
    .factory('appNumericSettings', function (appNumericLocales, appNumericCurrency) {
        var currentLocale = 'en',
            currentCurrency = 'dollar';

        return {
            locale: function (locale) {
                currentLocale = locale;
            },
            currency: function (currency) {
                currentCurrency = currency;
            },
            thousands: function () {
                return appNumericLocales[currentLocale].thousands;
            },
            decimal: function () {
                return appNumericLocales[currentLocale].decimal;
            },
            sign: function () {
                return appNumericCurrency[currentCurrency].sign;
            },
            signPos: function () {
                return appNumericCurrency[currentCurrency].pos;
            }
        };
    })
    .directive('appNumeric', function (appNumericSettings) {
        return {
            require: 'ngModel',
            restrict: 'A',

            link: function (scope, elm, attrs, controller) {
                // Get instance-specific options.
                var opts = angular.extend({
                    aDec: appNumericSettings.decimal(),
                    aSep: appNumericSettings.thousands(),
                    vMin: '-999999999.00',
                    vMax: '999999999.00',
                    aSign: appNumericSettings.sign(),
                    pSign: appNumericSettings.signPos(),
                    mRound: 'B'
                }, scope.$eval(attrs.appNumeric));

                // Initialize element as autoNumeric with options.
                elm.autoNumeric('init', opts);

                // watch for external changes to model and re-render element
                scope.$watch(attrs.ngModel, function () {
                    if ($.isNumeric(controller.$viewValue)) {
                        elm.autoNumeric('set', controller.$viewValue);
                    }
                });

                // if element has controller, wire it (only for <input type="text" />)
                if (elm.is('input:text')) {
                    // Detect changes on element and update model.
                    elm.on('change', function () {
                        scope.$apply(function () {
                            controller.$setViewValue(elm.autoNumeric('get'));
                        });
                    });
                }
            }
        };
    })
    .directive('appCurrencySign', function (appNumericSettings) {
        return {
            restrict: 'E',
            link: function (scope, elm) {
                elm.replaceWith(appNumericSettings.sign());
            }
        };
    });
