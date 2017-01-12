/**
 *  Module
 *
 *  审核管理模块
 */
angular.module('nex.management', [])
    .controller('nex-management-ctrl', function($scope) {

        $scope.list = [{
            id: "12341",
            name: "审核员1",
            total1: "100",
            total2: "100",
            total3: "100",
            total4: "100",
            total5: "100",
            total6: "100",
        }, {
            id: "12341",
            name: "审核员1",
            total1: "100",
            total2: "100",
            total3: "100",
            total4: "100",
            total5: "100",
            total6: "100",
        }, {
            id: "12341",
            name: "审核员1",
            total1: "100",
            total2: "100",
            total3: "100",
            total4: "100",
            total5: "100",
            total6: "100",
        }]

        $scope.click = function(index) {
            console.log(index);
        }
    })
