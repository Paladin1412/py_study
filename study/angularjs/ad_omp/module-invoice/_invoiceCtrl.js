angular
    .module('omp.invoice',[])
    .controller('omp-invoice-listCtrl', function($scope, $state, $stateParams, http, tools) { 	
    	//roleId：1-超级管理员，2-管理员，3-数据分析员，4-销售，5-区域总经理，6-VP，7-收入会计，8-开票员

    	var roleId = 4;
		
		function init() {
			$scope.list = [];
	    	$scope.total = 0;
	    	
	    	$scope.token = window.sessionStorage.getItem('token');
	    	$scope.checkBox = {
	    		selectAll:false
	    	};
	        		
	    	//初始化搜索参数
	    	$scope.search = {
				dspList: [],
				invoiceTypeList:[{
			    	id: "",
			    	name: '全部发票类型'
				},{
			      	id: 1,
			      	name: '增值税普票',
			  	}, {
			      	id: 2,
			      	name: '增值税专票',
			  	}],
				invoiceStatusList:[{
			    	id: "",
			    	name: '全部发票状态'
				},{
			      	id: 0,
			      	name: '未开具',
			      	color:'#75819c'
			  	}, {
			      	id: 1,
			      	name: '未邮寄',
			      	color:'#7296ff'
			  	},{
			    	id: 2,
			    	name: '已邮寄',
			    	color:'#39ac4c'
				},{
			      	id: 3,
			      	name: '已作废',
			      	color:'#999999'
			  	}, {
			      	id: 4,
			      	name: '已拒绝',
			      	color:'#e7564b'
			  	}]		  	
			};
//			DEFAULT_START_DATE + '~' + moment().format('YYYY-MM-DD')
			var DEFAULT_START_DATE = '2015-12-01'
			$scope.data = {
				beginEndDate:DEFAULT_START_DATE + '至' + moment().format('YYYY-MM-DD'),
	    		dateBegin: "2015-12-01",
	    		dateEnd: moment().format('YYYY-MM-DD'),
	    		invoiceIdOrDspName:'',
	    		pageStart:1,
	    		pageLimit:10,
	    		pageTotal:0,
				dsp: {
					id: "",
					name: "全部代理商"
				},
				invoiceType:{
			    	id: "",
			    	name: '全部发票类型'
				},
				invoiceStatus:{
			    	id: "",
			    	name: '全部发票状态'
				}
			}			
			$scope.data.token = window.sessionStorage.getItem("token");
			
			//监听分页事件
			listenPageInfo();
			//获取搜索缓存
			
			//详情页修改了信息，该页面从缓存获取数据
//			if ($stateParams.msg.reload === true && store) {
			http('getUserCurrentAccount',{type:'invoice'},function(msg){
				roleId = msg.data.roleId;
				var permissions = msg.data.permissions;
				
				if(roleId == 4){//销售
					$scope.data.invoiceStatus = {
						id: 1,
						name: "未邮寄"
					}
					setTimeout(function(){
						$('.select-invoice-status option[value=2]').attr('selected','selected');
					},100);
				}else if(roleId == 8){//开票员
					angular.forEach(permissions,function(item){
						if(item == 'B_INVOICE') $scope.checkBox.isIssuedBtnShow = true;
					});
					$scope.data.invoiceStatus = {
						id: 0,
						name: "未开具"
					}
					setTimeout(function(){
						$('.select-invoice-status option[value=1]').attr('selected','selected');
					},100);
				}
				
//				var store = window.sessionStorage.getItem("invoiceSearch");
//				if (store) {
//					window.sessionStorage.removeItem("invoiceSearch");
//					$scope.data = JSON.parse(store);
//					
//					//获取发票列表
//					getDspList();
//				}
//				//清除缓存
//				else {
//					window.sessionStorage.removeItem("invoiceSearch");
//	
//					//获取发票列表
//					getDspList();
//				}
				getDspList();
			})
	
		}
		
		init();
		
    	//获取供应商列表
    	function getDspList(defaultName) {
			http("dspQuery", {type:'invoice'}, function(msg) {
				//获取dsp列表
				$scope.search.dspList = [];
				$scope.search.dspList.unshift({
					"id": "",
					"name": "全部代理商"
				});
				
				angular.forEach(msg.invdata,function(item){
					$scope.search.dspList.push({
						id:item.dspId,
						name:item.dspName
					});
				})
//				if (defaultName) {
//					for (var i = 0, len = $scope.search.dspList.length; i < len; ++i) {
//						if (defaultName === $scope.search.dspList[i].name) {
//							$scope.data.dsp = $scope.search.dspList[i];
//							break;
//						}
//					}
//				}
				
				getInvoiceList();
			});
		};
    	
    	/*
    	*
    	* 
    	* 
    	*获取发票列表 
    	* 
    	*/
    	
    	//获取发票搜索参数
    	function getParam(){
    		var params = {};
    		
    		params = {
	    		dspId : $scope.data.dsp.id,
	    		invoiceType : $scope.data.invoiceType.id,
	    		status : $scope.data.invoiceStatus.id,
				dateBegin : $scope.data.dateBegin,
				dateEnd : $scope.data.dateEnd,
	            invoiceIdOrDspName :  $scope.data.invoiceIdOrDspName,
	    		start : $scope.data.pageStart,
				limit : $scope.data.pageLimit
    		}
    		
    		return params;
    	}
    	
    	//获取发票列表数据
    	function getInvoiceList(){
    		var params = getParam();
   			console.log(params);
    		http('invoiceList',{"data":params,type:'invoice'},function(msg){
				$scope.list = msg.invdata;
				$scope.total = msg.total;
				
				angular.forEach($scope.list, function(objItem) {
					objItem.checked = false;//标记是否被选中
					
					//发票类型数值名称转换		
					var nowType = objItem.invoiceType;
					angular.forEach($scope.search.invoiceTypeList,function(typeItem){
						if(nowType === parseInt(typeItem.id)){
							objItem.invoiceTypeName = typeItem.name;
						}
					});
					
					//发票状态数值名称转换
					var nowStatus = objItem.status;
					
                	angular.forEach($scope.search.invoiceStatusList,function(statusItem){
                		if(nowStatus === parseInt(statusItem.id)){
                			objItem.statusColor = statusItem.color;
                			objItem.statusName = statusItem.name;
                		}
                	})
            	});
								
				//更新分页信息
				$scope.data.pageTotal = msg.total;
                sendPageInfo();
			})
    	}
		
		//点击搜索按钮
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
		//设置搜索记录缓存
		function setSearchSessionStorage() {
			var store = {
				dspId : $scope.data.dsp.id,
	    		invoiceType : $scope.data.invoiceType.id,
	    		status : $scope.data.invoiceStatus.id,
				dateBegin : $scope.data.dateBegin,
				dateEnd : $scope.data.dateEnd,
	            invoiceIdOrDspName :  $scope.data.invoiceIdOrDspName,
	    		start : $scope.data.pageStart,
				limit : $scope.data.pageLimit
			};
			window.sessionStorage.setItem("invoiceSearch", JSON.stringify(store));
		};
		//绑定事件
		$scope.event = {
//			invoiceNameChange:function(id,name){//改变供应商select
//				if(id == ""){
//					$scope.data.dsp = {
//						id: "",
//						name: "全部代理商"
//					}
//				}else{
//					$scope.data.dsp = {
//						id: id,
//						name: name
//					}
//				}
//			},
//			invoiceTypeChange:function(id,name){//改变发票类型select
//				if(id == ""){
//					$scope.data.invoiceStatus = {
//						id: "",
//						name: "全部发票类型"
//					}
//				}else{
//					$scope.data.invoiceType = {
//						id: id,
//						name: name
//					}
//				}
//			},
//			invoiceStatusChange:function(id,name){//改变发票状态select
//				if(id == ""){
//					$scope.data.invoiceType = {
//						id: "",
//						name: "全部发票状态"
//					}
//				}else{
//					$scope.data.invoiceStatus = {
//						id: id,
//						name: name
//					}
//				}
//			},
			updateDate:function(start, end, label) {//更新搜索的日期
	            console.log('daterange', start, end, label);
	            $scope.data.dateBegin = start;
	            $scope.data.dateEnd = end;
	      	},
	      	handleSearchClick:function(){//搜索
				if (inputLengthCheck($scope.data.invoiceIdOrDspName) === true) {
						setSearchSessionStorage();
						console.log($scope.data.dsp);
						getInvoiceList();
				}
			},
			inputLengthCheck: function(input) {//输入框是否非空
				inputLengthCheck(input);
			},
			selectAll:function($event){
				if($scope.checkBox.selectAll){
					angular.forEach($scope.list,function(item){
						item.checked = true;
					});
					$(".btn-grey").addClass('on');
				}else{
					angular.forEach($scope.list,function(item){
						item.checked = false;
					});
					$(".btn-grey").removeClass('on');
				}
			},
			selectOne:function(nodeChecked){
				var length = 0;
				
				angular.forEach($scope.list,function(item){
//					console.log(item.checked);
					if(!item.checked){
						$scope.checkBox.selectAll = false;
					}else{
						length++;
					}
				})
				if(length == $scope.list.length){
					$scope.checkBox.selectAll = true;
				}
				if(length == 0){
					$(".btn-grey").removeClass('on');
				}else{
					$(".btn-grey").addClass('on');
				}
			},
			handleIssueBtnClick:function(){
				$scope.ids = [];
				angular.forEach($scope.list,function(item){
					if(item.checked && item.status == 0){
						var obj = {
							id:item.id
						}
						$scope.ids.push(obj);
						console.log($scope.ids);
					}
				})
				
				if($scope.ids.length > 0){
					//普通弹窗
					$scope.popAlert = {
						show: false,
						type: -1,
						header: "提示",
						content: "您确定发票已开具成功？"
					};
					
			        function popAlertShow(type, header, content) {
						$scope.popAlert.type = type;
						$scope.popAlert.header = header;
						$scope.popAlert.content = content;
						$scope.popAlert.show = true;
					};
	
					popAlertShow(3, "提示", "您确定发票已开具成功？");
				}
			},
			popAlertConfirm:function(){
				var params = $scope.ids;
				http('invoiceMarkIssued',{"data":params,type:'invoice'},function(msg){
					
					if(msg && msg.result == 'success'){
						$scope.popAlert.show = false;
						$(".btn-grey").removeClass('on');
						getInvoiceList();
						$scope.checkBox.selectAll = false;
						
						console.log(msg);
					}else{
						$scope.popAlert.show = false;
						$scope.popError = {
							show: true,
							content: msg.info
						};
					}
				});
			},
			popErrorClose: function () {
				$scope.popError.show = false;
			}
		}
		
        /*  * * * * * * * * * * * PART 4 分页通信 * * * * * * *
         *  var pageInfo   分页信息
         *
         *  start          页面开始点
         *  limit          页面条数限制
         *  total          当前页面总条数
         *
         */

        //监听分页请求 msg.start / limit
        function listenPageInfo() {
            $scope.$on("getPageInfo", function(event, msg) {
                $scope.data.pageStart = msg.start;
                $scope.data.pageLimit = msg.limit;
                
                setSearchSessionStorage();
                getInvoiceList();
            })
        };
        //重新计算分页请求
        function sendPageInfo() {
            var params = {
                start: parseInt($scope.data.pageStart),
                total: parseInt($scope.data.pageTotal),
                length: parseInt($scope.list.length)
            }
            $scope.$broadcast("setPageInfo", params);
        };
    })
    
	/*
	 * 
	 * 
	 * 
	 *发票管理详情 
	 * 
 	 *
 	 *
 	 */
	.controller('omp-invoice-detailCtrl', function($scope, $state, $stateParams, http, tools) {
//		$controller('omp-invoice-listCtrl', {$scope: $scope}); //This works	

		var reloadFlag = false;//父页列表是否刷新，当更新了具体操作需要刷新
		$scope.invoiceStatusList = [{
		      	id: 0,
		      	name: '未开具',
		      	color:'#e7564b'
		  	}, {
		      	id: 1,
		      	name: '未邮寄',
		      	color:'#f78253'
		  	},{
		    	id: 2,
		    	name: '已邮寄',
		    	color:'#8dcc69'
			},{
		      	id: 3,
		      	name: '已作废',
		      	color:'#333333'
		  	}, {
		      	id: 4,
		      	name: '已拒绝',
		      	color:'#e7564b'
		  	}];
		$scope.invoiceTypeList =[{
		      	id: 1,
		      	name: '增值税普票',
		  	}, {
		      	id: 2,
		      	name: '增值税专票',
		  	}];
		
		$scope.invoiceItemTypeList = [{
			id:1,
			name:'广告费'
		},{
			id:2,
			name:'广告发布费'
		}];
		
		function initDate(){
			window.sessionStorage.setItem('token',$stateParams.token);

			http('getUserCurrentAccount',{type:'invoice'},function(ret){				
				// roleId：1-超级管理员，2-管理员，3-数据分析员，4-销售，5-区域总经理，6-VP，7-收入会计，8-开票员
				var roleId = ret.data.roleId;
				var permissions = ret.data.permissions;
				
				var id = parseInt($stateParams.id);

//				$.get('/invoice/info?id=1',function(msg){
//					msg = $.parseJSON(msg);
				var params = {id : id};
				http('invoiceInfo',{"data": params,type:'invoice'},function(msg){
					if(msg && msg.result == 'success' && msg.data){
						console.log(msg);
						$scope.invoiceInfo = msg.data.invoiceApply || {};
						$scope.invoiceInfo.token = window.sessionStorage.getItem('token');
						
						$scope.invoiceInfo.logs = msg.data.logs;
	                	$scope.invoiceInfo.checkPending = msg.data.checkPending;
	               	 	$scope.invoiceInfo.dspName = msg.data.dspName;
	
		                var nowInvoiceProjectType = $scope.invoiceInfo.invoiceItemType;
		                var nowStatusName, nowInvoiceTypeName, nowInvoiceProjectTypeName;   
		                $scope.invoiceInfo.corpCertBegin = moment($scope.invoiceInfo.corpCertBegin).format('YYYY-MM-DD');
		                $scope.invoiceInfo.corpCertEnd = moment($scope.invoiceInfo.corpCertEnd).format('YYYY-MM-DD');
	  					
		                angular.forEach($scope.invoiceStatusList, function(item) {
		                    if (item.id === $scope.invoiceInfo.status) {
		                        $scope.invoiceInfo.statusName = item.name;
		                        $scope.invoiceInfo.statusColor = item.color;
		                    }
		                });
		                
		                angular.forEach($scope.invoiceTypeList, function(item) {
		                    if ($scope.invoiceInfo.invoiceType === item.id) {
		                        $scope.invoiceInfo.invoiceTypeName = item.name;
		                    }
		                });
		                angular.forEach($scope.invoiceItemTypeList,function(item){
		                	if($scope.invoiceInfo.invoiceItemType == item.id){
		                		$scope.invoiceInfo.invoiceItemTypeName = item.name;
		                	}
		                });
	
		                
		                //审核-----isCheckBtnShow
		                //撤销按钮-----isOperateCancelBtnShow,只要开票员有撤销按钮
		                //标记开具-----isIssuedBtnShow
		                //拒绝开具-----isIssuedBtnShow
		                //发票作废-----isInvoiceCancelBtnShow
		                //成功邮寄-----isMailedBtnShow
		                //已邮寄 |-----发票作废
		                //|----- 撤销
		                //已邮寄发票页面 是没有“撤销”按钮的,也没有审核按钮
		                var isOperateCancelBtnShow = false;;
		                    isIssuedBtnShow = false,
		                    isIssuedRefuseBtnShow = false,
		                    isInvoiceCancelBtnShow = false,
		                    isMailedBtnShow = false,
		                    isCheckBtnShow = false;
		                
//		                if(roleId == 4){
//		                	if ($scope.invoiceInfo.status == 1) {//邮寄
//			                    isMailedBtnShow = true;
//			                }
//		                }else if(roleId == 7){
//			                if ($scope.invoiceInfo.status && $scope.invoiceInfo.status != 2　 && $scope.invoiceInfo.checkPending) {//审核
//			                    isCheckBtnShow = true;
//			                }
//		                }else if(roleId == 8){
//		                	if($scope.invoiceInfo.status &&  $scope.invoiceInfo.status != 2 && !$scope.invoiceInfo.checkPending){//撤销,除了未开具都有
//		                		isOperateCancelBtnShow = true;
//		                	}
//		                	if ($scope.invoiceInfo.status == 0) {//拒绝开具
//		                    	isIssuedBtnShow = true;
//		                	}
//		                	if ($scope.invoiceInfo.status == 1 || $scope.invoiceInfo.status == 2) {//未邮寄，已邮寄发票作废
//			                    isInvoiceCancelBtnShow = true;
//			                }
//		                }
						
						/*
						 * 1.开具                  B_INVOICE   
						 * 2.成功邮寄          B_SUCCESS_SEND
						 * 3.拒绝                  B_REFUSE
						 * 4.作废                  B_CANCEL
						 * 5.申请撤销          B_APPLY_REVOKE
						 * 6.撤销审批          B_REVOKE_AUDIT
						 * 7.数据导出          B_POI
						 */
						angular.forEach(permissions,function(item){
							switch(item){
								case 'B_INVOICE': isIssuedBtnShow = true;break;
								case 'B_SUCCESS_SEND' : isMailedBtnShow = true;break;
								case 'B_REFUSE' : isIssuedRefuseBtnShow = true;break;
								case 'B_CANCEL' : isInvoiceCancelBtnShow = true;break;
								case 'B_APPLY_REVOKE' : isOperateCancelBtnShow = true;break;
								case 'B_REVOKE_AUDIT' : isCheckBtnShow = true;break;
								case 'B_POI' : isExportData = true;
							}
						});
		                
		                if ($scope.invoiceInfo.status != 1) {//邮寄
		                    isMailedBtnShow = false;
		                }
		                if (!($scope.invoiceInfo.status && $scope.invoiceInfo.status != 2　 && $scope.invoiceInfo.checkPending)) {//审核
		                    isCheckBtnShow = false;
		                }
		                if(!($scope.invoiceInfo.status &&  $scope.invoiceInfo.status != 2 && !$scope.invoiceInfo.checkPending)){//撤销,除了未开具都有
	                		isOperateCancelBtnShow = false;
	                	}
	                	if ($scope.invoiceInfo.status) {//拒绝开具
	                    	isIssuedBtnShow = false;
	                    	isIssuedRefuseBtnShow = false;
	                	}
	                	if (!($scope.invoiceInfo.status == 1 || $scope.invoiceInfo.status == 2)) {//未邮寄，已邮寄发票作废
		                    isInvoiceCancelBtnShow = false;
		                }
		                
		                $scope.invoiceInfo.roleId = roleId;
		                $scope.invoiceInfo.isOperateCancelBtnShow = isOperateCancelBtnShow;
		                $scope.invoiceInfo.isIssuedBtnShow = isIssuedBtnShow;
		                $scope.invoiceInfo.isInvoiceCancelBtnShow = isInvoiceCancelBtnShow;
		                $scope.invoiceInfo.isMailedBtnShow = isMailedBtnShow;
		                $scope.invoiceInfo.isCheckBtnShow = isCheckBtnShow;
		                $scope.invoiceInfo.isExportData = isExportData;
		                $scope.invoiceInfo.isIssuedRefuseBtnShow = isIssuedRefuseBtnShow;
		                $scope.refuseContent = "";
	                }
	            });
            });
 		}           
	       
	    initDate();
	    
        //普通弹窗
        function popAlertShow(type, header, content) {
			$scope.popAlert.type = type;
			$scope.popAlert.header = header;
			$scope.popAlert.content = content;
			$scope.popAlert.show = true;
		};
        //拒绝,作废操作弹窗
		function popAlertRefuseShow(header, content1,content2,content3) {
			$scope.popRefuseAlert.header = header;
			$scope.popRefuseAlert.content1 = content1;
			$scope.popRefuseAlert.content2 = content2;
			$scope.popRefuseAlert.content3 = content3;
			$scope.popRefuseAlert.show = true;
		};
	                
		$scope.event = {
			handleOperateCancelBtnClick:function(){//弹窗撤销
				$scope.popAlert = {
					eventType:1,//1 撤销 2邮寄 3审核 4开具
					show: false,
					type: -1,
					header: "提示",
					content: "您确定要撤销当前状态为未开具？"
				};
				
				if($scope.invoiceInfo.status == 1 || $scope.invoiceInfo.status == 4){
					popAlertShow(4, "提示", "您确定要撤销当前状态为未开具？");
				}else if($scope.invoiceInfo.status == 3){
					if($scope.invoiceInfo.lastStatus == 1){
						popAlertShow(4, "提示", "您确定要撤销当前状态为未邮寄 ？");
					}else if($scope.invoiceInfo.lastStatus == 2){
						popAlertShow(4, "提示", "您确定要撤销当前状态为已邮寄？");
					}
				}
			},
			handleMailedBtnClick:function(){//销售邮寄
				$scope.popAlert = {
					eventType:2,//1 撤销 2邮寄 3审核 4开具
					show: false,
					type: -1,
					header: "提示",
					content: "您确定要撤销当前状态为未开具？"
				};
				
				popAlertShow(3, "提示", "您确定要当前发票已邮寄成功？");
			},
			handleCheckBtnClick:function(){//财务审核
				$scope.popAlert = {
					eventType:3,//1 撤销 2邮寄 3审核 4开具
					show: false,
					type: -1,
					header: "提示",
					content: "您确定要撤销当前状态为未开具？"
				};
				
				popAlertShow(5, "提示", "此条撤销申请是否通过?");
			},
			handleIssuedBtnClick:function(){//标记开具弹窗
				$scope.popAlert = {
					eventType:4,
					show: false,
					type: -1,
					header: "提示",
					content: "您确定发票已开具成功？"
				};
				
				popAlertShow(3, "提示", "您确定发票已开具成功？"); 
			},
			popAlertConfirm:function(){//弹窗确定,弹窗类型为type=3,4
				
				if($scope.popAlert.eventType == 1){//撤销
					var params = {
						id:  parseInt($stateParams.id)
					};
					http('invoceCancelApply',{"data":params,type:'invoice'},function(msg){
						console.log(msg);
						if(msg && msg.result == 'success'){
							
							$scope.invoiceInfo.isOperateCancelBtnShow = false;
							$scope.popAlert.show = false;
						}else{
							$scope.popAlert.show = false;
							$scope.popError = {
								show: true,
								content: msg.info
							};
							$scope.popError.show= true;
						}
					});
				}else if($scope.popAlert.eventType == 2){//邮寄
					var params = {
						id: $stateParams.id
					};
					http('invoiceMarkPosted',{"data":params,type:'invoice'},function(msg){
						if(msg && msg.result == 'success'){
							reloadFlag = true;
							console.log('invoiceMarkPosted',msg);
							$scope.popAlert.show = false;
						}else{
							$scope.popAlert.show = false;
							$scope.popError = {
								show: true,
								content: msg.info
							};
						}
						
						initDate();
					});
				}else if($scope.popAlert.eventType == 3){//审核
					console.log($scope.popAlert.selectRadio);
					var params = {
						id:$stateParams.id,
						result:$scope.popAlert.selectRadio
					};
					http('invoiceCancelApplyCheck',{"data":params,type:'invoice'},function(msg){
						if(msg && msg.result == 'success'){
							console.log(msg);
							reloadFlag = true;
							$scope.popAlert.show = false;
							
							initDate();
						}else{
							$scope.popAlert.show = false;
							$scope.popError = {
								show: true,
								content: msg.info
							};
						}
					});
				}else if($scope.popAlert.eventType == 4){//标记开具
					var params =[
						{id:$scope.invoiceInfo.id}
					];
					http('invoiceMarkIssued',{"data":params,type:'invoice'},function(msg){
						if(msg && msg.result == 'success'){
							reloadFlag = true;
							console.log(msg);
							$scope.popAlert.show = false;
							
							initDate();
						}else{
							$scope.popAlert.show = false;
							$scope.popError = {
								show: true,
								content: msg.info
							};
						}
					});
				}
			},
			handleIssueRefusedBtnClick:function(){//弹窗拒绝开具弹窗
				$scope.popRefuseAlert = {
					show: false,
					header: "提示",
					content1: "",
					content2: "",
					content3: ""
				};
				
				popAlertRefuseShow("提示", "您确定要拒绝开具此次发票么？","拒绝开具当前发票，如再次开具,需客户重新提交申请","拒绝原因");
			},
			handleInvoiceCancelBtnClick:function(){//发票作废弹窗
				$scope.popRefuseAlert = {
					show: false,
					header: "提示",
					content1: "",
					content2: "",
					content3: ""
				};
				
				popAlertRefuseShow("提示", "您确定要作废此条发票开具记录？","如作废当前已开具发票，未开具金额将重新计算","作废原因");
			},
			popAlertConfirmRefuse:function(){//拒绝和作废弹窗确定
				if($('.omp-popAlert-content-invoice-refuse .btns .confirm').hasClass('on')){
					console.log($scope.popRefuseAlert.refuseContent);
					$scope.popRefuseAlert.show = false;
					if($scope.invoiceInfo.status == 0){//未开具的有拒绝
						var params = {
							id:$stateParams.id,
							reason:$scope.popRefuseAlert.refuseContent
						}
						http('invoiceMarkRefused',{"data":params,type:'invoice'},function(msg){
							if(msg && msg.result == 'success'){
								reloadFlag = true;
								console.log("invoiceMarkRefused",msg);
								
								initDate();						
							}else{
								$scope.popAlert.show = false;
								$scope.popError = {
									show: true,
									content: msg.info
								};
							}
						});
					}else{//作废
						var params = {
							id:$stateParams.id,
							reason:$scope.popRefuseAlert.refuseContent
						}
						http('invoiceMarkAbandon',{"data":params,type:'invoice'},function(msg){
							if(msg && msg.result == 'success'){
								reloadFlag = true;
								console.log("invoiceMarkAbandon",msg);
								
								initDate();						
							}else{
								$scope.popAlert.show = false;
								$scope.popError = {
									show: true,
									content: msg.info
								};
							}
						});
					}
				}
			},
			handleCloseClick:function(){
//				if(reloadFlag){
//					window.opener.location.reload();
//				}
				window.close();
			},
			changeRadio:function(){//审核弹窗 通过不通过选择
				$('#omp-invoice-detail .omp-popAlert-content .input-radio span').removeClass('on');
				if($scope.popAlert.selectRadio == 1){
					$('#omp-invoice-detail .omp-popAlert-content .input-radio span:first').addClass('on');
				}else{
					$('#omp-invoice-detail .omp-popAlert-content .input-radio span:last').addClass('on');
				}
			},
			handleCheckBigImgClick:function(imgUrl) {
				$scope.popImg = {
		            show: false,
		            type: '资质文件-图片',
		        };
				
	            if (!imgUrl) return;
	            $scope.popImg.show = true;
	            if(/\.pdf/.test(imgUrl)){
				  	$scope.popImg.type= '资质文件-pdf';
	              	$scope.popImg.bigPdf = imgUrl;
	            }else{
	            	$scope.popImg.type= '资质文件-图片';
	            	$scope.popImg.bigImg = imgUrl;
	            }
	        },
			handleOperateItemClick:function(ele){
				if (ele.reason) {
					console.log(ele.isUnfold);
                	ele.isUnfold = !ele.isUnfold;
            	}
			},
			popErrorClose: function () {//报错提醒关闭
				$scope.popError.show = false;
			},
			inputCnLength:function(content){//拒绝,作废未填写原因 确定按钮置灰
				var content = $.trim(content);
				if(content.length > 0){
					$('.omp-popAlert-content-invoice-refuse .btns .confirm').addClass('on');
				}else{
					$('.omp-popAlert-content-invoice-refuse .btns .confirm').removeClass('on');
				}
			}
		}
	});