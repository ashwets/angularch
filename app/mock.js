'use strict';

angular.module('mock', [])
	.run(function($httpBackend, $log) {

        var mockCampaigns = {
                123: {
                    "id": 123,
                    "name": "Elephant store",
                    "startDate": "2013-10-10"
                },
                456: {
                    "id": 456,
                    "name": "Magic mushrooms",
                    "startDate": "2013-09-10"
                }
            },
            campaignReturn = function (method, url, data, headers) {
                var matches = url.match(/[0-9]+/),
                    id = matches[0],
                    res = angular.toJson({
                        "status": "success",
                        "data": mockCampaigns[id]
                    });
                $log.debug('Headers', headers);

                return [200, res];
            },
            campaignAdd = function (method, url, data) {
                $log.debug('POSTED ', data);
                var nextId = _.max(_.map(_.keys(mockCampaigns), function(v) { return parseInt(v); })) + 1;

                data = angular.fromJson(data);

                if (!data.name) {
                    return [400, angular.toJson({
                        "status": "error",
                        "errors": {
                            "name": "This field is required"
                        }
                    })];
                }

                data.id = nextId;
                mockCampaigns[nextId] = data;
                $log.debug('Created campaign with id ' + nextId);
                return [201, angular.toJson({
                    "status": "success",
                    "data": data
                })];
            };

        $httpBackend.whenGET('/api/campaigns').respond(function () {
            var values = _.values(mockCampaigns);
            return [200, angular.toJson({
                "status": "success",
                "data": values,
                "total": mockCampaigns.length
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
        $httpBackend.whenGET(/\/api\/campaigns\/[0-9]+/).respond(campaignReturn);
        $httpBackend.whenPOST(/\/api\/campaigns/).respond(campaignAdd);
        $httpBackend.whenPOST(/\/api\/campaigns\/[0-9]+/).respond(campaignReturn);

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
