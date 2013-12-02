'use strict';

angular.module('common.pagination', ['ui.bootstrap.pagination'])
    .directive('appPagination', function (paginationDirective) {
        return angular.extend({}, paginationDirective[0], {
            templateUrl: 'scripts/modules/common/templates/pagination.tpl.html'
        });
    });
