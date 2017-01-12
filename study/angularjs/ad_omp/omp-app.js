/*
 *  Module 主模块
 *
 *  路由控制、模块加载
 */

angular.module('Omp', ['ui.router', "omp.ctrl", "omp.directive", "omp.service",
        "omp.filter", "omp.advertiser.ctrl", "omp.creativity.ctrl", "omp.management","omp.demo.ctrl","omp.advertisermanage.ctrl","omp.income.ctrl","omp.invoice","omp.overview","omp.authorize.ctrl"
    ])

    //路由
    .config(function($stateProvider, $urlRouterProvider) {

        // 路由重定向
        /*$urlRouterProvider.otherwise('/advertiser/nex');*/

        // 路由定义
        $stateProvider
        //审核管理
            .state('management', {
                url: "/management",
                controller: "omp-management-ctrl",
                templateUrl: "./module-management/management.html"
            })
            //广告主易效
            .state('advertiser-yixiao', {
                url: "/advertiser/yixiao",
                controller: "omp-advertiser-yixiaoCtrl",
                templateUrl: "./module-advertiser/yixiao.html",
                params: { msg: {} }
            })
            //广告主NEX
            .state('advertiser-nex', {
                url: "/advertiser/nex",
                controller: "omp-advertiser-nexCtrl",
                templateUrl: "module-advertiser/nex.html",
                params: { msg: {} }
            })
            //广告主审核
            .state('advertiser-aduit', {
                abstract: true,
                url: "/advertiser/aduit",
                controller: "omp-advertiser-auditCtrl",
                templateUrl: "./module-advertiser/aduit.html"
            })
            //广告主审核二级路由 基本信息
            .state('advertiser-aduit.list', {
                url: "/advertiser/aduit/list",
                controller: "omp-advertiser-listCtrl",
                templateUrl: "./module-advertiser/aduit-list.html",
                params: { msg: {} }
            })
            //广告主审核二级路由 细节审批
            .state('advertiser-aduit.detail', {
                url: "/advertiser/aduit/detail",
                controller: "omp-advertiser-detailCtrl",
                templateUrl: "./module-advertiser/aduit-detail.html",
                params: { msg: {} }
            })
            //广告主管理-易效
            .state('advertisermanage-yixiao', {
                url: "/advertisermanage/yixiao",
                controller: "omp-advertisermanage-yixiaoCtrl",
                templateUrl: "http://p4p.pangu.163.com/customer/module-advertisermanage/yixiao.html",
                params: { msg: {} }
            })
            //广告主管理-易效-详情页
            .state('advertisermanage-yixiao-show', {
                url: "/advertisermanage/yixiao/show",
                controller: "omp-advertisermanage-yixiao-showCtrl",
                templateUrl: "http://p4p.pangu.163.com/customer/module-advertisermanage/yixiao-show.html",
                params: { msg: {} }
            })
            //创意易效
            .state('creativity-yixiao', {
                url: "/creativity/yixiao",
                controller: "omp-creativity-listCtrl",
                templateUrl: "./module-creativity/yixiao.html",
                params: { msg: {} }
            })
            //创意NEX
            .state('creativity-nex', {
                url: "/creativity/nex",
                controller: "omp-creativity-listCtrl",
                templateUrl: "module-creativity/nex.html",
                params: { msg: {} }
            })
            //创意管理
            .state('creativity-manage', {
                url: "/creativity/manage",
                controller: "omp-creativity-listCtrl",
                templateUrl: "./module-creativity/manage.html",
                params: { msg: {} }
            })
            //创意审核
            .state('creativity-aduit', {
                url: "/creativity/aduit",
                controller: "omp-creativity-auditCtrl",
                templateUrl: "./module-creativity/aduit.html",
                params: { msg: {} }
            })
            //收入统计
            .state('advertiser-income', {
                url: "/count/advertiser",
                controller: "omp-income-advertiser",
                templateUrl: "./module-income/nex-ad-income.html",
            })
            //代理商收入统计
            .state('agent-income', {
                url: "/count/agent",
                controller: "omp-income-agent",
                templateUrl: "./module-income/nex-agent-income.html",
                params: { msg: {} }
            })
            //行业收入统计
            .state('industry-income', {
                url: "/count/industry",
                controller: "omp-income-industry",
                templateUrl: "./module-income/industry-income.html",
                params: { msg: {} }
            })
            //位置收入统计
            .state('area-income', {
                url: "/count/area",
                controller: "omp-income-area",
                templateUrl: "./module-income/area-income.html",
                params: { msg: {} }
            })
            //demo
            .state('demo', {
                url: "/demo",
                controller: "omp-demoCtrl",
                templateUrl: "./module-demo/demo.html",
                params: { msg: {} }
            })
            //运营概览
            .state('overview', {
                url: "/overview",
                controller: "omp-overview",
                templateUrl: "./module-overview/overview.html",
                params: { msg: {} }
            })
		    //发票列表
		    .state('invoice-list',{
            	url:"/invoice/list",
              	controller: "omp-invoice-listCtrl",
        	    templateUrl: "http://p4padmin.pangu.163.com/module-invoice/list.html",
    	        params: { msg: {} }	
            })
		    .state('invoice-detail',{
		    	url:"/invoice/detail/:id/:token",
		    	controller: "omp-invoice-detailCtrl",
        	    templateUrl: "http://p4padmin.pangu.163.com/module-invoice/detail.html",
    	        params: { msg: {} }
		    })
            .state('authorize-roleList', {
                url: "/authorize/roleList",
                controller: "omp-authorize-roleList",
                templateUrl: "./module-authorize/roleList.html"
            }).state('authorize-roleAdd', {
                url: "/authorize/roleAdd",
                controller: "omp-authorize-roleAdd",
                templateUrl: "./module-authorize/roleAdd.html"
            })
        .state('authorize-userList', {
                url: "/authorize/userList",
                controller: "omp-authorize-userList",
                templateUrl: "./module-authorize/userList.html"
            }).state('authorize-userAdd', {
                url: "/authorize/userAdd",
                controller: "omp-authorize-userAdd",
                templateUrl: "./module-authorize/userAdd.html"
            })
    })

    //启动
    .run(function($rootScope) {
        console.log("app running");
        /*$rootScope.$on('$stateChangeStart', function (event,toState) {
            var list;
            try {
                list = JSON.parse(window.sessionStorage.getItem("authorize_menus_list"));
            }
            catch(e) {

            }

            if (!list) {
                window.sessionStorage.clear();
                location.href = '/omp-login.html';
            }
            else { 
                if (!_.find(list, {state:toState.name})) event.preventDefault();
            }
        }); */ 
        //重新布局视图
        GLOBAL_resize();
        //清空缓存
        window.onunload = function() {
            window.localStorage.clear();
        };
    })
