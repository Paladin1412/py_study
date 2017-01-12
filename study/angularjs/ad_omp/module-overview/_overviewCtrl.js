/**
 *  Module
 *
 *  运营概览模块
 */
angular.module('omp.overview',[])
	.controller('omp-overview', function($scope, http, $filter) {
		var ov_chart = echarts.init($("#omp-ov-chart")[0]);
		var dayData = {"00:00":'0',"01:00": '0',"02:00": '0',"03:00": '0',"04:00": '0',"05:00": '0',"06:00": '0',"07:00": '0',"08:00": '0',"09:00": '0',"10:00": '0',"11:00": '0',"12:00": '0',"13:00": '0',"14:00": '0',"15:00": '0',"16:00": '0',"17:00": '0',"18:00": '0',"19:00": '0',"20:00": '0',"21:00": '0',"22:00": '0',"23:00": '0',"24:00": '0'}
		window.onresize = ov_chart.resize;
		var param = {
			startTime: moment().subtract(7, 'days').format('YYYY-MM-DD'),
			endTime  : moment().subtract(1, 'days').format('YYYY-MM-DD')
		}
 
		$scope.search = {
			productList: [{
				id:"",
				name:"全部"
			}, {
				id:"3",
				name:"易品"
			}, {
				id:"1",
				name:"易效"
			}, {
				id:"2",
				name:"NEX"
			}],
			curProduct: {
				id:"",
				name:"全部"
			},
			curDate: {
				startTime:param.startTime,
				endTime:param.endTime
			},
			dateType:0  //同一天1 不同一天0
		};
		$scope.chartData = null;
		

		function initPage() {
			//数据概览
			getOverView();

			//趋势图
			$scope.getChartData();
		}

		function getOverView() {
			http("overView", {}, function(msg) {
				$scope.yipin = msg.yipin;
				$scope.p4p = msg.p4p;
				$scope.nex = msg.nex;

			});
		}
		

		$scope.getChartData = function() {
			var params = {
				category: $scope.search.curProduct.id,
				startTime: $scope.search.curDate.startTime,
				endTime: $scope.search.curDate.endTime,
				type: $scope.search.dateType
			}
			console.log(params)
			http("overViewChart", {data:params}, function(msg) {
				if (msg.lists.date.length == 0 || msg.lists.income.length == 0) {
					$scope.chartData = null;
					return;
				}
				$scope.chartData = msg;
				$scope.dateArr = [];
				$scope.incomeArr = [];
				var dayDataNew = dayData;
				var _list = msg.lists.date;
				for (var i = 0, len = _list.length; i < len; i++) {
					var date = new Date(_list[i]);
					if ($scope.search.dateType == 0) {
						$scope.dateArr.push($filter('date')(date, 'MM-dd'))
					} else {
						var timekey = $filter('date')(date, 'HH:mm');
						dayDataNew[timekey] = msg.lists.income[i] ? msg.lists.income[i] : '0';
					}
				}
				if ($scope.search.dateType == 1) {
					for (var item in dayDataNew) {
						$scope.dateArr.push(item);
						var str = $filter('number')(dayDataNew[item], 2);
						str = str.replace(",", "");
						$scope.incomeArr.push(str)
					}
				} else {
					msg.lists.income.forEach(function(item) {
						var str = $filter('number')(item, 2);
						str = str.replace(",", "");
						$scope.incomeArr.push(str)
					})
				}
				

				
			
				//渲染图表
				$scope.drawChart();
			})
		}
		

		//设置初始值
		$scope.beginEndDate = param.startTime + " 至 " + param.endTime;
		
		//监听日历事件
		$scope.updateDate = function(start, end, label) {
			$scope.search.curDate.startTime = start;
			$scope.search.curDate.endTime = end;
			$scope.search.dateType = start == end ? 1 : 0;
			$scope.getChartData();
		};

		$scope.drawChart = function () {
			var option = {
				baseOption: {
					grid: {
						left        : '3%',
						right       : '4%',
						bottom      : '3%',
						containLabel: true
					},
				    tooltip: {
						trigger  : 'axis',
						axisPointer: {
							lineStyle: {
								color: '#508ff6'
							}
						}
						// formatter: function (params) {
						// 	console.log(params)
						// 	var res = params[0].name;
						// 	for (var i = 0, size = params.length; i < size; i++) {
						// 		var value = params[i].value;
						// 		if(value == ""){
	     //                        	value = 0;
						// 		}
						// 		res += '<br/>'
						// 			+ params[i].seriesName + ' : ' + value;
						// 	}
						// 	return res;
						// }
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						axisLabel: {
							textStyle: {
								color: '#999'
							},
							margin:20
						},
						axisLine:{
							lineStyle:{
								color: '#f6f6f7'
							}
						},
						splitLine:{
							show:true,
							lineStyle: {
								color: '#f6f6f7'
							}
						},
						axisTick:{
							show:false,
							interval:1
						},
						data: $scope.dateArr
					},
					yAxis: [
						{
							type: 'value',
							name: '收入',
							position: 'left',
							nameTextStyle: {
								color: '#999'
							},
							axisLabel: {
								textStyle:{
									color:'#999'
								},
								margin:20
							},
							axisLine:{
								lineStyle:{
									color: '#f6f6f7'
								}
							},
							splitLine:{
								lineStyle: {
									color: '#f6f6f7'
								}
							},
							axisTick: {
								show:false
							}
						}
					],
					series : [
						{
							name: "收入",
							type: 'line',
							lineStyle: {
								normal: {
									color: '#508ff6',
									width: 2
								}
							},
							symbol: 'circle',
							symbolSize: '10',
							itemStyle : {
								normal: {
									color: '#508ff6',
									borderColor: '#fff',
									borderWidth: 2
								}
							},
							//areaStyle: {normal: {}},
							data: $scope.incomeArr
						}
					]
				}
			}

			ov_chart.setOption(option)

		}

		
 		//初始化页面
		initPage();
	})
