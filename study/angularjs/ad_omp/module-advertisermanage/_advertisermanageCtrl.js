"use strict"
/**
 *  Module
 *
 *  广告主模块 Controller
 */
angular.module('omp.advertisermanage.ctrl', [])

/*  End
 *
 *  Controller 广告主审核-易效
 *
 *  Start
 */



.controller('omp-advertisermanage-yixiaoCtrl', function ($scope, $state, $stateParams, http, tools) {

	function init() {

		//监听分页事件
		listenPageInfo();
		//获取搜索缓存
		var store = window.sessionStorage.getItem("advertisermanageYixiao");
		//从上一级菜单返回有缓存
		/*if ($stateParams.msg.reload === true && store) {
			getSearchSessionStorage(JSON.parse(store));
			//获取易效列表
			getListData(getParams(true));
		}
		//清除缓存
		else {*/
		window.sessionStorage.removeItem("advertisermanageYixiao");
		//获取一级行业
		getIndustry();
		//获取易效列表
		getListData(getParams(true));
		/*}*/
	};

	/*
	 *   advertiser   当前广告主信息
	 *
	 *   lastState    上一次的的上级菜路由状态
	 */
	// var advertiser = {
	// 	lastState: "",
	// };

	/*
	 *  获取的后台msg数据 易效数据列表
	 *  其中msg.list绑定至$scope.list上
	 *
	 *  total
	 *  rs
	 *  info
	 *  list
	 *  list.id
	 *  list.dspAdvertiserId
	 *  list.name
	 *  list.accountStatusStr
	 *  list.industryStr
	 *  list.subIndustryStr
	 *  list.channelStr
	 *  list.agentId
	 *  list.agentName
	 *  list.accountLeft
	 *  list.nowCreativityNum
	 *  list.totalCreativityNum
	 *  list.refuseCreativityNum
	 *  list.registerTimeStr
	 *
	 */
	$scope.list = [];

	/*
	 *  页面信息数据绑定
	 *
	 *  total              总条数
	 *  pageStart          分页开始页
	 *  pageLimit          分页上限
	 *  sortKey            排序关键字 subTime / auditTime
	 *  sortDir            排序方式  ASC / DESC
	 *
	 */
	$scope.data = {
		total: "",
		pageStart: 1,
		pageLimit: 10,
		sortKey: "dspAdvertiserId",
		sortDir: "DESC",
		inputWarning: ""
	};

	/*
	 *  搜索栏数据绑定
	 *
	 *  channel            渠道商列表
	 *  industry           一级行业列表
	 *  subIndustry        二级行业列表
	 *  way                选中的渠道
	 *  sup                选中的一级行业
	 *  sub                选中的二级行业
	 */
	$scope.search = {
		channel: [{
			id: 0,
			name: "全部"
		}, {
			id: 1,
			name: "直客"
		}, {
			id: 2,
			name: "代理商"
		}],
		way: {
			id: 0,
			name: "全部"
		},
		industry: [{
			id: 0,
			name: "全部一级行业"
		}],
		subIndustry: [{
			id: 0,
			name: "全部二级行业"
		}],
		sup: {
			id: 0,
			name: "全部一级行业"
		},
		sub: {
			id: 0,
			name: "全部二级行业"
		},
		input: ''
	};

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

	// 事件绑定
	$scope.event = {
		//进入详情页，可操作冻结
		show: function (id) {
			var params = {
				"id": id ? id : ""
			};
			$state.go("advertisermanage-yixiao-show", {
				"msg": params
			});
		},
		//用户点击选择一级行业 联动查询二级行业
		industry: function (id) {
			// 选择全部一级行业 二级行业只展示全部
			if (id == 0) {
				$scope.search.subIndustry = [{
					id: 0,
					name: "全部二级行业"
				}];
				$scope.search.sub = {
					id: 0,
					name: "全部二级行业"
				}
			}
			// 选择具体一级行业 二级行业联动
			else {
				getSubIndustry(id);
			}
		},
		popErrorClose: function () {
			$scope.popError.show = false;
			//$state.go(advertiser.lastState);
		},
		//点击查询
		search: function () {
			//查询前检查输入框长度是否合法
			if (inputLengthCheck($scope.search.input) === true) {
				setSearchSessionStorage();
				getListData(getParams(true));
			}
		},
		//关键字排序 key = accountLeft / nowCreativityNum / totalCreativityNum / refuseCreativityNum / registerTime, dir = ASC / DESC
		// sort: function(key) {
		// 	if ($scope.data.sortDir === "") $scope.data.sortDir = "DESC";
		// 	else if ($scope.data.sortDir === "DESC") $scope.data.sortDir = "ASC";
		// 	else if ($scope.data.sortDir === "ASC") $scope.data.sortDir = "DESC";
		// 	$scope.data.sortKey = key;
		// 	getListData(getParams(true));
		// },
		//查询输入校验最后40个字符
		inputLengthCheck: function (value) {
			inputLengthCheck(value);
		}
	};

	//设置搜索记录缓存
	function setSearchSessionStorage() {
		var store = {
			"way": $scope.search.way,
			"input": $scope.search.input,
			"sup": $scope.search.sup,
			"sub": $scope.search.sub
		};
		window.sessionStorage.setItem("advertisermanageYixiao", JSON.stringify(store));
	};

	//获取搜索记录缓存
	function getSearchSessionStorage(store) {
		//设置默认渠道
		for (var i = 0, len = $scope.search.channel.length; i < len; ++i) {
			if ($scope.search.channel[i].name === store["way"].name) {
				$scope.search.way = $scope.search.channel[i];
				break;
			}
		}
		$scope.search.input = store["input"];
		//设置默认一级二级行业
		getIndustry(store["sup"].name);
		getSubIndustry(store["sup"].id, store["sub"].name);
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
			//$scope.data.pageStart = 1;
		}
		var params = {
			"channel": $scope.search.way.id,
			"industry": $scope.search.sup.id,
			"subIndustry": $scope.search.sub.id,
			"nameId": $scope.search.input,
			"start": $scope.data.pageStart,
			"limit": $scope.data.pageLimit,
			"sort": $scope.data.sortKey,
			"dir": $scope.data.sortDir
		}
		return params;
	};

	//获取行业信息
	function getIndustry(defaultName) {
		var params = {};
		http("getYXIndustry", {
			type: "advertiser",
			"data": params
		}, function (msg) {
			//一级行业
			$scope.search.industry = msg.detail.level1List || [];
			$scope.search.industry.unshift({
				id: 0,
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
					id: 0,
					name: "全部一级行业"
				}
			}
		});
	};
	//获取二级行业信息 id = "" / 正整数
	function getSubIndustry(id, defaultName) {
		var params = {
			"industryLevel1Id": id
		};
		http("getYXSubIndustry", {
			type: "advertiser",
			"data": params
		}, function (msg) {
			$scope.search.subIndustry = msg.detail.level2List || [];
			$scope.search.subIndustry.unshift({
				id: 0,
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
					id: 0,
					name: "全部二级行业"
				}
			}
		});
	}

	//获取列表数据
	function getListData(params) {
		//输出请求参数
		http("p4pManageList", {
			type: "advertiser",
			"data": params
		}, function (msg) {
			console.log(msg);
			if (msg.result == 'error') {
				return popErrorShow('获取列表数据失败，请稍后再试！');
			} else {
				//记录本次点击查询状态
				$scope.data.total = msg.total;
				//绑定列表数据
				$scope.list = msg.invdata;
				//更新分页信息
				var pageParams = {
					start: $scope.data.pageStart,
					total: msg.total,
					length: msg.invdata.length
				};
				sendPageInfo(pageParams);
			}
		});
	};

	function popErrorShow(content) {
		$scope.popError.content = content;
		$scope.popError.show = true;
	};

	//init 初始化程序
	init();
	//init End
})

