/*
 *  Module 主模块
 *
 *  Controller 定义
 */
angular.module('nex.ctrl', [])
    /*  End
     *
     *  Controller Menu
     *
     *  Start
     */
    .controller('nex-ctrl-menu', function($scope, $state) {

        /* scope数据绑定 */

        $scope.data = {
            test: "123"
        }
    })
    /*  End
     *
     *  Controller Header
     *
     *  Start
     */
    .controller('nex-ctrl-header', function($scope, $state) {

        /* scope数据绑定 */

        $scope.data = {

        }
    })
