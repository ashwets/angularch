'use strict';

describe('Controller: CampaignListController', function () {
    var scope,
        CampaignListController;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CampaignListController = $controller('CampaignListController', {
            $scope: scope
        });
    }));

    it('should attach a list of 2 campaigns', function () {
        expect(scope.currentPage).toBe(0);
    });
});