/*  End
 *
 *  Controller 广告主审核-易效-详情页
 *
 *  Start
 */

.controller('omp-advertisermanage-yixiao-showCtrl', function ($scope, $state, $timeout, $stateParams, http, cache) {

	function init() {
		//获取页面参数
		getParams();
	};
	/*
	 *   advertiser   当前广告主信息
	 *
	 *   lastState    上一次的的上级菜路由状态
	 */
	var advertiser = {
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
		//pageInfo: "",
		//role: 2,
		//needAudit: false,
	};

	/*
	 * $scope.info         审核信息绑定数据
	 *
	 * id                  广告主自增id
	 * dspAdvertiserId     广告主id
	 * name                广告主名字
	 * accountStatusStr    账户状态
	 * channelStr 		   渠道
	 * agentName           所属代理商
	 * url                 网址
	 * industryDetail      行业
	 * contacter           联系人
	 * tel                 保密电话
	 * email               保密邮箱
	 * address             通讯地址
	 * registerTimeStr     注册时间
	 * lastFreezeStatus    最后一次账户冻结状态
	 * accountLeft         账户余额
	 * totalRecharge       累计充值
	 * totalExpense        累计消费
	 * totalRefuse         总创意数
	 * unauditRefuse	   待审核创意数
	 * auditSuccessRefuse  已通过创意数
	 * auditFailRefuse     未通过创意数
	 */
	$scope.info = {
		id: "",
		dspAdvertiserId: "",
		name: "",
		accountStatusStr: "",
		channelStr: "",
		agentName: "",
		url: "",
		industryDetail: "",
		contacter: "",
		tel: "",
		email: "",
		address: "",
		registerTimeStr: "",
		lastFreezeStatus: "",
		accountLeft: "",
		totalRecharge: "",
		totalExpense: "",
		totalRefuse: "",
		unauditRefuse: "",
		auditSuccessRefuse: "",
		auditFailRefuse: ""
	};

	/*
	 * $scope.status       存储当前广告主状态信息
	 *
	 * id                  广告主id
	 * freeze              广告主冻结状态
	 */
	$scope.status = {
		freeze: false,
		id: ""
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
		},
		openSwitch: function () {
			if (!$scope.status.freeze) {
				popAlertShow(2, "冻结提醒", "冻结后，该广告主正在投放的创意将会停投，且新创意将不会进入审核，确定要冻结吗？");
			} else {
				popAlertShow(2, "解冻提醒", "确定要解冻此广告主吗？");
			}
		},
		popAlertConfirm: function () {
			$scope.popAlert.show = false;
			//提交操作
			freeze();
		},
		explain: function (event) {
			$(event.target).next('span').show();
		},
		explainHide: function (event) {
			$(event.target).next('span').hide();
		}
	};

	//提交冻结解冻操作
	function freeze() {
		var params = {
			"id": $scope.status.id,
			"op": !$scope.status.freeze
		}
		http("advertiserFreeze", {
			type: "advertiser",
			data: params
		}, function (msg) {
			if (msg.result == 'error') {
				return popErrorShow('操作出错！');
			}
			$scope.status.freeze = !$scope.status.freeze;
		});
	}

	//路由跳转至此页面,根据广告主类型与id,获取审核信息,flag为true时为向前查看记录
	function getStateInfo(data) {
		//设置页面类型
		//advertiser.type = data.category;
		//记录上级菜单路由
		advertiser.lastState = "advertisermanage-yixiao";
		//根据广告主类型设置页面信息
		$scope.data.pageTitle = "易效";
		//$scope.data.pageInfo = "渠道";
		//$scope.data.needAudit = data.needAudit;
		//获取广告主审核信息
		var params = {
			//"category": data.category,
			"id": data.id
		};
		//查看请求参数

		http("advertiserDetails", {
			type: "advertiser",
			data: params
		}, function (msg) {
			//请求错误不获取数据
			console.log(msg);
			if (msg.result == 'error') {
				return popErrorShow('读取不到当前广告主信息！');
			};
			var data = msg['data'] || [];
			//绑定各项数据
			for (var key in $scope.info) {
				$scope.info[key] = data[key];
			}
			if (data['lastFreezeStatus']) {
				$scope.status.freeze = data['lastFreezeStatus'];
			}
			$scope.status.id = data['dspAdvertiserId'];
		});
	};

	//获取初始化参数
	function getParams() {
		//获取缓存
		var store = getRequestSessionStorage();
		//如果有路由跳转信息 以路由跳转参数为准
		if ($stateParams.msg.id) {
			//设置缓存
			setRequestSessionStorage($stateParams.msg);
			getStateInfo($stateParams.msg);
		}
		//没有路由跳转但有缓存信息
		else if (store) {
			getStateInfo(store);
		}
		//监听提交成功指示
		// $scope.$on("getNextItem", function() {
		// 	//待审核随机跳转至下一个
		// 	if ($scope.data.needAudit === true) {
		// 		var params = {
		// 			"id": "",
		// 			"category": $stateParams.msg.category,
		// 			"needAudit": $scope.data.needAudit
		// 		}
		// 		getStateInfo(params);
		// 	}
		// 	//扔然获取当前信息
		// 	else {
		// 		var params = {
		// 			"id": $scope.info.id,
		// 			"category": $stateParams.msg.category,
		// 			"needAudit": $scope.data.needAudit
		// 		}
		// 		getStateInfo(params);
		// 	}
		// });
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

	$scope.popAlert = {
		show: false,
		type: -1,
		header: "",
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