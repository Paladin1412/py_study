/*
 *  Module 主模块
 *
 *  路由控制、模块加载
 */
angular.module('Nex', ['ui.router', "nex.ctrl", "nex.management"])
    //路由
    .config(function($stateProvider, $urlRouterProvider) {

        // 路由重定向
        $urlRouterProvider.otherwise('management');

        // 路由定义
        $stateProvider
        //审核管理
            .state('management', {
                url: "/management",
                controller: "nex-management-ctrl",
                templateUrl: "./module-auditManagement/management.html"
            })
            //广告主易效
            .state('advertiser-yixiao', {
                url: "/advertiser/yixiao",
                templateUrl: "./module-advertiserYi/yixiao.html"
            })
            //广告主NEX
            .state('advertiser-nex', {
                url: "/advertiser/nex",
                templateUrl: "./module-advertiserNex/nex.html"
            })
            //广告主NEX审核
            .state('advertiser-nex-aduit', {
                url: "/advertiser/nex/aduit",
                templateUrl: "./module-advertiserNex/audit.html"
            })
    })
