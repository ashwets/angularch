'use strict';

describe('campaigns.controllers: CampaignListController', function () {
    var scope,
        mock,
        ctrl;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        ctrl = $controller;
        mock = $httpBackend;
    }));

    it('should attach a list of 1 campaign', function () {
        mock.expectGET(/\/api\/campaigns.*/).respond({
            status: 'success',
            data: [
                {
                    id: 111,
                    name: 'Elephant store',
                    startDate: '2013-10-10',
                    budget: '100000.00',
                    network: true
                }
            ],
            total: 1

        });
        ctrl('CampaignListController', { $scope: scope });
        mock.flush();
        expect(scope.campaignsTotal).toEqual(1);
        expect(scope.campaigns.length).toEqual(1);
        expect(scope.campaigns[0].name).toEqual('Elephant store');
        expect(scope.campaigns[0].startDate).toEqual(new Date(2013, 10-1, 10));
    });

    it('should attach a list of 2 campaign in case of 10 total', function () {
        mock.expectGET(/\/api\/campaigns.*/).respond({
            status: 'success',
            data: _.times(2, function (n) {
                return {
                    id: n,
                    name: 'Elephant store ' + (n + 1),
                    startDate: '2013-10-0' + (n + 1),
                    budget: '100000.00',
                    network: true
                };
            }),
            total: 10

        });
        ctrl('CampaignListController', { $scope: scope });
        mock.flush();
        expect(scope.campaignsTotal).toEqual(10);
        expect(scope.campaigns.length).toEqual(2);
        expect(scope.campaigns[0].name).toEqual('Elephant store 1');
        expect(scope.campaigns[0].startDate).toEqual(new Date(2013, 10-1, 1));
        expect(scope.campaigns[1].name).toEqual('Elephant store 2');
        expect(scope.campaigns[1].startDate).toEqual(new Date(2013, 10-1, 2));
    });
});
