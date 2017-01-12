/**
 *  Module
 *
 *  审核管理模块
 */
angular.module('omp.management', [])
    .controller('omp-management-ctrl', function($scope, http) {

        function init() {
            //获取待审统计量
            getStat();
            //获取审核员工作信息
            getWorkerInfoList();
        };

        /*  * * * * * * * * * * * PART 1 管理员统计信息 * * * * * * *
         *  $scope.stat         统计信息
         *
         *  advertiser          广告主部分
         *  --total             总量
         *  --p4p               易效
         *  --nex               NEX
         *
         *  idea                创意部分
         *  --total             总量
         *  --p4p               易效
         *  --nex               NEX 
         *
         */
        $scope.stat = {
            advertiser: {
                total: "",
                p4p: "",
                nex: "",
            },
            idea: {
                total: "",
                p4p: "",
                nex: "",
            }
        };

        //获取光李元待审数量统计
        function getStat() {
            http("getNeedAudit", {}, function(msg) {
                $scope.stat.advertiser = msg.advertiser;
                $scope.stat.idea = msg.idea;
            });
        };

        /*  * * * * * * * * * * * PART 2 管理员统计信息 * * * * * * *
         *  $scope.workerList    审核员统计
         *
         *  userId               审核员Id
         *  userName             审核员名称
         *  advertiserTotal      广告主总计
         *  advertiserP4p
         *  advertiserNex
         *  ideaTotal           创意总计
         *  ideaP4p
         *  ideaNex
         *  auditOpen           审核开关(bool)
         *
         * 
         */
        $scope.workerList = [];

        //获取审核员信息列表
        function getWorkerInfoList() {
            http("getAuditWorks", {}, function(msg) {
                $scope.workerList = msg.list;
            });
        };

        // => "true"/"false"
        $scope.openSwitch = function(node) {
            //
            node.auditOpen = node.auditOpen === "true" ? "false" : "true";
            //
            var params = {
                "id": node.userId,
                "open": node.auditOpen
            };
            //
            http("operate", { data: params }, function(msg) {
                //console.log(msg);
            });
        };

        //run
        init();
        //
    })
