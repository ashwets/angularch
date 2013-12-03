'use strict';

describe('lib.filters: Checkmark', function () {
    var checkmarkFilter;

    beforeEach(module('lib.filters'));

    beforeEach(inject(function ($filter) {
        checkmarkFilter = $filter('checkmark');
    }));

    it('should return V if true', function () {
        expect(checkmarkFilter(true)).toEqual('\u2713');
    });

    it('should return X if false', function () {
        expect(checkmarkFilter(false)).toEqual('\u2718');
        expect(checkmarkFilter(null)).toEqual('\u2718');
    });
});
