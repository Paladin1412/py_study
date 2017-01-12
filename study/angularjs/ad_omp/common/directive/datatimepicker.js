/**
 * Created by bjwangting1 on 2016/11/22.
 */
var common = angular.module("app.directive");
common.directive('daterangepicker', function() {
    return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
            select:'&'
        },
        link: function(scope, element, attrs, ngModel) {
            console.log('daterangepicker attrs', attrs);
            if (!ngModel) return;
            var optionsObj = {
                autoUpdateInput: attrs.isnotautoupdate?false:true,
                "showDropdowns": true,
                "ranges": {
                    '今天': [moment().format('YYYY-MM-DD'), moment()],
                    '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '过去7天': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                    '过去30天': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                    '本月': [moment().startOf('month'), moment()],
                    '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
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
                        if(+new Date(moment().format('YYYY-MM-DD')+' 00:00:00') > +date._d){
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
                            console.log('datepicker', start, end, label)
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

