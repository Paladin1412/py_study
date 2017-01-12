/*
 *  Module 主模块
 *
 *  filter 定义
 */
angular.module('omp.filter', [])

    /*
     * 空值时""/null转换为 "--"
     *
     */
    .filter("checkNull", function() {
        return function(input) {
            if (input === "" || input === null)
                return "--";
            else
                return input;
        }
    })

    /*
     * 检查http
     *
     */
    .filter("checkHTTP", function() {
        return function(input) {
            if (input != "" &&  input != null) {
                var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
                if (!reg.exec(input) && input.indexOf("https://") == -1) {
                    return "http://"+input;
                }
                else{
                    return input;
                }
            }
        }
    })

    /*
     * 广告主页面待审核状态下 显示 "--""
     *
     */
    .filter("isNeedAudit", function() {
        return function(input) {
            if (input === "待审核")
                return "--";
            else
                return input;
        }
    })

    /*
     * 时间在--或者null下显示为空""
     *
     */
    .filter("timeFilter", function() {
        return function(input) {
            if (input === null || input === "--")
                return "";
            else
                return input;
        }
    })

    /*
     * 收入统计数据显示百分比
     *
     */
    .filter("percentFilter", function() {
        return function(input) {
            input = input === 0 ? '0.00%' : (input * 10000 / 100).toFixed(2) + '%';
            return input;
        }
    })
