/**
 *  Module
 *
 *  指令定义
 */
angular.module("omp.directive", [])

    /*
     *  分页指令 通过$scope.$emit/$on 与controll通信
     *
     */
    .directive('pageFilter', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: "./common/template/pageFilter.html",
            link: function($scope, element, attr) {

            },
            controller: function($scope) {

                // init
                getPageInfo();

                /*
                 * $scope.data 数据绑定
                 *
                 * total       总数
                 * limit       每页显示的数量
                 * start       当前页起始条数
                 * end         当前页终止条数
                 * page_now    当前页序号
                 * page_total  总共页数量
                 * page_jump   跳转页,超出范围则跳转至第一/最后一页
                 * pace        start + 1标志,当数据为0时start不加1
                 */
                $scope.data = {
                    total: 0,
                    limit: 10,
                    start: 1,
                    end: 0,
                    page_now: 1,
                    page_total: 1,
                    page_jump: "",
                }

                /*
                 *  $scope.event 事件绑定
                 *
                 *  setLimit   设置页上限
                 *  prevPage   跳转至上一页
                 *  nextPage   跳转至下一页
                 *  jumpPage   跳转至输入页
                 *
                 */
                $scope.event = {
                    setLimit: function(value) {
                        $scope.data.limit = parseInt(value);
                        $scope.data.start = 1;
                        //$scope.data.start = 0;
                        setPageInfo($scope.data);
                    },
                    prevPage: function() {
                        var params, start, index = $scope.data.page_now;
                        //第一页无法先前跳转
                        if (index <= 1) return;
                        //start = $scope.data.start - $scope.data.limit;
                        start = index - 1;
                        //防止溢出
                        start = start < 0 ? 0 : start;
                        params = {
                            "start": index-1,
                            "limit": $scope.data.limit
                        }
                        setPageInfo(params);
                    },
                    nextPage: function() {
                        var params, start, index = $scope.data.page_now;
                        //最后一页无法先后跳转
                        if (index >= $scope.data.page_total) return;
                        //start = $scope.data.start + $scope.data.limit;
                        start =index+1;
                        //防止溢出
                        //start = start > $scope.total ? $scope.data.total - $scope.data.limit : start;
                        params = {
                            "start": index+1,
                            "limit": $scope.data.limit
                        }
                        setPageInfo(params);
                    },
                    jumpPage: function(value) {
                        var params, start, index = parseInt(value);
                        //非法输入
                        if (isNaN(index)) return;
                        //最低为第一页
                        index = index <= 1 ? 1 : index;
                        //至多为最后一页
                        index = index >= $scope.data.page_total ? $scope.data.page_total : index;
                        //start = parseInt((index - 1) * $scope.data.limit);
                        params = {
                            "start": index,
                            "limit": $scope.data.limit
                        };
                        //跳转后清空输入
                        $scope.data.page_jump = "";
                        setPageInfo(params);
                    }
                };

                //发送分页事件请求 发送数据 start / limit
                function setPageInfo(obj) {

                    var params = {
                        "start": obj.start,
                        "limit": obj.limit,
                    };
                    //发送事件
                    $scope.$emit("getPageInfo", params);
                };

                //接受分页事件请求 接受数据 start / total / length[对应data.end]
                function getPageInfo() {
                    //监听事件
                    $scope.$on("setPageInfo", function(event, data) {
                        $scope.data.total = data.total;
                        if(data.start==0){
                            data.start=1
                        }
                        $scope.data.end = data.start*$scope.data.limit-$scope.data.limit + data.length;
                        $scope.data.start = data.start;

                        //数据为零时的显示状态
                        if (data.total === 0) {
                            $scope.data["total"] = 0;
                            $scope.data["start"] = 1;
                            $scope.data["pace"] = 0;
                            $scope.data["end"] = 0;
                            $scope.data["page_now"] = 1;
                            $scope.data["page_total"] = 1;
                            $scope.data["page_jump"] = "";
                        }
                        //不为零时重新计算各项数值
                        else {
                            $scope.data.pace = 1;
                            processPageInfo();
                        }
                    });
                };

                //重新计算分页各项数据
                function processPageInfo() {
                    $scope.data.page_total = parseInt($scope.data.total / $scope.data.limit);
                    //最后一页剩余数量没有不足limit数量,通过是否被整除判断
                    if ($scope.data.total % $scope.data.limit != 0) {
                        $scope.data.page_total++;
                    }
                    //当前页号
                    $scope.data.page_now = parseInt($scope.data.start);
                }
            }
        };
    })

    /*
     *  封装jQ时间控件指令
     *  指令属性 timer是否显示小时 ng-modle绑定显示时间
     *  tips: 样式已经在style属性上写死
     *
     *  lang    -> ch 中文
     *  format  -> 根据指令属性format制定
     *  minDate -> 0值,可选日期从当期那开始
     *  timepicker -> (bool)是否显示小时
     *
     */
    .directive('datetimepicker', function() {

        return {
            restrict: "EA",
            require: "ngModel",
            link: function(scope, element, attrs, ctrl) {

                var unregister = scope.$watch(function() {

                    $(element).append("<input type='button' id='date-" + attrs.dateid + "' style='display:inline-block;width:200px;height:25px;border-radius: 5px;border: 1px solid #d7e1ea;background: url(./css/_images/datetimepicker-icon.png) #ffffff no-repeat 176px center;vertical-align:middle;' " + "value='" + ctrl.$modelValue + "'>");

                    $(element).css("padding", "0");

                    element.on('change', function() {
                        scope.$apply(function() {
                            ctrl.$setViewValue($("#date-" + attrs.dateid).val());
                        });
                        scope.$emit("dateTimePicker");
                    });


                    element.on('click', function() {
                        var showTimer = attrs.timer === 'false' ? false : true;
                        $("#date-" + attrs.dateid).datetimepicker({
                            format: attrs.format || 'Y/m/d h:i',
                            lang: "ch",
                            //明天为起始可输入时间
                            minDate: getTomorrowTime(),
                            timepicker: showTimer,
                            //失去焦点时不改变时间值
                            validateOnBlur: false,
                            onClose: function() {
                                element.change();
                            },
                        });
                    });
                    element.click();
                    //
                    return ctrl.$modelValue;
                }, initialize);

                //获取明天的日期 YYYY/MM/DD
                function getTomorrowTime() {
                    var cur = new Date();
                    cur.setDate(cur.getDate() + 1);
                    var year = cur.getFullYear();
                    var month = cur.getMonth() + 1;
                    month = month >= 10 ? month : "0" + month;
                    var date = cur.getDate();
                    date = date >= 10 ? date : "0" + date;
                    return year + "/" + month + "/" + date;
                };

                function initialize(value) {
                    ctrl.$setViewValue(value);
                    unregister();
                }
            }
        }
    })

    .directive('daterangepicker', function() {
        return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            select:'&'
        },
        link: function(scope, element, attrs, ngModel) {
            console.log('daterangepicker attrs', attrs);
            if (!ngModel) return;
            var rangesObjNew = {};
            var rangesObj = {
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '过去7天': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                '过去30天': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                '本月': [moment().startOf('month'), moment()],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            };
            if (!attrs.prevtoday) {
                rangesObjNew['今天'] = [moment().format('YYYY-MM-DD'), moment()];
            }
            for (var key in rangesObj) {
                rangesObjNew[key] = rangesObj[key]
            }
            var optionsObj = {
                autoUpdateInput: attrs.isnotautoupdate?false:true,
                "showDropdowns": true,
                "ranges": rangesObjNew,
                "opens": "right",
                "linkedCalendars": false,
                "showCustomRangeLabel": false,
                "alwaysShowCalendars": true,
                "parentEl": element.parent(),
                "buttonClasses": "nex-btn nex-btn-sm",
                "applyClass": "nex-btn-success",
                "cancelClass": "nex-btn-default",
                "startDate": moment().subtract(1, 'days'),
                "endDate": moment().subtract(1, 'days'),
                "isInvalidDate": function(date){
                    if(attrs.prevdatelimit){
                        var startdate = attrs.prevtoday ? 
                                        new Date(moment().format('YYYY-MM-DD')+' 00:00:00') :
                                        new Date(moment().add(1, 'days').format('YYYY-MM-DD')+' 00:00:00');
                        if(+startdate <= +date._d){
                            return true;
                        }else {
                            return false
                        }
                    }
                },
                    "locale": {
                        "separator": ' 至 ',
                        "direction": "ltr",
                        "format": "YYYY-MM-DD",
                        "applyLabel": '确定',
                        "cancelLabel": '取消',
                        "fromLabel": '起始时间',
                        "toLabel": '结束时间',
                        "customRangeLabel": '自定义',
                        "daysOfWeek": ['日', '一', '二', '三', '四', '五', '六'],
                        "monthNames": ['一月', '二月', '三月', '四月', '五月', '六月',
                            '七月', '八月', '九月', '十月', '十一月', '十二月'
                        ],
                        "firstDay": 1
                    }
                };

                ngModel.$render = function(){
                    var dateValue = ngModel.$viewValue;
                    var dateCopy =  ngModel.$viewValue;
                    if(dateValue){
                        var datesArr =  dateValue.split("至");
                        var singleDatePicker = false;
                        if(datesArr.length == 1){
                            singleDatePicker = true;
                        }
                        angular.extend(optionsObj, {
                            singleDatePicker:singleDatePicker,
                            startDate:datesArr[0],
                            endDate:datesArr[1]
                        });
                    }


                    // var isNotAutoUpdate = attrs;
                    if(attrs.isnotautoupdate){

                        $(element).daterangepicker(optionsObj);
                        $(element).on('apply.daterangepicker', function(ev, picker) {
                            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
                            var start = picker.startDate.format('YYYY-MM-DD');
                            var end = picker.endDate.format('YYYY-MM-DD');

                            if(scope.select){
                                scope.$apply(function(){
                                    scope.select({start:start, end: end});
                                })
                            }
                        });
                        $(element).on('cancel.daterangepicker', function(ev, picker) {
                            $(this).val('');
                        });
                    }else {
                        $(element).daterangepicker(optionsObj,
                            function(start, end, label) {
                                var start = start.format('YYYY-MM-DD');
                                var end = end.format('YYYY-MM-DD');
                                if(scope.select){
                                    scope.$apply(function(){
                                        scope.select({start:start, end: end, label:label});
                                    })
                                }
                            });
                        if(!dateCopy){
                            $(element).val("请选择日期");
                        }
                    }

                }

            }
        }
    })
