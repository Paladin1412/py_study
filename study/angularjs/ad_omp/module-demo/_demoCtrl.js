"use strict";
/**
 * Created by jg on 2016/12/1.
 *
 *  Module
 *
 *  demo模块 Controller
 *  用于演示日历指令调用
 */
angular.module('omp.demo.ctrl', [])
/*  End
 *
 *  Controller demo 日历指令调用
 *
 *  Start
 */
	.controller('omp-demoCtrl', function($scope, $state, $stateParams, http, tools) {
		console.log('datetimepicker....');

		//设置初始值
		$scope.date = {
			value:'2016-11-11'
		};


		//监听日历事件
		$scope.$on("dateTimePicker", function() {
			console.log($scope.date.value)
		})

	});

/*  End
 *
 */