"use strict"
/**
 *  Module
 *
 *  权限模块 Controller
 */
angular.module('omp.authorize.ctrl', [])

/*  End
 *
 *  Controller 角色列表
 *
 *  Start
 */



.controller('omp-authorize-roleList', function ($scope, $state, $stateParams, http, tools) {
	var pageInfo;
	var operaData;
	//初始化	
	function init() {
		pageInfo = {
			start: 1,
			limit: 10
		};
		operaData = {
			deleteId: null
		}
		$scope.popAlert = {};
		$scope.popError = {};
		$scope.data = {};
		$scope.event = {
			//弹出删除确认框
			delete: function (id) {
				$scope.popAlert.show = true;
				$scope.popAlert.type = 2;
				$scope.popAlert.content = '您确定要删除该角色？';
				$scope.popAlert.header = '删除角色';
				operaData.deleteId = id;
			},
			//删除确认回调
			popAlertConfirm: function () {
				http("deleteRole", {
					data: {
						roleId: operaData.deleteId
					}
				}, function (data) {
					if (data && data.rs == 2) {
						$scope.popError.show = true;
						$scope.popError.content = data.info;
					} else {
						getRoleList(pageInfo);
					}
					$scope.popAlert.show = false;
				});
			},
			popErrorClose: function () {
				$scope.popError.show = false;
			}
		};

		//监听分页器的广播
		$scope.$on("getPageInfo", function (event, data) {
			pageInfo.start = data.start;
			pageInfo.limit = data.limit;
			getRoleList(pageInfo);
		})
	}

	//获取角色列表
	function getRoleList(postData) {
		postData = tools.setDefaultValue(postData, {
			start: 1,
			limit: 20
		});

		http("getRoleList", {
			data: postData
		}, function (data) {
			data = tools.setDefaultValue(data, {});
			$scope.data.lists = data.list;
			$scope.data.total = data.total;

			//向分页器发送广播
			$scope.$broadcast("setPageInfo", {
				start: pageInfo.start,
				total: data.total,
				length: pageInfo.limit * pageInfo.start > data.total ? data.total - pageInfo.limit * (pageInfo.start - 1) : pageInfo.limit
			});
		});
	}

	init();
	getRoleList(pageInfo);

}).controller('omp-authorize-roleAdd', function ($scope, $state, $stateParams, $location, http, tools) {
	$('.omp-authorize-content').hide();
	var roleId = $location.search().roleId;
	var roleName = '';
	$scope.pList = [-100];
	$scope.popError = {};
	$scope.popAlert = {};
	$scope.popSuccess = {};
	$scope.title = roleId ? '修改' : '添加';
	$scope.event = {
		add: function () {
			var bl = true;
			if (!$scope.event.nameOnChange()) {
				bl = false;
			}

			if (!$scope.event.desOnChange()) {
				bl = false;
			}

			if ($scope.pList.length === 0 || $scope.pList[0] === -100) {
				$scope.pList.length = 0;
				bl = false;
			}

			if ($scope.roleNameError) {
				bl = false;
			}
			if (bl)
				submit();
		},
		popAlertConfirm: function (params) {
			$scope.popAlert.show = false;
			submit();
		},
		popErrorClose: function () {
			$scope.popError.show = false;
		},
		popSuccessClose: function () {
			$scope.popSuccess.show = false;
		},
		nameOnChange: function () {
			var bl = check();

			function check() {
				var l = tools.getCharLength($scope.roleName || '');
				if (l > 30) {
					$scope.roleNameError = '不能超过30个字符';
					return false;
				}

				if (l === 0) {
					$scope.roleNameError = '不能为空';
					return false;
				}
				if ($scope.roleNameError !== '角色名不能重复！')
					$scope.roleNameError = '';
				return true;
			}

			if (bl) {
				http("checkRole", {
					data: {
						name: $scope.roleName || '',
						oldName: roleName
					}
				}, function (data) {
					if (data.rs != 1) {
						$scope.roleNameError = '角色名不能重复！';
					} else {
						$scope.roleNameError = '';
						check();
					}
				});
			}
			return bl;
		},
		desOnChange: function () {
			var l = tools.getCharLength($scope.roleDesc || '');
			if (l > 100) {
				$scope.roleDescError = '不能超过100个字符';
				return false;
			}

			if (l === 0) {
				$scope.roleDescError = '不能为空';
				return false;
			}
			$scope.roleDescError = '';
			return true;
		}
	}

	http("getAllMenus", {
		data: {}
	}, function (memusData) {
		if (!memusData) memusData = {}
		else if (!memusData.menus) memusData.menus = [];

		if (roleId) {
			http("getRoleDetail", {
				data: {
					roleId: roleId
				}
			}, function (data) {
				data = tools.setDefaultValue(data, {});
				$scope.roleName = data.roleName;
				roleName = data.roleName;
				$scope.roleDesc = data.roleDesc;
				/*$scope.event.nameOnChange();
				$scope.event.desOnChange();*/
				$scope.pList = (data.permissionIds && data.permissionIds.split(',').map(
					function (v) {
						return parseInt(v);
					}
				)) || [];
				createTree();

				$('.omp-authorize-content').show();
			});
		} else {
			/*$scope.roleNameError = '不能为空';
			$scope.roleDescError = '不能为空';*/
			createTree();

			$('.omp-authorize-content').show();
		}

		function createTree() {
			var setting = {
				check: {
					enable: true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				callback: {
					onCheck: cbChange
				}
			};
			var imgPath = './css/_images/';
			memusData.menus.push({
				id: 0,
				pId: -1,
				name: '全部',
				type: -1
			})
			memusData.menus.forEach(function (v) {
				v.pId = v.pid;
				if (v.type === 0 || v.type === -1) {
					v.open = true;
					v.iconOpen = imgPath + 'tree_lv1_open.png';
					v.iconClose = imgPath + 'tree_lv1_close.png';
					v.icon = imgPath + 'tree_lv1_close.png';
				} else if (v.type === 1) {
					v.iconOpen = imgPath + 'tree_lv2_open.png';
					v.iconClose = imgPath + 'tree_lv2_close.png';
					v.icon = imgPath + 'tree_lv2_close.png';
				} else {
					v.icon = imgPath + 'tree_lv3.png';
				}

				if ($scope.pList.indexOf(v.id) >= 0) {
					v.checked = true;
				}
			})

			var zNodes = memusData.menus;

			var code;

			function setCheck() {
				var zTree = $.fn.zTree.getZTreeObj("authorize-tree"),
					type = {
						"Y": "ps",
						"N": "ps"
					};
				zTree.setting.check.chkboxType = type;
			}

			$(document).ready(function () {
				$.fn.zTree.init($("#authorize-tree"), setting, zNodes);
				setCheck();
			});
		}
	});


	function cbChange() {
		var treeObj = $.fn.zTree.getZTreeObj("authorize-tree");
		var nodes = treeObj.transformToArray(treeObj.getNodes());

		$scope.pList.length = 0;
		nodes.forEach(
			function (v) {
				if (v.checked)
					$scope.pList.push(v.id);
			}
		)
		$scope.$apply();
	}

	function submit() {
		http("saveOrUpateRole", {
			data: {
				roleId: roleId,
				roleName: $scope.roleName,
				roleDesc: $scope.roleDesc,
				permissionIds: $scope.pList.filter(function (v) {
					return !isNaN(v) && v != 0
				}).join(',')
			}
		}, function (data) {
			if (data && data.rs == 1) {
				location.href = '/omp-app.html#/authorize/roleList';
			} else {
				$scope.popError.show = true;
				$scope.popError.content = data && data.info;
			}
		});
	}
}).controller('omp-authorize-userList', function ($scope, $state, $stateParams, http, tools) {
	var pageInfo;
	var operaData;
	//初始化	
	function init() {
		pageInfo = {
			start: 1,
			limit: 10,
			userName: undefined
		};
		operaData = {
			deleteId: null
		}
		$scope.popAlert = {};
		$scope.popError = {};
		$scope.data = {};
		$scope.event = {
			//弹出删除确认框
			delete: function (id) {
				$scope.popAlert.show = true;
				$scope.popAlert.type = 2;
				$scope.popAlert.content = '您确定要删除该用户？';
				$scope.popAlert.header = '删除用户';
				operaData.deleteId = id;
			},
			//删除确认回调
			popAlertConfirm: function () {
				http("deleteUser", {
					data: {
						userId: operaData.deleteId
					}
				}, function (data) {
					if (data && data.rs == 2) {
						$scope.popError.show = true;
						$scope.popError.content = data.info;
					} else {
						getUserList(pageInfo);
					}
					$scope.popAlert.show = false;
				});
			},
			popErrorClose: function () {
				$scope.popError.show = false;
			},
			search: search,
			searchValOnChange: function () {
				var l = tools.getCharLength($scope.searchVal || '');
				if (l > 30) {
					$scope.searchValError = '不能超过30个字符';
					return false;
				}
				$scope.searchValError = '';
				return true;
			}
		};

		//监听分页器的广播
		$scope.$on("getPageInfo", function (event, data) {
			pageInfo.start = data.start;
			pageInfo.limit = data.limit;
			getUserList(pageInfo);
		})
	}

	//获取用户列表
	function getUserList(postData) {
		postData = tools.setDefaultValue(postData, {
			start: 1,
			limit: 20
		});

		http("getUserList", {
			data: postData
		}, function (data) {
			data = tools.setDefaultValue(data, {});
			$scope.data.lists = data.list;
			$scope.data.total = data.total;

			//向分页器发送广播
			$scope.$broadcast("setPageInfo", {
				start: pageInfo.start,
				total: data.total,
				length: pageInfo.limit * pageInfo.start > data.total ? data.total - pageInfo.limit * (pageInfo.start - 1) : pageInfo.limit
			});
		});
	}

	function search() {
		if ($scope.searchValError) return;
		pageInfo.userName = $scope.searchVal || '';
		pageInfo.start = 1;
		getUserList(pageInfo);
	}
	init();
	getUserList(pageInfo);

}).controller('omp-authorize-userAdd', function ($scope, $state, $stateParams, $location, http, tools) {
	$('.omp-authorize-content').hide();
	var userId = $location.search().userId;
	$scope.pList = [-100];
	$scope.list = [];
	$scope.popError = {};
	$scope.popAlert = {};
	$scope.popSuccess = {};
	$scope.title = userId ? '修改' : '添加';
	$scope.event = {
		add: function () {
			var bl = true;
			if (!userId && !$scope.event.nickNameOnChange()) {
				bl = false;
			}
			if (!$scope.event.userNameOnChange()) {
				bl = false;
			}
			if ($scope.pList.length === 0 || $scope.pList[0] === -100) {
				$scope.pList.length = 0;
				bl = false;
			}

			if ($scope.nickNameError) {
				bl = false;
			}
			if (bl)
				submit();
		},
		popAlertConfirm: function (params) {
			$scope.popAlert.show = false;
			submit();
		},
		popErrorClose: function () {
			$scope.popError.show = false;
		},
		popSuccessClose: function () {
			$scope.popSuccess.show = false;
		},
		cbChange: cbChange,
		nickNameOnChange: function () {
			var bl = check();

			function check() {
				var l = tools.getCharLength($scope.nickName || '');
				if (l > 100) {
					$scope.nickNameError = '不能超过100个字符';
					return false;
				}

				if (l === 0) {
					$scope.nickNameError = '不能为空';
					return false;
				}

				if ($scope.nickNameError != '用户名不能重复！')
					$scope.nickNameError = '';
				return true;
			}

			if (bl)
				http("checkUser", {
					data: {
						name: $scope.nickName || ''
					}
				}, function (data) {
					if (data.rs != 1) {
						$scope.nickNameError = '用户名不能重复！';
					} else {
						$scope.nickNameError = '';
						check();
					}
				});

			return bl;
		},
		userNameOnChange: function () {
			var l = tools.getCharLength($scope.userName || '');
			if (l > 30) {
				$scope.userNameError = '不能超过30个字符';
				return false;
			}
			if (l === 0) {
				$scope.userNameError = '不能为空';
				return false;
			}
			if (l < 2) {
				$scope.userNameError = '不能少于2个字符';
				return false;
			}
			$scope.userNameError = '';
			return true;
		}
	}
	http("getRoleList", {
		data: {
			start: 1,
			limit: 10000
		}
	}, function (data) {
		if (!data) data = {}
		else if (!data.list) data.list = [];
		$scope.list = _.chunk(data.list, 4);
		if (userId) {
			http("getUserDetail", {
				data: {
					userId: userId
				}
			}, function (userData) {
				userData = tools.setDefaultValue(userData, {});
				$scope.userName = userData.userName;
				$scope.nickName = userData.nickName;
				$scope.pList = (userData.roleIds && userData.roleIds.split(',').map(
					function (v) {
						var node = _.find(data.list, {
							roleId: parseInt(v)
						});
						if (node) node.checked = true;
						return parseInt(v);
					}
				)) || [];
				/*$scope.event.nickNameOnChange();
				$scope.event.userNameOnChange();*/
				$('.omp-authorize-content').show();
			});
		} else {
			/*$scope.event.nickNameOnChange();
			$scope.event.userNameOnChange();*/
			$('.omp-authorize-content').show();
		}
	});

	function submit() {
		http("saveOrUpateUser", {
			data: {
				userId: userId,
				userName: $scope.userName,
				nickName: $scope.nickName,
				roleIds: $scope.pList.filter(function (v) {
					return !isNaN(v) && v != 0
				}).join(',')
			}
		}, function (data) {
			if (data && data.rs == 1) {
				location.href = '/omp-app.html#/authorize/userList';
			} else {
				$scope.popError.show = true;
				$scope.popError.content = data && data.info;
			}
		});
	}

	function cbChange() {
		$scope.pList.length = 0;
		$(".roleSelectTb input:checked").each(
			function () {
				$scope.pList.push($(this).val());
			}
		)
	}
})