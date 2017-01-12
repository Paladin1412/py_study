"use strict"
/**
 *  Module
 *
 *  广告主模块 Controller
 */
angular.module('omp.advertiser.ctrl', [])

/*  End
 *
 *  Controller 广告主审核-易效
 *
 *  Start
 */



.controller('omp-advertiser-yixiaoCtrl', function ($scope, $state, $sce, http, tools) {
	var stateParams = $state.params;

	function init() {

		//监听分页事件
		listenPageInfo();
		//获取搜索缓存
		var store = window.sessionStorage.getItem("advertiserYixiao");
		//从上一级菜单返回有缓存
		/*if (stateParams.msg.reload === true && store) {
			getSearchSessionStorage(JSON.parse(store));
			//获取易效列表
			getListData(getParams(true));
		}
		//清除缓存
		else {*/
		window.sessionStorage.removeItem("advertiserYixiao");
		//默认状态待审核
		$scope.search.status = $scope.search.statusList[1];
		//获取一级行业
		getIndustry("");
		//获取易效列表
		getListData(getParams(true));
		/*}*/
	};

	/*
	 *  获取的后台msg数据 易效数据列表
	 *  其中msg.list绑定至$scope.list上
	 *
	 *  total
	 *  rs
	 *  role
	 *  list
	 *  list.id
	 *  list.advertiserId
	 *  list.name
	 *  list.status
	 *  list.subIndustry
	 *  list.channel
	 *  list.agentId
	 *  list.agentName
	 *  list.channelSaler
	 *  list.subTimeStr
	 *  list.auditTime
	 *
	 */
	$scope.list = [];

	/*
	 *  页面信息数据绑定
	 *
	 *  total              总条数
	 *  role               用户角色 1管理员 2审核员
	 *  pageStart          分页开始页
	 *  pageLimit          分页上限
	 *  sortKey            排序关键字 subTime / auditTime
	 *  sortDir            排序方式  ASC / DESC
	 *  lastSearchStatus   本次查询后状态id 当id为0/!0时显示是否有下钻和审核按键(仅在普通审核员下有效)
	 *
	 */
	$scope.data = {
		total: "",
		role: 0,
		pageStart: 1,
		pageLimit: 10,
		sortKey: "",
		sortDir: "",
		inputWarning: "",
		lastSearchStatus: 0
	};

	/*
	 *  搜索栏数据绑定
	 *
	 *  status             选中状态  ""全部 0待审核 1通过 2拒绝 3失效
	 *  statusList         状态列表
	 *  channel            渠道商列表
	 *  industry           一级行业列表
	 *  subIndustry        二级行业列表
	 *  state
	 *  input              关键字搜索
	 *  way                选中的渠道
	 *  sup                选中的一级行业
	 *  sub                选中的二级行业
	 *  [sub]industry.id   行业id
	 *  [sub]industry.name 行业名称
	 */
	$scope.search = {
		status: {},
		statusList: [{
			id: "",
			name: "全部"
		}, {
			id: 0,
			name: "待审核"
		}, {
			id: 1,
			name: "通过"
		}, {
			id: 2,
			name: "拒绝"
		}, {
			id: 3,
			name: "失效"
		}],
		channel: [{
			id: "",
			name: "全部"
		}, {
			id: 1,
			name: "直客"
		}, {
			id: 2,
			name: "代理商"
		}],
		industry: [{
			id: "",
			name: "全部一级行业"
		}],
		subIndustry: [{
			id: "",
			name: "全部二级行业"
		}],
		input: "",
		way: {
			id: "",
			name: "全部"
		},
		sup: {
			id: "",
			name: "全部一级行业"
		},
		sub: {
			id: "",
			name: "全部二级行业"
		}
	};

	// 事件绑定
	$scope.event = {
		//开始审核 页面跳转
		audit: function (id, status) {
			var params = {
				"category": 1,
				"id": id ? id : "",
				"needAudit": status === 0 ? true : false,
			};
			$state.go("advertiser-aduit.list", {
				"msg": params
			});
		},
		//用户点击选择一级行业 联动查询二级行业
		industry: function (id) {
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
		//点击查询
		search: function () {
			//查询前检查输入框长度是否合法
			if (inputLengthCheck($scope.search.input) === true) {
				setSearchSessionStorage();
				getListData(getParams(true));
			}
		},
		//关键字排序 key = subTime / auditTime, dir = ASC / DESC
		sort: function (key) {
			if ($scope.data.sortDir === "") $scope.data.sortDir = "DESC";
			else if ($scope.data.sortDir === "DESC") $scope.data.sortDir = "ASC";
			else if ($scope.data.sortDir === "ASC") $scope.data.sortDir = "DESC";
			$scope.data.sortKey = key;
			getListData(getParams(true));
		},
		//查询输入校验最后40个字符
		inputLengthCheck: function (value) {
			inputLengthCheck(value);
		}
	};

	//设置搜索记录缓存
	function setSearchSessionStorage() {
		var store = {
			"status": $scope.search.status,
			"way": $scope.search.way,
			"input": $scope.search.input,
			"sup": $scope.search.sup,
			"sub": $scope.search.sub
		};
		window.sessionStorage.setItem("advertiserYixiao", JSON.stringify(store));
	};

	//获取搜索记录缓存
	function getSearchSessionStorage(store) {
		//设置默认状态
		for (var i = 0, len = $scope.search.statusList.length; i < len; ++i) {
			if ($scope.search.statusList[i].name === store["status"].name) {
				$scope.search.status = $scope.search.statusList[i];
			}
		}
		//设置默认渠道
		for (var i = 0, len = $scope.search.channel.length; i < len; ++i) {
			if ($scope.search.channel[i].name === store["way"].name) {
				$scope.search.way = $scope.search.channel[i];
				break;
			}
		}
		$scope.search.input = store["input"];
		//设置默认一级二级行业
		getIndustry("", store["sup"].name);
		getIndustry(store["sup"].id, store["sub"].name);
	};

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
		$scope.$on("getPageInfo", function (event, msg) {
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
			"industry": $scope.search.sup.id,
			"subIndustry": $scope.search.sub.id,
			"status": $scope.search.status.id,
			"nameId": $scope.search.input,
			"start": $scope.data.pageStart,
			"limit": $scope.data.pageLimit,
			"sort": $scope.data.sortKey,
			"dir": $scope.data.sortDir
		}
		return params;
	};

	//获取行业信息 id = "" / 正整数
	function getIndustry(id, defaultName) {
		var params = {
			"id": id
		};
		http("getIndustry", {
			"data": params
		}, function (msg) {
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
		http("p4pList", {
			"data": params
		}, function (msg) {
			//记录本次点击查询状态
			$scope.data.lastSearchStatus = $scope.search.status.id;
			//绑定角色
			$scope.data.role = msg.role;
			$scope.data.total = msg.total;
			$scope.data.userStatus = msg.userStatus;
			//绑定列表数据
			$scope.list = msg.list;
			//更新分页信息
			var pageParams = {
				start: $scope.data.pageStart,
				total: msg.total,
				length: msg.list.length
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
 *  Controller NEX
 *
 *  Start
 */

.controller('omp-advertiser-nexCtrl', function ($scope, $state, $sce, http, tools) {
	var stateParams = $state.params;

	function init() {
		//监听分页事件
		listenPageInfo();
		//获取搜索缓存
		var store = window.sessionStorage.getItem("advertiserNex");
		//从上一级菜单返回有缓存
		/*if (stateParams.msg.reload === true && store) {
			getSearchSessionStorage(JSON.parse(store));
			//获取易效列表
			getListData(getParams(true));
		}
		//清除缓存
		else {*/
		window.sessionStorage.removeItem("advertiserNex");
		//默认状态待审核
		$scope.search.status = $scope.search.statusList[1];
		//获取一级行业
		getIndustry("");
		//获取DSP列表
		getDspList();
		//获取易效列表
		getListData(getParams(true));
		/*}*/
	}

	/*
	 *  获取的后台msg数据 易效数据列表
	 *  其中msg.list绑定至$scope.list上
	 *
	 *  total
	 *  rs
	 *  role
	 *  list
	 *  list.id
	 *  list.advertiserId
	 *  list.name
	 *  list.status
	 *  list.subIndustry
	 *  list.channel
	 *  list.dspId
	 *  list.dspName
	 *  list.channelSaler
	 *  list.subTime
	 *  list.auditTime
	 *
	 */
	$scope.list = [];

	/*
	 *  页面信息数据绑定
	 *
	 *  total       总条数
	 *  role        用户角色 1管理员 2审核员
	 *  pageStart   分页开始页
	 *  pageLimit   分页上限
	 *  sortKey     排序关键字 subTime / auditTime
	 *  sortDir     排序方式  ASC / DESC
	 *  lastSearchStatus   本次查询后状态id 当id为0/!0时显示是否有下钻和审核按键(仅在普通审核员下有效)
	 */
	$scope.data = {
		total: "",
		role: 0,
		pageStart: 1,
		pageLimit: 10,
		sortKey: "",
		sortDir: "",
		inputWarning: "",
		lastSearchStatus: 0
	};

	/*
	 *  搜索栏数据绑定
	 *
	 *  sup                选中的一级行业
	 *  sub                选中的二级行业
	 *
	 *  status             选中的状态
	 *  statusList         状态列表
	 *
	 *  industry           一级行业列表
	 *  subIndustry        二级行业列表
	 *
	 *  input              关键字搜索
	 *  dsp                选中的dsp
	 *  dspList            dsp列表
	 *
	 *  [sub]industry.id   行业id
	 *  [sub]industry.name 行业名称
	 */
	$scope.search = {
		status: {},
		statusList: [{
			id: "",
			name: "全部"
		}, {
			id: 0,
			name: "待审核"
		}, {
			id: 1,
			name: "通过"
		}, {
			id: 2,
			name: "拒绝"
		}, {
			id: 3,
			name: "失效"
		}],
		dspList: [{
			id: "",
			name: "全部"
		}, {
			id: 1,
			name: "直客"
		}, {
			id: 2,
			name: "代理商"
		}],
		industry: [{
			id: "",
			name: "全部一级行业"
		}],
		subIndustry: [{
			id: "",
			name: "全部二级行业"
		}],
		input: "",
		dsp: {
			id: "",
			name: "全部"
		},
		sup: {
			id: "",
			name: "全部一级行业"
		},
		sub: {
			id: "",
			name: "全部二级行业"
		}
	};

	// 事件绑定
	$scope.event = {
		//开始审核 页面跳转  id为空视为随机分配 status代表当前过滤状态 0待审 else非待审
		audit: function (id, status) {
			var params = {
				"category": 2,
				"id": id ? id : "",
				"needAudit": status === 0 ? true : false
			};
			$state.go("advertiser-aduit.list", {
				"msg": params
			});
		},
		//用户点击选择一级行业 联动查询二级行业
		industry: function (id) {
			// 选择全部一级行业
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
		//点击查询
		search: function () {
			//检查输入长度
			if (inputLengthCheck($scope.search.input) === true) {
				setSearchSessionStorage();
				getListData(getParams(true));
			}
		},
		//关键字排序 key = subTime / auditTime, dir = ASC / DESC
		sort: function (key) {
			if ($scope.data.sortDir === "") $scope.data.sortDir = "DESC";
			else if ($scope.data.sortDir === "DESC") $scope.data.sortDir = "ASC";
			else if ($scope.data.sortDir === "ASC") $scope.data.sortDir = "DESC";
			$scope.data.sortKey = key;
			getListData(getParams(true));
		},
		inputLengthCheck: function (value) {
			inputLengthCheck(value);
		}
	};

	//设置搜索记录缓存
	function setSearchSessionStorage() {
		var store = {
			"status": $scope.search.status,
			"dsp": $scope.search.dsp,
			"input": $scope.search.input,
			"sup": $scope.search.sup,
			"sub": $scope.search.sub
		};
		window.sessionStorage.setItem("advertiserNex", JSON.stringify(store));
	};

	//获取搜索记录缓存
	function getSearchSessionStorage(store) {
		//设置默认状态
		for (var i = 0, len = $scope.search.statusList.length; i < len; ++i) {
			if ($scope.search.statusList[i].name === store["status"].name) {
				$scope.search.status = $scope.search.statusList[i];
				break;
			}
		}
		//设置默认渠道
		for (var i = 0, len = $scope.search.dsp.length; i < len; ++i) {
			if ($scope.search.channel[i].name === store["way"].name) {
				$scope.search.way = $scope.search.channel[i];
				break;
			}
		}
		$scope.search.input = store["input"];
		//设置默认一级二级行业
		getIndustry("", store["sup"].name);
		getIndustry(store["sup"].id, store["sub"].name);
		//设置默认dsp列表
		getDspList(store["dsp"].name);
	};

	//
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

	//获取最新请求参数 page = true(start从零开始)
	function getParams(page) {
		if (page === true) {
			//$scope.data.pageStart = 1;
		}
		var params = {
			"dspId": $scope.search.dsp.id,
			"industry": $scope.search.sup.id,
			"subIndustry": $scope.search.sub.id,
			"status": $scope.search.status.id,
			"nameId": $scope.search.input,
			"start": $scope.data.pageStart,
			"limit": $scope.data.pageLimit,
			"sort": $scope.data.sortKey,
			"dir": $scope.data.sortDir
		}
		return params;
	};

	//获取dsp列表
	function getDspList(defaultName) {
		http("getDsp", {
			"adapter": "dsp"
		}, function (msg) {
			//获取dsp列表
			$scope.search.dspList = msg.dsps;
			$scope.search.dspList.unshift({
				"id": "",
				"name": "全部"
			});
			if (defaultName) {
				for (var i = 0, len = $scope.search.dspList.length; i < len; ++i) {
					if (defaultName === $scope.search.dspList[i].name) {
						$scope.search.dsp = $scope.search.dspList[i];
						break;
					}
				}
			}
		});
	};

	//获取行业信息 id = "" / 正整数
	function getIndustry(id, defaultName) {
		var params = {
			"id": id
		};
		http("getIndustry", {
			"data": params
		}, function (msg) {
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
	var roleId = 2; //默认是普通审核人员
	//获取列表数据
	function getListData(params) {
		//输出查询参数
		http("nexList", {
			"data": params
		}, function (msg) {
			//记录本次点击查询的状态
			$scope.data.lastSearchStatus = $scope.search.status.id;
			//绑定角色
			$scope.data.role = msg.role;
			$scope.data.total = msg.total;
			$scope.data.userStatus = msg.userStatus;
			var roleId = msg.role; //  赋值绑定
			/*resetMenu(roleId);*/
			//绑定列表数据
			$scope.list = msg.list;
			//更新分页信息
			var pageParams = {
				start: parseInt($scope.data.pageStart),
				total: parseInt(msg.total),
				length: parseInt(msg.list.length)
			};
			sendPageInfo(pageParams);
		});
	};

	//监听分页请求 msg.start / limit
	function listenPageInfo() {
		$scope.$on("getPageInfo", function (event, msg) {
			$scope.data.pageStart = msg.start;
			$scope.data.pageLimit = msg.limit;
			getListData(getParams(true, true));
		})
	};

	//重新计算分页请求
	function sendPageInfo(params) {
		$scope.$broadcast("setPageInfo", params);
	};

	//init 初始化程序
	init();
	//init End
	//延迟展示NEX广告主
	/*function resetMenu(roleId){
		setTimeout(function(){
			if (!window.his) {
				window.his = document.referrer;

				if (his.indexOf('omp-login.html') > -1) {
					if(roleId == 1){//管理员
						$($(".omp-menu-sup p")[0]).click();
						$($(".omp-menu-sub li")[0]).click();
					}else{
						$($(".omp-menu-sup p")[0]).click();
						$($(".omp-menu-sub li")[1]).click();
					}

				}
			}
		},200);
	};*/


})

/*  End
 *
 *  Controller Audit
 *
 *  Start
 */

.controller('omp-advertiser-auditCtrl', function ($scope, $state, $timeout, http, cache) {
	var stateParams = $state.params;

	function init() {
		//获取页面参数
		getParams();
	};
	/*
	 *   advertiser   当前广告主信息
	 *
	 *   type         广告主类型 1易效/2NEX
	 *   lastState    上一次的的上级菜路由状态
	 */
	var advertiser = {
		type: "",
		lastState: "",
	};

	/*
	 *  $scope.data 页面数据绑定
	 *
	 *  pageTitle   页面导航标题 易效/NEX
	 *  pageInfo    基本信息分项 渠道/DSP公司
	 *  role        角色  1管理员/2审核员
	 *  needAudit   当前页面是否为待审状态 需要从上一页路由获取
	 */
	$scope.data = {
		pageTitle: "",
		pageInfo: "",
		role: 2,
		needAudit: false,
	};

	/*
	 * $scope.info         审核信息绑定数据
	 *
	 * id                  广告主自增id
	 * dspAdvertiserId     广告主id
	 * name                广告主名字
	 * url                 网址
	 * industryDetail      行业
	 * info                DSP(dspName)/Channel(channel)信息
	 * subTimeStr          提交资质时间
	 * statusStr           当前信息的审核状态
	 * lastAduitStatusStr  最后一次审核结果
	 *
	 */
	$scope.info = {
		id: "",
		dspAdvertiserId: "",
		name: "",
		url: "",
		industryDetail: "",
		info: "",
		subTimeStr: "",
		statusStr: "",
		lastAduitStatusStr: "",
	};

	$scope.event = {
		//锚点链接返回上一页
		link: function () {
			$state.go(advertiser.lastState, {
				msg: {
					"reload": true
				}
			});
		},
		popErrorClose: function () {
			$state.go(advertiser.lastState);
		},
		popSuccessClose: function () {
			$scope.popSuccess.show = false;
		}
	};

	//路由跳转至此页面,根据广告主类型与id,获取审核信息,flag为true时为向前查看记录
	function getStateInfo(data) {
		//设置页面类型
		advertiser.type = data.category;
		//记录上级菜单路由
		advertiser.lastState = advertiser.type === 1 ? "advertiser-yixiao" : "advertiser-nex";
		/*console.log(advertiser.lastState);*/
		//根据广告主类型设置页面信息
		$scope.data.pageTitle = advertiser.type === 1 ? "易效" : "NEX";
		$scope.data.pageInfo = advertiser.type === 1 ? "渠道" : "DSP公司";
		$scope.data.needAudit = data.needAudit;
		//获取广告主审核信息
		var params = {
			"category": data.category,
			"id": data.id
		};
		//查看请求参数

		http("startAudit", {
			data: params
		}, function (msg) {
			//请求错误不获取数据
			if (msg.rs === 2) {
				return popErrorShow(msg.info);
			};
			//绑定各项数据
			for (var key in $scope.info) {
				$scope.info[key] = msg[key];
			}
			//绑定channel
			if (advertiser.type === 1) {
				$scope.info.info = msg.channelStr;
			}
			//绑定dspName
			else if (advertiser.type === 2) {
				$scope.info.info = msg.dspName;
			}
			//缓存资质列表信息
			cache.set("credentials", msg.credentials);
			//缓存广告主部分信息
			cache.set("advertiserInfo", {
				"url": $scope.info.url,
				"name": $scope.info.name,
				"industryDetail": $scope.info.industryDetail,
			});
			window.sessionStorage.setItem("advertiserStartAuditVersion", msg.version);
			//通知listCtrl获取资质列表
			$scope.$broadcast("reloadList", {
				"id": msg.id,
				"needAudit": $scope.data.needAudit
			});
		});
	};

	//获取初始化参数
	function getParams() {
		//获取缓存
		var store = getRequestSessionStorage();
		//如果有路由跳转信息 以路由跳转参数为准
		if (stateParams.msg && stateParams.msg.category) {
			//设置缓存
			setRequestSessionStorage(stateParams.msg);
			getStateInfo(stateParams.msg);
		}
		//没有路由跳转但有缓存信息
		else if (store) {
			getStateInfo(store);
		}
		//监听提交成功指示
		$scope.$on("getNextItem", function () {
			//待审核随机跳转至下一个
			if ($scope.data.needAudit === true) {
				var params = {
					"id": "",
					"category": stateParams.msg.category,
					"needAudit": $scope.data.needAudit
				}
				getStateInfo(params);
			}
			//扔然获取当前信息
			else {
				var params = {
					"id": $scope.info.id,
					"category": stateParams.msg.category,
					"needAudit": $scope.data.needAudit
				}
				getStateInfo(params);
			}
		});
		//监听提交错误提示
		$scope.$on("submitError", function (event, msg) {
			popErrorShow(msg);
		});

		//监听成功事件
		$scope.$on("popSuccessShow", function (event, msg) {
			popSuccessShow(msg);
		});
	}
	/*  * * * * * * * * * * * PART 请求参数缓存 * * * * * * *
	 *
	 *
	 */
	function setRequestSessionStorage(cache) {
		cache = JSON.stringify(cache);
		window.sessionStorage.setItem("advertiserAuditList", cache);
	}

	function getRequestSessionStorage() {
		var store = window.sessionStorage.getItem("advertiserAuditList")
		return JSON.parse(store);
	}

	/*  * * * * * * * * * * * PART 错误弹窗 * * * * * * *
	 *  $scope.popError (文字居中 单button)
	 *
	 *  show            是否显示弹窗
	 *  type            提示窗类型
	 *  header          提示窗标题文字
	 *  content         提示窗主文字
	 */
	$scope.popError = {
		show: false,
		type: -1,
		content: ""
	};
	$scope.popSuccess = {
		show: false,
		type: -1,
		content: ""
	};

	function popErrorShow(content) {
		$scope.popError.content = content;
		$scope.popError.show = true;
	};

	function popSuccessShow(content) {
		$scope.popSuccess.content = content;
		$scope.popSuccess.show = true;
	};

	//init 初始化程序
	init();
	//init End
})

/*  End
 *
 *  Controller Audit
 *
 *  Start
 */

.controller('omp-advertiser-listCtrl', function ($scope, $state, $timeout, http, cache) {
	var stateParams = $state.params;
	//页面启动程序
	function init() {
		getCredentials();
	};

	/*
	 * itemId             提交资质id
	 * $scope.list        绑定资质列表
	 *
	 * name               资质名称
	 * tips[bool]         提交时有带审核项目提示文字
	 * expireTimeStr      失效时间
	 * statusStr          审核状态
	 * reason             最后一次拒绝原因
	 * subTimeStr         提交资质时间
	 * operator           操作人
	 * operatorTime       操作时间
	 * rejectReasonsShow  审核后拒绝原因显示
	 *
	 */
	var itemId;
	$scope.list = [];
	/*
	 * 当前页面是否为待审核状态
	 */

	//事件绑定
	$scope.event = {
		//具体信息审核
		detail: function (index) {
			$state.go("advertiser-aduit.detail", {
				"msg": {
					"index": index,
					"listLen": $scope.list.length
				}
			});
		},
		submit: function () {
			if ($scope.list.length === 0) return;
			//是否有待审核选项
			var dirty = false;
			//是否有拒绝选项
			var hasReject = false;
			for (var i = 0, len = $scope.list.length; i < len; ++i) {
				if ($scope.list[i].statusStr === "待审核") {
					dirty = true;
					$scope.list[i].tips = true;
				}
				//不显示提示文字
				else {
					$scope.list[i].tips = false;
				}
				if ($scope.list[i].statusStr === "拒绝") {
					hasReject = true;
				}
			}
			//有未填信息退出
			if (dirty) return;
			//有拒绝项时根绝当前是否为待审状态显示弹窗
			if (hasReject === true) {
				//待审状态
				if ($scope.data.needAudit === true) {
					popAlertShow(2, "提交提醒", "您确定要拒绝此广告主同时进入到下一个广告主的审核页面吗？");
				}
				//非待审状态
				else {
					popAlertShow(3, "提交提醒", "您确定要拒绝此广告主吗？");
				}
			}
			//没有拒绝项时 无弹窗
			else {
				submitAudit();
			}

		},
		//提交内容
		popAlertConfirm: function () {
			$scope.popAlert.show = false;
			//提交申请
			submitAudit();
		},
	};

	//提交当前广告主信息
	function submitAudit() {
		var params = {
			"id": parseInt(window.sessionStorage.getItem("advertiserAuditAdvertiserAutoId")),
			"version": window.sessionStorage.getItem("advertiserStartAuditVersion"),
			"credentials": []
		};
		for (var i = 0, len = $scope.list.length; i < len; ++i) {
			var node = {
				"id": $scope.list[i].id,
				"expireTimeStr": $scope.list[i].expireTimeStr,
				"status": $scope.list[i].statusStr === "通过" ? 1 : 2,
				"reasonIds": $scope.list[i].submitReasonIds,
				"reason": $scope.list[i].submitReasonInput
			};
			//如果有拒绝原因则为id数组,将其装换为字符串
			if (node.reasonIds instanceof Array) {
				node.reasonIds = node.reasonIds.join(",");
			}
			params.credentials.push(node);
		}
		http("subAudit", {
			"data": params
		}, function (msg) {
			//提交错误
			if (msg.rs === 2) {
				return $scope.$emit("submitError", msg.info);
			}
			if (msg && msg.rs === 1) {
				//提交内容切换至下一个广告主/或刷新当前广告主信息
				if ($scope.data.needAudit === true) {
					$scope.$emit("getNextItem");
				} else {
					$state.go("advertiser-nex");
					//$('.omp-menu a:contains("NEX广告主")').click()
				}

				$scope.popAlert.show = false;
				//关闭弹窗
			}
		});
	};

	//获取资质审核列表
	function getCredentials() {
		$scope.$on("reloadList", function (event, data) {
			$scope.list = cache.get("credentials");
			window.sessionStorage.setItem("advertiserAuditAdvertiserAutoId", data.id);
		});
		/*if (stateParams.msg === "reloadList") {*/
		$scope.list = cache.get("credentials");
		/*}*/
	};

	/*  * * * * * * * * * * * PART 提示弹窗 * * * * * * *
	 *  $scope.popAlert
	 *
	 *  show            是否显示弹窗
	 *  type            提示窗类型1(文字居中 单button) 2(文字左对齐 双button) 3(文字居中 双button)
	 *  header          提示窗标题文字
	 *  content         提示窗主文字
	 */
	$scope.popAlert = {
		show: false,
		type: -1,
		header: "",
		content: ""
	};

	function popAlertShow(type, header, content) {
		$scope.popAlert.type = type;
		$scope.popAlert.header = header;
		$scope.popAlert.content = content;
		//
		$scope.popAlert.show = true;
	};

	//init 初始化程序
	init();
	//init End

})

/*  End
 *
 *  Controller Audit
 *
 *  Start
 */


.controller('omp-advertiser-detailCtrl', function ($scope, $state, $timeout, http, cache, tools) {
	var stateParams = $state.params;
	//页面启动程序
	function init() {
		//详细资质审核也刷新时返回资质列表
		if (stateParams.msg.index === undefined) {
			return $state.go("advertiser-aduit.list")
		}
		//
		else {
			getCredential(stateParams.msg.index);
			//监听事件空间失去焦点验证
			$scope.$on("dateTimePicker", function () {
				expiredTimeCheck();
			})
		}
	};

	/*
	 * lastShowIndex 当前显示图片的序号
	 * $scope.imgs   绑定图片资源
	 *
	 * src           urlArr数组地址
	 * show          是否为选中图片
	 *
	 */
	var lastShowIndex = 1;
	$scope.imgs = [];

	/*
	 * warning                  提示文字文案集合
	 * $scope.rejectReasons     请求的拒绝原因数组
	 * rejectReasons.id
	 * rejectReasons.reason
	 * rejectReasons.checked
	 * otherReasonX,otherReasonY 其他原因坐标点
	 */
	var warnings = {
		notNull: "文本框不能为空",
		//overLength: "文本长度过长",
		pass: "请取消勾选拒绝原因",
		reject: "请勾选拒绝原因",
		successful: "操作成功"
	};
	var otherReasonX = -1,
		otherReasonY = -1;
	$scope.rejectReasons = [];

	/*
	 * $scope.info          页面审核信息
	 *
	 * id                   当前页面资质类型
	 * title                页面审核标题
	 * statusStr            审核状态
	 * reason               拒绝原因
	 * warning              验证提示文字
	 * input                富输入框内容
	 * inputCharLength      输入字符长度
	 * textareaDisabled     富输入框是否可用
	 * expireTimeStr        设置失效时间
	 * expireNeed           是否显示DatePicker
	 * cid                  拒绝原因Id (29为广告主基本信息)
	 *
	 * url                  广告主基本信息审核-url
	 * industryDetail       广告主基本信息审核-行业
	 * name                 广告主基本信息审核-广告主名
	 *
	 * rightBtnShow         右切换按键是否显示
	 * leftBtnShow          左切换按键是否显示
	 */

	$scope.info = {
		id: 0,
		title: "",
		statusStr: "",
		reason: "",
		input: "",
		inputCharLength: 0,
		textareaDisabled: true,
		warning: "",
		expireTimeStr: "",
		expireNeed: false,
		expireWarning: "",
		required: false,
		url: "",
		industryDetail: "",
		name: "",
		cid: -1,
		rightBtnShow: false,
		leftBtnShow: false,
	};

	/*
	 * $scope.event 事件绑定
	 */
	$scope.event = {
		//切换图片显示
		switchImg: function (index) {
			$scope.imgs[lastShowIndex].show = false;
			$scope.imgs[index].show = true;
			lastShowIndex = index;
		},
		//拒绝输入框选中
		checked: function (parentIndex, index) {
			var checked = !$scope.rejectReasons[parentIndex][index].checked;
			$scope.rejectReasons[parentIndex][index].checked = checked;
			//控制富输入框时候可用
			if ($scope.rejectReasons[parentIndex][index].id === -999) {
				$scope.info.textareaDisabled = !checked;
				//取消勾线其他原因时清空内容
				if ($scope.info.textareaDisabled) {
					$scope.info.inputCharLength = 0;
					$scope.info.input = "";
				}
			}
		},
		//富输入框是否非空
		inputBlur: function (input) {
			if (trim(input) == "") {
				$scope.info.warning = warnings.notNull;
			}
			//
			else {
				$scope.info.warning = "";
			}
		},
		//切换审核页面
		switchAduit: function (mode) {
			var index = stateParams.msg.index;
			//prev
			if (mode === "prev") {
				index--;
			}
			//next
			else if (mode === "next") {
				index++;
				//$scope.info.textareaDisabled = true;
			}
			if (index >= 0 && index < stateParams.msg.listLen) {
				//更新序号 查找数据
				stateParams.msg.index = index;
				getCredential(stateParams.msg.index);
			}
		},
		//关闭详细审核
		close: function () {
			$state.go("advertiser-aduit.list", {
				"msg": "reloadList"
			});
		},
		//提交通过审核
		pass: function () {
			//验证失效时间
			if (!expiredTimeCheck()) return;
			if (hasChecked()) {
				$scope.info.warning = warnings.pass;
			}
			//通过验证
			else {
				$scope.info.warning = "";
				sumbit("通过");
				$scope.info.warning = warnings.successful;
				//$scope.$emit("popSuccessShow", '通过');

			}
		},
		//提交拒绝审核
		reject: function () {
			//验证失效时间
			if (!expiredTimeCheck()) return;
			if (!hasChecked()) {
				return $scope.info.warning = warnings.reject;
			}
			if ($scope.rejectReasons[otherReasonX][otherReasonY].checked && !textAreaCheck()) return;
			//通过验证
			$scope.info.warning = "";
			sumbit("拒绝");
			$scope.info.warning = warnings.successful;
			//$scope.$emit("popSuccessShow", '拒绝');
		},
		//清空失效时间
		clearExpireTime: function () {
			$scope.info.expireTimeStr = "";
			$("input#date-timepicker").val("");
		},
		//获取字符长度 汉子2字符
		fixInputCnLength: function (value) {
			$scope.info.inputCharLength = tools.getCharLength(value);
		},
	};
	//end ----------------
	//end ----------------
	//end ----------------

	//提交申请
	function sumbit(type) {
		var checkedInfo = {};
		if (type === "拒绝")
			checkedInfo = getChecked();
		var params = {
			"expireTimeStr": $scope.info.expireTimeStr,
			"statusStr": type,
			"rejectReasonsShow": type === "通过" ? "" : checkedInfo.str,
			"submitReasonIds": type === "通过" ? "" : checkedInfo.ids,
			"submitReasonInput": ""
		}
		if (params.submitReasonIds[params.submitReasonIds.length - 1] === -999) {
			params.submitReasonIds.length--;
			//添加输入框的其他原因
			params.rejectReasonsShow += $scope.info.input;
			params.submitReasonInput = $scope.info.input;
		}
		//将填写其他原因内容及拒绝原因相关信息加入缓存中

		params["cacheReasonList"] = $scope.rejectReasons;
		params["cacheInput"] = $scope.info.input;
		//填入缓存
		cache.set("credentials", params, {
			"index": stateParams.msg.index
		});
		//不关闭当前页
		//$scope.event.close();
	};

	//检查是否有拒绝原因被选中 true至少有一个被选中/false没有被选中的
	function hasChecked() {
		for (var i = 0, len1 = $scope.rejectReasons.length; i < len1; ++i) {
			for (var j = 0, len2 = $scope.rejectReasons[i].length; j < len2; ++j) {
				if ($scope.rejectReasons[i][j].checked) {
					return true;
				}
			}
		}
		return false;
	};

	//获取被选中的拒绝原因id数组
	function getChecked() {

		var rejectInfo = {
			ids: [],
			str: []
		};
		for (var i = 0, len1 = $scope.rejectReasons.length; i < len1; ++i) {
			for (var j = 0, len2 = $scope.rejectReasons[i].length; j < len2; ++j) {
				if ($scope.rejectReasons[i][j].checked) {
					rejectInfo.ids.push($scope.rejectReasons[i][j].id);
					if ($scope.rejectReasons[i][j].reason) {
						rejectInfo.str.push($scope.rejectReasons[i][j].reason);
					}
				}
			}
		};
		rejectInfo.str = rejectInfo.str.join(";");
		rejectInfo.str = rejectInfo.str.replace("其他原因", "");
		return rejectInfo;
	};

	//富输入框长度/非空检查
	function textAreaCheck() {
		var text = $scope.info.input;
		//非空检查
		if (trim(text) == "") {
			$scope.info.warning = warnings.notNull;
			return false;
		}
		//长度检查
		if ($scope.info.inputCharLength > 200) {
			//$scope.info.warning = warnings.overLength;
			return false;
		}
		//通过
		$scope.info.warning = "";
		return true;
	};

	//检查当前是否显示左右切换按键
	function checkSwitchShow() {
		//是否显示切换按键
		$scope.info.leftBtnShow = stateParams.msg.index > 0;
		$scope.info.rightBtnShow = stateParams.msg.index < stateParams.msg.listLen - 1;
	}

	//清除无效空格符
	function trim(text) {
		return text.replace(/(^\s*)|(\s*$)/, "");
	};

	function expiredTimeCheck() {
		if ($scope.info.required === 'true' && $scope.info.expireTimeStr === "") {
			$("div.omp-datetimepicker p").html("失效日期不能为空");
			return false;
		}
		//通过失效验证
		else {
			$("div.omp-datetimepicker p").html("");
			return true;
		}
	};
	//end ----------------
	//end ----------------
	//end ----------------
	//function contains(arr, obj) {
	//	var i = arr.length;
	//	while (i--) {
	//		if (arr[i] === obj) {
	//			return true;
	//		}
	//	}
	//	return false;
	//}

	//设置拒绝原因列表框与相关系想你
	function setReasonList(list, reasonIds, reason, rejectReasons, lastReason) {

		//$scope.info.reason = lastReason;
		var reasonsArray = list;
		if (reasonsArray == null || (reasonsArray != null && reasonsArray.length < 1)) {
			reasonsArray = new Array();
		}

		//向数组中加入其他原因这一选项
		reasonsArray.push({
			id: -999,
			reason: "其他原因",
			checked: false
		});
		//一行显示两个 所以一行内容也是一个数组(2条拒绝原因)
		var reasonsRow = [];
		for (var i = 1, len = reasonsArray.length; i <= len; ++i) {

			//contains(reasonIds,reasonsArray[i - 1].id); //返回true

			var reasonItem = {
				id: reasonsArray[i - 1].id,
				reason: reasonsArray[i - 1].reason,
				checked: false
			};
			reasonsRow.push(reasonItem);
			if (i % 2 == 0) {
				$scope.rejectReasons.push(reasonsRow);
				reasonsRow = [];
			}
		}
		//数据最后其他原因是否单独出来一个
		if (len % 2 == 1) {
			$scope.rejectReasons.push([{
				id: reasonsArray[len - 1].id,
				reason: reasonsArray[len - 1].reason,
				checked: false
			}]);
		}
		otherReasonX = $scope.rejectReasons.length - 1;
		otherReasonY = len % 2 == 1 ? 0 : 1;
	};

	//获取当前审核的资质信息
	function getCredential(index) {
		//设置切换按键是否显示
		checkSwitchShow();
		//从缓存中获取数据
		var data = cache.get("credentials", {
			"index": index
		});
		var reasonIds = [];
		//判断其他信息
		if (data === null) {
			return;
		} else if (reasonIds = []) {
			//console.log("err");
		} else {
			reasonIds = data.reasonIds.split(",");
		}

		//清空其他原因输入长度
		$scope.info.inputCharLength = 0;
		//绑定资质信息
		$scope.info.id = data.id;
		$scope.info.cid = data.cid;
		$scope.info.title = data.name;
		$scope.info.statusStr = data.statusStr;
		//$scope.info.reason = data.reason;
		$scope.info.input = "";
		$scope.info.warning = "";
		$scope.info.required = data.required;
		$scope.info.expireNeed = data.expireNeed;
		$scope.info.expireTimeStr = data.expireTimeStr;
		if ($scope.info.expireTimeStr === null || $scope.info.expireTimeStr === "--") {
			$scope.info.expireTimeStr = "";
		}
		//解决绑定无效 无法刷新问题
		$("input#date-timepicker").val(data.expireTimeStr);
		$("div.omp-datetimepicker p").html("");
		//
		//非广告主基本信息 获取数组图片

		if ($scope.info.cid != 29 && data.urlArr != null && data.urlArr != "") {
			$scope.imgs = [];
			//绑定图片数组
			for (var i = 0, len = data.urlArr.length; i < len; ++i) {
				var img = {
					src: data.urlArr[i],
					show: false,
					download: false,
				};
				if (tools.needDownload(img.src)) {
					img.download = true;

					//add by wangyuzhu
					//获取文件名及其后缀字符串
					var strIndexUrl = img.src.lastIndexOf("/") + 1;
					var strIndexSuffix = img.src.lastIndexOf(".") + 1;
					var strUrl = img.src.substring(strIndexUrl);
					var strSuffix = img.src.substring(strIndexSuffix);

					if (strSuffix.toLowerCase() == "zip") {
						$scope.data.downloadZip = true;
					}
					$scope.data.src = strUrl;
					//	add end
				}
				$scope.imgs.push(img);
			}
			lastShowIndex = 0;
			$scope.imgs[lastShowIndex].show = true;

		}
		//广告主信息
		else {
			var adInfo = cache.get("advertiserInfo");
			$scope.info.url = adInfo.url;
			$scope.info.name = adInfo.name;
			$scope.info.industryDetail = adInfo.industryDetail;

		}
		//有缓存内容,直接获取缓存中的原因列表及其他内容信息
		if (data.cacheReasonList) {
			$scope.rejectReasons = data.cacheReasonList;
			$scope.info.input = data.cacheInput;
			$scope.info.inputCharLength = tools.getCharLength($scope.info.input);
			//设置其他原因选项坐标
			otherReasonX = $scope.rejectReasons.length - 1;
			otherReasonY = $scope.rejectReasons[otherReasonX].length % 2 == 1 ? 0 : 1;
			//设置富输入框是否可用
			$scope.info.textareaDisabled = !$scope.rejectReasons[otherReasonX][otherReasonY].checked;
		}
		//没有缓存,请求拒绝原因列表
		else {
			$scope.rejectReasons = [];
			//获取拒绝原因列表
			var params = {
				"id": $scope.info.cid
			};
			http("getReasonList", {
				"data": params
			}, function (msg) {
				//提交后再点击去记录信息
				setReasonList(msg.reasons, data.reasonIds, data.reason, $scope.rejectReasons, data.lastReason);

				//if(data.reasonIds > 1){
				//   var reasonIdss = data.reasonIds.split(",");
				//	for(var i=0;i<reasonIdss.length;i++){
				//		var reasonId = reasonIdss[i];
				//		$scope.rejectReasons.forEach(function(item){
				//			for(var i=0;i<item.length;i++)
				//			{
				//				if(item[i].id==Number(reasonId))
				//				{
				//					item[i].checked = true;
				//				}
				//				if(data.reason == undefined){
				//					//console.log("err1");
				//				}else if(item[i].id == -999){
				//					item[i].checked = true;
				//					$scope.info.textareaDisabled = false;
				//					$scope.info.input = data.reason;
				//				}
				//			}
				//		})
				//	}
				//
				//}else{
				//	var reasonIdss = data.reasonIds;
				//	//for(var i=0;i<reasonIdss.length;i++){
				//		var reasonId = reasonIdss;
				//		$scope.rejectReasons.forEach(function(item){
				//			for(var i=0;i<item.length;i++)
				//			{
				//				if(item[i].id==Number(reasonId))
				//				{
				//					item[i].checked = true;
				//				}
				//				if(data.reason == undefined){
				//					//console.log("err1");
				//				}else if(item[i].id == -999){
				//					item[i].checked = true;
				//					$scope.info.textareaDisabled = false;
				//					$scope.info.input = data.reason;
				//				}
				//			}
				//		})
				//	}
				//}

				//将获取的缓存原因列表填入缓存 copy防止对象引用
				data["cacheReasonList"] = angular.copy($scope.rejectReasons);
				data["cacheInput"] = "";
				//填入缓存
				cache.set("credentials", data, {
					"index": stateParams.msg.index
				});
			});
		};
		//审核详情页面图片为一张时隐藏tab按钮
		var len = data.urlArr.length;
		if (len !== 1) {
			for (var i = 0; i < len; i++) {
				$scope.imgs[i].hideBtn = true;
			}
		} else {
			if ($scope.imgs[0] != null && $scope.imgs[0].length > 0) {
				$scope.imgs[0].hideBtn = false;
			}
		}



	};
	//缓存跳转记录审核信息
	function acheck(exits) {
		$scope.rejectReasons.forEach(function (item) {

			for (var i = 0; i < item.length; i++) {

				$scope.selectId = item[i].id;
				$scope.selectcheck = item[i].checked;
				if (item[i].checked) {
					$scope.info.reason = item[i].reason;
				}
			}
		})
	}

	//init 初始化程序
	init();
	//init End
	acheck();
})