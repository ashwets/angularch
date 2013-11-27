'use strict';

angular.module('mock', [])
	.run(function($httpBackend, $log) {

        var mockCampaigns = {
                111: {
                    "id": 111,
                    "name": "Elephant store",
                    "startDate": "2013-10-10",
                    "budget": "100000.00",
                    "network": true
                },
                222: {
                    "id": 222,
                    "name": "Magic mushrooms",
                    "startDate": "2013-09-10",
                    "budget": "200000.00",
                    "network": false
                },
                333: {
                    "id": 333,
                    "name": "Kitty cat",
                    "startDate": "2013-09-11",
                    "budget": "300000.00",
                    "network": false
                },
                444: {
                    "id": 444,
                    "name": "Acme",
                    "startDate": "2015-10-22",
                    "budget": "44444.44",
                    "network": true
                },
                555: {
                    "id": 555,
                    "name": "Super duper puper",
                    "startDate": "2013-01-01",
                    "budget": "123456.78",
                    "network": true
                }
            },
            campaignGet = function (method, url, data, headers) {
                var matches = url.match(/[0-9]+/),
                    id = parseInt(matches[0]),
                    res = angular.toJson({
                        "status": "success",
                        "data": mockCampaigns[id]
                    });
                $log.debug('Headers', headers);

                return [200, res];
            },
            campaignValidate = function (data) {
                var errors = {};

                if (!data.name) {
                    errors.name = "Имя кампании обязательно";
                }
                if (data.budget < 1000) {
                    errors.budget = "Минимальный бюджет кампании - 1000 рублей"
                }
                if (!_.isEmpty(errors)) {
                    return [400, angular.toJson({
                        "status": "error",
                        "errors": errors
                    })];
                }
                return false;
            },
            campaignAdd = function (method, url, data) {
                $log.debug('POSTED ', data);
                data = angular.fromJson(data);

                var nextId = _.max(_.map(_.keys(mockCampaigns), function(v) { return parseInt(v, 10); })) + 1,
                    notValid = campaignValidate(data);

                if (notValid) {
                    return notValid;
                }

                data.id = nextId;
                mockCampaigns[nextId] = data;
                $log.debug('Created campaign with id ' + nextId);
                return [201, angular.toJson({
                    "status": "success",
                    "data": data
                })];
            },
            campaignUpdate = function (method, url, data) {
                data = angular.fromJson(data);

                var matches = url.match(/[0-9]+/),
                    id = matches[0],
                    notValid = campaignValidate(data);
                if (notValid) {
                    return notValid;
                }

                mockCampaigns[id] = data;
                $log.debug('Updated campaign with id ' + id);
                return [200, angular.toJson({
                    "status": "success",
                    "data": data
                })];
            };

        $httpBackend.whenGET(/\/api\/campaigns(\?.*)?$/).respond(function (method, url) {
            var matches = url.match(/\/api\/campaigns\??(.*)?/),
                queryString = matches[1],
                pairs = queryString.split('&'),
                params = {},
                start = 0;

            angular.forEach(pairs, function (v) {
                var s = v.split('=');
                params[s[0]] = s[1];
            });
            start = parseInt(params._page) * parseInt(params._perPage);

            $log.debug(url, queryString, params, start, start + params._perPage);

            var values = _.values(mockCampaigns);
            return [200, angular.toJson({
                "status": "success",
                "data": values.slice(start, start + parseInt(params._perPage)),
                "total": values.length
            })];
        });

        $httpBackend.whenGET('/api/campaigns/validation').respond(
            angular.toJson({
                "status": "success",
                "data": {
                    "name": [
                        {
                            "type": "NotBlank",
                            "message": "Задайте имя кампании"
                        },
                        {
                            "type": "Length",
                            "min": 10,
                            "max": 20,
                            "minMessage": "Имя кампании должно быть длиннее {{ limit }} символов",
                            "maxMessage": "Имя кампании должно быть короче {{ limit }} символов"
                        }
                    ],
                    "startDate": [
                        {
                            "type": "NotBlank",
                            "message": "Задайте дату начала кампании"
                        }
                    ]
                }
            })
        );
        $httpBackend.whenGET(/\/api\/campaigns\/[0-9]+/).respond(campaignGet);
        $httpBackend.whenPOST(/\/api\/campaigns/).respond(campaignAdd);
        $httpBackend.whenPUT(/\/api\/campaigns\/[0-9]+/).respond(campaignUpdate);

        $httpBackend.whenPOST('/api/auth').respond(
            function (method, url, data) {
                $log.debug('Auth with ' + angular.toJson(data));
                return [200, angular.toJson({
                    status: "success",
                    data: {
                        token: "asd",
                        expires: "2013-11-22T10:11:12"
                    }
                })];
            }
            
        );

        $httpBackend.whenGET(/.*\.html/).passThrough();
    });
