"use strict"
/**
 *  Module
 *
 *  收入模块 Controller
 */
angular.module('omp.income.ctrl', [])

	/*  End
	 *
	 *  Controller 易效广告主收入统计
	 *
	 *  Start
	 */

	.controller('omp-income-advertiser', function($scope, $state, $stateParams, http, tools) {

		//日期设置初始值
		var rangeDate = {
			startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endTime  : moment().subtract(1, 'days').format('YYYY-MM-DD')
		}
		/*
		 *  搜索栏数据绑定
		 *
		 *  channel            渠道商列表
		 *  way                选中的渠道
		 *  start              日期开始时间
		 *  end                日期结束时间
		 */
		$scope.search = {
			channel: [{
				id: '',
				name: "全部"
			}, {
				id: 1,
				name: "直客"
			}, {
				id: 2,
				name: "代理商"
			}],
			curDate: {
				start:rangeDate.startTime,
				end:rangeDate.endTime
			},
			way: {
				id: '',
				name: '全部'
			},
			downloadUrl: '/stat/exportAdvRevenue'
		};


		$scope.beginEndDate = rangeDate.startTime + '至' + rangeDate.endTime;
		/*
		 *  页面信息数据绑定
		 *
		 *  total              总条数
		 *  pageStart          分页开始页
		 *  pageLimit          分页上限
		 *
		 */
		$scope.data = {
			pageStart: 1,
			pageLimit: 10,
			total: ''
		};
		/*
		 *  获取接口数据绑定到$scope.list上
		 */
		$scope.list = [];
		// 事件绑定
		$scope.event = {
			//点击查询
			search: function() {
				//获取搜索内容
				getListData(getParams(true));
			},
			//名词解释
			explain: function (event, arg) {
				var terms = {
					"sum": "(总花费/曝光量)*1000",
					"average": "总花费/点击量"
				};
				$(event.target).next('span').text(terms[arg]).show();
			},
			explainHide: function (event) {
				$(event.target).next('span').hide();
			}
		};

		function init() {

			//监听分页事件
			listenPageInfo();

			getListData(getParams(true));
		};

		//双日历回调
		$scope.updateDate = function (start, end, label) {
			$scope.search.curDate.start = start;
			$scope.search.curDate.end = end;
		}

		//监听分页请求 msg.start / limit
		function listenPageInfo() {
			$scope.$on("getPageInfo", function(event, msg) {
				$scope.data.pageStart = msg.start;
				$scope.data.pageLimit = msg.limit;
				getListData(getParams());
			})
		};

		//重新计算分页请求
		function sendPageInfo(params) {
			$scope.$broadcast("setPageInfo", params);
		};

		//获取最新请求参数 page = true(start从零开始)
		function getParams(page) {
			if (page === true) {
				$scope.data.pageStart = 1;
			}
			var params = {
				"channel": $scope.search.way.id,
				"startTime": $scope.search.curDate.start,
				"endTime": $scope.search.curDate.end,
				"start":  $scope.data.pageStart,
				"limit":  $scope.data.pageLimit
			}
			console.log(params);
			return params;
		};

		//获取列表数据
		function getListData(params) {
			//输出请求参数
			http("advRevenue", { "data": params }, function(msg) {
				//绑定列表数据
				$scope.list = msg.lists
				$scope.data.total = msg.total
				//更新分页信息
				var pageParams = {
					start: $scope.data.pageStart,
					total: msg.total,
					length: msg.lists.length
				};

				sendPageInfo(pageParams);
			});
		};

		//init 初始化程序
		init();
		//init End
	})

	/*  End
	 *
	 *  Controller 易效代理商收入统计
	 *
	 *  Start
	 */
	.controller('omp-income-agent', function($scope, $state, $stateParams, http, tools) {

		//日期设置初始值
		var rangeDate = {
			startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endTime  : moment().subtract(1, 'days').format('YYYY-MM-DD')
		}
		/*
		 *  搜索栏数据绑定
		 *
		 *  nameId            输入的经销商名称或者ID
		 *  start            查询开始时间
		 *  end              查询结束时间
		 */
		$scope.search = {
			nameId: '',
			curDate: {
				start:rangeDate.startTime,
				end:rangeDate.endTime
			},
			downloadUrl: '/statistics/exportAgentRevenue'
		};

		$scope.beginEndDate = rangeDate.startTime + '至' + rangeDate.endTime;

		/*
		 *  页面信息数据绑定
		 *
		 *  total              总条数
		 *  pageStart          分页开始页
		 *  pageLimit          分页上限
		 *
		 */
		$scope.data = {
			pageStart: 1,
			pageLimit: 10,
			total: '',
			inputWarning: ''
		};
		/*
		 *  获取接口数据绑定到$scope.list上
		 */
		$scope.list = [];
		// 事件绑定
		$scope.event = {
			//点击查询
			search: function() {
				//查询前检查输入框长度是否合法
				if (inputLengthCheck($scope.search.nameId) === true) {
					// setSearchSessionStorage();
					getListData(getParams(true));
				}
			},
			//名词解释
			explain: function (event, arg) {
				var terms = {
					"sum": "(总花费/曝光量)*1000",
					"average": "总花费/点击量"
				};
				$(event.target).next('span').text(terms[arg]).show();
			},
			explainHide: function (event) {
				$(event.target).next('span').hide();
			},
			//查询输入校验最后40个字符
			inputLengthCheck: function(value) {
				inputLengthCheck(value);
			}
		};

		function init() {

			//监听分页事件
			listenPageInfo();

			getListData(getParams(true));
		};

		//双日历回调
		$scope.updateDate = function (start, end, label) {
			$scope.search.curDate.start = start;
			$scope.search.curDate.end = end;
		}
		//输入验证
		function inputLengthCheck(value) {
			//长度验证不通过
			if (tools.getCharLength(value) > 42) {
				$scope.data.inputWarning = "最多为42个字符";
				return false;
			}
			//长度验证通过
			else {
				$scope.data.inputWarning = "";
				return true;
			}
		};

		//监听分页请求 msg.start / limit
		function listenPageInfo() {
			$scope.$on("getPageInfo", function(event, msg) {
				$scope.data.pageStart = msg.start;
				$scope.data.pageLimit = msg.limit;
				getListData(getParams());
			})
		};

		//重新计算分页请求
		function sendPageInfo(params) {
			$scope.$broadcast("setPageInfo", params);
		};

		//获取最新请求参数 page = true(start从零开始)
		function getParams(page) {
			if (page === true) {
				$scope.data.pageStart = 1;
			}
			var params = {
				"agentIdOrName": $scope.search.nameId,
				"startTime": $scope.search.curDate.start,
				"endTime": $scope.search.curDate.end,
				"start": $scope.data.pageStart,
				"limit": $scope.data.pageLimit
			}
			console.log(params)
			return params;
		};

		//获取列表数据
		function getListData(params) {
			//输出请求参数
			http("agentRevenue", { "data": params }, function(msg) {
				console.log(msg)
				//绑定列表数据
				$scope.list = msg.lists
				$scope.data.total = msg.total
				//更新分页信息
				var pageParams = {
					start: $scope.data.pageStart,
					total: msg.total,
					length: msg.lists.length
				};

				sendPageInfo(pageParams);
			});
		};

		//init 初始化程序
		init();
		//init End
	})

	/*  End
	 *
	 *  Controller 行业收入统计
	 *
	 *  Start
	 */
	.controller('omp-income-industry', function($scope, $state, $stateParams, http, tools) {

		//日期设置初始值
		var rangeDate = {
			startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endTime  : moment().subtract(1, 'days').format('YYYY-MM-DD')
		}
		/*
		 *  搜索栏数据绑定
		 *
		 *  channel            渠道商列表
		 *  industry           一级行业列表
		 *  subIndustry        二级行业列表
		 *  way                选中的渠道
		 *  sup                选中的一级行业
		 *  sub                选中的二级行业
		 *  [sub]industry.id   行业id
		 *  [sub]industry.name 行业名称
		 */
		$scope.search = {
			category: [{
				id: "",
				name: "全部产品线"
			}, {
				id: 1,
				name: "易效"
			}, {
				id: 2,
				name: "NEX"
			}],
			industry: [{
				id: "",
				name: "全部一级行业"
			}],
			subIndustry: [{
				id: "",
				name: "全部二级行业"
			}],
			way: {
				id: "",
				name: "全部产品线"
			},
			sup: {
				id: "",
				name: "全部一级行业"
			},
			sub: {
				id: "",
				name: "全部二级行业"
			},
			curDate: {
				start:rangeDate.startTime,
				end:rangeDate.endTime
			},
			downloadUrl: '/statistics/exportIndustryRevenue'
		};


		$scope.beginEndDate = rangeDate.startTime + '至' + rangeDate.endTime;
		/*
		 *  页面信息数据绑定
		 *
		 *  total              总条数
		 *  role               用户角色 1管理员 2审核员
		 *  pageStart          分页开始页
		 *  pageLimit          分页上限
		 *
		 */
		$scope.data = {
			pageStart: 1,
			pageLimit: 10,
			total: ''
		};
		/*
		 *  获取接口数据绑定到$scope.list上
		 */
		$scope.list = [];
		// 事件绑定
		$scope.event = {
			//点击查询
			search: function() {
				getListData(getParams(true));
			},
			//名词解释
			explain: function (event, arg) {
				var terms = {
					"sum": "(总花费/曝光量)*1000",
					"average": "总花费/点击量"
				};
				$(event.target).next('span').text(terms[arg]).show();
			},
			explainHide: function (event) {
				$(event.target).next('span').hide();
			},
			//查询输入校验最后40个字符
			inputLengthCheck: function(value) {
				inputLengthCheck(value);
			},
			//用户点击选择一级行业 联动查询二级行业
			industry: function(id) {
				// 选择全部一级行业 二级行业只展示全部
				if (id == "") {
					$scope.search.subIndustry = [{
						id: "",
						name: "全部二级行业"
					}];
					$scope.search.sub = {
						id: "",
						name: "全部二级行业"
					}
				}
				// 选择具体一级行业 二级行业联动
				else {
					getIndustry(id);
				}
			},
		};

		function init() {

			//监听分页事件
			listenPageInfo();

			//监听日历事件
			$scope.$on("daterangepicker", function(event, msg) {
				$scope.search.beginEndDate = msg
			})
			//获取行业
			getIndustry("");
			getListData(getParams(true));
		};
		//双日历回调
		$scope.updateDate = function (start, end, label) {
			$scope.search.curDate.start = start;
			$scope.search.curDate.end = end;
		}
		//监听分页请求 msg.start / limit
		function listenPageInfo() {
			$scope.$on("getPageInfo", function(event, msg) {
				$scope.data.pageStart = msg.start;
				$scope.data.pageLimit = msg.limit;
				getListData(getParams());
			})
		};

		//重新计算分页请求
		function sendPageInfo(params) {
			$scope.$broadcast("setPageInfo", params);
		};

		//获取最新请求参数 page = true(start从零开始)
		function getParams(page) {
			if (page === true) {
				$scope.data.pageStart = 1;
			}
			var params = {
				"category": $scope.search.way.id,
				"industry": $scope.search.sup.id,
				"subIndustry": $scope.search.sub.id,
				"startTime": $scope.search.curDate.start,
				"endTime": $scope.search.curDate.end,
				"start":$scope.data.pageStart,
				"limit":$scope.data.pageLimit

			}
			console.log(params)
			return params;
		};
		//获取行业信息 id = "" / 正整数
		function getIndustry(id, defaultName) {
			var params = { "id": id };
			http("getIndustry", { "data": params }, function(msg) {
				//一级行业
				if (id == "") {
					$scope.search.industry = msg.industrys;
					$scope.search.industry.unshift({
						id: "",
						name: "全部一级行业"
					});
					$scope.search.sup = null;
					//查找默认值
					if (defaultName) {
						for (var i = 0, len = $scope.search.industry.length; i < len; ++i) {
							if ($scope.search.industry[i].name === defaultName) {
								$scope.search.sup = $scope.search.industry[i];
								break;
							}
						}
					}
					if ($scope.search.sup === null) {
						$scope.search.sup = {
							id: "",
							name: "全部一级行业"
						}
					}
				}
				//二级行业
				else if (id >= 0) {
					$scope.search.subIndustry = msg.industrys;
					$scope.search.subIndustry.unshift({
						id: "",
						name: "全部二级行业"
					});
					$scope.search.sub = null;
					//查找默认值
					if (defaultName) {
						for (var i = 0, len = $scope.search.subIndustry.length; i < len; ++i) {
							if ($scope.search.subIndustry[i].name === defaultName) {
								$scope.search.sub = $scope.search.subIndustry[i];
								break;
							}
						}
					}
					if ($scope.search.sub === null) {
						$scope.search.sub = {
							id: "",
							name: "全部二级行业"
						}
					}
				}
			});
		};

		//获取列表数据
		function getListData(params) {
			//输出请求参数
			http("industryRevenue", { "data": params }, function(msg) {
				//绑定列表数据
				$scope.list = msg.lists
				$scope.data.total = msg.total
				//更新分页信息
				var pageParams = {
					start: $scope.data.pageStart,
					total: msg.total,
					length: msg.lists.length
				};

				sendPageInfo(pageParams);
			});
		};

		//init 初始化程序
		init();
		//init End
	})

	/*  End
	 *
	 *  Controller 位置收入统计
	 *
	 *  Start
	 */
	.controller('omp-income-area', function($scope, $state, $stateParams, http, tools) {
		//日期设置初始值
		var rangeDate = {
			startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endTime  : moment().subtract(1, 'days').format('YYYY-MM-DD')
		}
		/*
		 *  搜索栏数据绑定
		 *
		 *  channel            渠道商列表
		 *  industry           一级行业列表
		 *  subIndustry        二级行业列表
		 *  way                选中的渠道
		 *  sup                选中的一级行业
		 *  sub                选中的二级行业
		 *  [sub]industry.id   行业id
		 *  [sub]industry.name 行业名称
		 */
		$scope.search = {
			category: [{
				id: "",
				name: "全部产品线"
			}, {
				id: 1,
				name: "易效"
			}, {
				id: 2,
				name: "NEX"
			}],
			columns: [{
				id: "",
				name: "全部栏目"
			}],
			positions: [{
				id: "",
				name: "全部位置"
			}],
			way: {
				id: "",
				name: "全部产品线"
			},
			sup: {
				id: "",
				name: "全部栏目"
			},
			sub: {
				id: "",
				name: "全部位置"
			},
			curDate: {
				start:rangeDate.startTime,
				end:rangeDate.endTime
			},
			downloadUrl: '/statistics/exportPositionRevenue'
		};

		$scope.beginEndDate = rangeDate.startTime + '至' + rangeDate.endTime;

		/*
		 *  页面信息数据绑定
		 *
		 *  total              总条数
		 *  role               用户角色 1管理员 2审核员
		 *  pageStart          分页开始页
		 *  pageLimit          分页上限
		 *
		 */
		$scope.data = {
			pageStart: 1,
			pageLimit: 10,
			total: ''
		};
		/*
		 *  获取接口数据绑定到$scope.list上
		 */
		$scope.list = [];
		// 事件绑定
		$scope.event = {
			//点击查询
			search: function() {
				getListData(getParams(true));
			},
			//名词解释
			explain: function (event, arg) {
				var terms = {
					"sum": "(总花费/曝光量)*1000",
					"average": "总花费/点击量"
				};
				$(event.target).next('span').text(terms[arg]).show();
			},
			explainHide: function (event) {
				$(event.target).next('span').hide();
			},
			//查询输入校验最后40个字符
			inputLengthCheck: function(value) {
				inputLengthCheck(value);
			},
			//用户点击选择栏目 联动查询位置
			column: function(id) {
				// 选择全部栏目 位置只展示全部
				if (id == "") {
					$scope.search.sup = {
						id: "",
						name: "全部栏目"
					};
					$scope.search.sub = {
						id: "",
						name: "全部位置"
					}
					$scope.search.positions = [{
						id: "",
						name: "全部位置"
					}]
				}
				// 选择具体栏目 位置联动
				else {
					getColumns(id);
				}
			},
		};

		function init() {

			//监听分页事件
			listenPageInfo();
			//监听日历事件
			$scope.$on("daterangepicker", function(event, msg) {
				$scope.search.beginEndDate = msg
			})
			//获取栏目
			getColumns("");
			getListData(getParams(true));
		};
		//双日历回调
		$scope.updateDate = function (start, end, label) {
			$scope.search.curDate.start = start;
			$scope.search.curDate.end = end;
		}
		//监听分页请求 msg.start / limit
		function listenPageInfo() {
			$scope.$on("getPageInfo", function(event, msg) {
				$scope.data.pageStart = msg.start;
				$scope.data.pageLimit = msg.limit;
				getListData(getParams());
			})
		};

		//重新计算分页请求
		function sendPageInfo(params) {
			$scope.$broadcast("setPageInfo", params);
		};

		//获取最新请求参数 page = true(start从零开始)
		function getParams(page) {
			if (page === true) {
				$scope.data.pageStart = 1;
			}
			var params = {
				"category": $scope.search.way.id,
				"column": $scope.search.sup.id,
				"position": $scope.search.sub.id,
				"startTime": $scope.search.curDate.start,
				"endTime": $scope.search.curDate.end,
				"start": $scope.data.pageStart,
				"limit": $scope.data.pageLimit
			}
			console.log(params)
			return params;
		};
		//获取栏目信息
		function getColumns (id) {
			var params = {"id": id};
			http('queryColumnsWithPosition', {"data": params}, function (msg) {
				if (!id) {
					$scope.search.columns = msg.columns
					$scope.search.columns.unshift({id: '', name: '全部栏目'})
					$scope.search.sup = {
						id: "",
						name: "全部栏目"
					}
				} else {
					$scope.search.positions = msg.positions
					$scope.search.positions.unshift({id: '', name: '全部位置'})
					$scope.search.sub = {
						id: "",
						name: "全部位置"
					}
				}
			})
		}

		//获取列表数据
		function getListData(params) {
			//输出请求参数
			http("positionRevenue", { "data": params }, function(msg) {
				//绑定列表数据
				$scope.list = msg.lists
				$scope.data.total = msg.total
				//更新分页信息
				var pageParams = {
					start: $scope.data.pageStart,
					total: msg.total,
					length: msg.lists.length
				};

				sendPageInfo(pageParams);
			});
		};

		//init 初始化程序
		init();
		//init End
	})
