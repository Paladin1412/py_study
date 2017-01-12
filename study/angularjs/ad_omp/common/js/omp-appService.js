/*
 *  Module 主模块
 *
 *  Services 定义
 */
angular.module('omp.service', [])

    /*  End
     *
     *  Service Tools
     *
     *  Start
     */

    .factory('tools', function() {

        var tools = {};
        //获取当前时间 format为格式参数
        tools["getCurrentTime"] = function(format) {
            var now = new Date();
            var year = now.getFullYear();
            var month = 1 + now.getMonth();
            var date = now.getDate();
            var hours = now.getHours();
            var minute = now.getMinutes();
            var second = now.getSeconds();

            month = month >= 10 ? month : "0" + month;
            date = date >= 10 ? date : "0" + date;
            hours = hours >= 10 ? hours : "0" + hours;
            minute = minute >= 10 ? minute : "0" + minute;
            second = second >= 10 ? second : "0" + second;
            return year + "-" + month + "-" + date + " " + hours + ":" + minute + ":" + second;
        };

        //计算字符长度
        tools["getCharLength"] = function(value) {
            //非空情况
            var reg = /^[\u2E80-\u9FFF]+$/;
            var charNumber = 0;
            for (var i = 0, len = value.length; i < len; ++i) {
                //汉子2个字符
                if (reg.test(value[i])) {
                    charNumber += 2;
                }
                //非汉子1个字符
                else {
                    charNumber++;
                }
            }
            return charNumber;
        };

        //检车是否是可下载文件 (zip/pdf)
        tools["needDownload"] = function(url) {
            //获取后缀名
            var suffix = url.split(".");
            if (suffix) {
                suffix = suffix[suffix.length - 1].toUpperCase();
                //或追转化为大写后查看是否为ZIP/PDF
                if (suffix === "ZIP" || suffix === "PDF") {
                    return true;
                }
            }
            return false;
        }

        //当值为p为undefined或null时返回一个默认值v，如果allowNull为true，则仅当p为undefined时才返回v
        tools["setDefaultValue"] = function (p, v, allowNull) {
            if (!allowNull)
                p = p == undefined ? v : p
            else
                p = p === undefined ? v : p
            return p;
        }
    tools["getExtName"] = function (str) {
        var s = str && str.split('.');
        return s && s[s.length - 1]
    }
    tools["isImg"] = function (str) {
        if (!str) return false;
        var ext = tools["getExtName"](str);
        var ext = ext && ext.toLowerCase();
        if (ext === 'jpg' || ext === 'jepg' || ext === 'png' || ext === 'git') {
            return true
        }

        return false;
    }
        return tools;
    })

    /*  End
     *
     *  Service cache
     *
     *  Start
     */

    .factory('cache', function(httpAdapter) {
        //Private Store
        var store = {};

        //SET
        function set(key, value, options) {
            //附加条件(部分)存储
            if (options && store.hasOwnProperty(key)) {
                //指定index
                if (options.index >= 0 && options.index < store[key].length) {
                    for (var valueKey in value) {
                        store[key][options.index][valueKey] = value[valueKey];
                    }
                }
            }
            //存储(覆盖)全部内容
            else {
                store[key] = value;
            }
        };

        //GET options=> index
        function get(key, options) {
            if (store.hasOwnProperty(key)) {
                //附加条件
                if (options) {
                    if (options.index >= 0 && options.index < store[key].length) {
                        return angular.copy(store[key][options.index]);
                    }
                    return null;
                }
                //返回全部内容
                else {
                    return angular.copy(store[key])
                }
            }
            //没有这个key值
            else {
                return null;
            }
        };

        //API 实现资源共享
        return {
            "set": set,
            "get": get
        }
    })

    /*  End
     *
     *  Service http
     *
     *  Start
     */

    .factory('http', function($http, $timeout, httpUrl, httpAdapter, httpMock) {

        //
        /*
         *  config     服务请求配置
         *
         *  env        工作环境枚举
         *  now        当前工作环境
         *
         */
        var config = {
            env: ["mock", "qa"],
            mockResponseTime: 200,
            resizeResponseTime: 50,
            now: "qa"
        }

    function httpFailed() {

    }

    function httpTimeout() {

    }

    //联调环境
    function qa(key, options, callback) {
        var apiInfo = httpUrl(key, options && options.type);

        if (!options) options = {};



        if (apiInfo === false) {
            console.log("没有找到 " + key + " url映射");
            //throw new Error("没有找到 "+key + " url映射");
        }
        //调用http
        else {
            //查看url
            //console.log("1获取的url为: " + apiInfo.url);
            //查看参数
            //console.log("2调用的接口为: " + key);
            //没有请求参数后台打印 undefined
            //console.log("3请求参数为: ");
            //console.log(options.data);
            var httpParams = {
                "url": apiInfo.url,
                "method": apiInfo.method,
            };
            //POST请求添将参数加至请求体中
            if (options.data) {
                for (k in options.data) {
                    if (typeof options.data[k] === 'string')
                        options.data[k] = encodeURIComponent(options.data[k])
                }
            }
            if (apiInfo.method === "POST") {
                httpParams["data"] = options.data;
                httpParams["params"] = {
                    token: window.sessionStorage.getItem("token")
                };
            }
            //GET请求
            else if (apiInfo.method === "GET") {
                if (!options.data) options.data = {
                    token: window.sessionStorage.getItem("token")
                }
                else options.data.token = window.sessionStorage.getItem("token");
                httpParams["params"] = options.data;
            }

            $http(httpParams)
                //请求成功
                .success(function (data, header, config, status) {
                    //console.log("4返回参数为: ");
                    //console.log(data);
                    if (data != null && data != '' && data == -1) { //session 失效
                        location.href = getRootPath() + "/welcome.html";
                        return;
                    }
                    //如有映射或适配则做转换工作
                    if (options.adapter) {
                        data = httpAdapter(options.adapter, data);
                    }
                    callback(data);
                    //重置页面布局
                    $timeout(function () {
                        GLOBAL_resize();
                    }, config.resizeResponseTime);
                })
                //请求失败
                .error(function (data, header, config, status) {

                })
        }
    };
    //获取当前主路径名(协议+dns[ip]+[端口号]+项目名称)
    function getRootPath() {
        //var rootPath = $location.absUrl().split("/").splice(0, 4).join("/");
        ////console.log(rootPath);
        //return rootPath;
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        var localhostPaht = curWwwPath.substring(0, pos);
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return (localhostPaht + projectName);
    };
    //本地模拟
    function mock(key, options, callback) {
        var result = {};
        //获取mock数据
        result = httpMock[key](options);
        //适配器转换数据
        if (options && options.adapter) {
            result = httpAdapter(options.adapter, result);
        }
        //执行回调函数
        $timeout(function () {
            callback(result);

        }, config.mockResponseTime);
        //重置页面布局
        $timeout(function () {
            GLOBAL_resize();
        }, config.mockResponseTime + 1);
    };

    /*
     *  API 接口
     *
     *  key 接口名,
     *  options 复选项
     *     [options.data]     请求时的数据对象
     *     [options.adapter]  适配函数名
     *  callback 回调函数;
     *
     */
    return function (key, options, callback) {
        switch (config.now) {
            case "mock":
                return mock(key, options, callback);
            case "qa":
                return qa(key, options, callback);
            default:
                return false;
        }
    }
})

/*  End
 *
 *  Service adapter 数据适配
 *
 *  Start
 */

.factory('httpAdapter', function () {

    var adapter = {
        //将获取的dsp列表中dspId/dspName转化为id/name
        dsp: function (data) {
            var adapterDspList = [];
            if (data.dsps && data.dsps instanceof Array) {
                for (var i = 0, len = data.dsps.length; i < len; ++i) {
                    adapterDspList.push({
                        "id": data.dsps[i].dspId,
                        "name": data.dsps[i].dspName
                    })
                }
            };
            data.dsps = adapterDspList;
            return data;
        },
    };


    //API 过滤映射数据 obj为原数据,key为需要调用适配器名
    return function (key, obj) {
        //包含此适配器
        if (adapter.hasOwnProperty(key)) {
            return adapter[key](obj);
        }
        //不包含
        else {
            return null;
        }
    }
})

/*  End
 *
 *  Service url 地址映射
 *
 *  Start
 */

.factory('httpUrl', function ($location) {
    //域名及路径设置
    var config = {
        domain: {
            'local': getRootPath(),
            'invoice': 'http://p4padmin.pangu.163.com',
            'advertiser': 'http://p4p.pangu.163.com'
        }
    };

    //各请求口url映射 20+登录+验证码共22个接口
    var mapping = {
        //获取易效广告主审核列表
        "p4pList": {
            url: "/p4pList",
            method: "POST",
            path: "/advertiser",
        },
        //获取NEX广告主列表
        "nexList": {
            url: "/nexList",
            path: "/advertiser",
            method: "POST"
        },
        //获取易效广告主管理列表
        "p4pManageList": {
            url: "/p4pManageList",
            method: "POST",
            path: "/advertiser",
        },
        //获取广告主管理列表项的详情信息
        "advertiserDetails": {
            url: "/details",
            path: "/advertiser",
            method: "GET"
        },
        //广告主详情信息冻结/解除
        "advertiserFreeze": {
            url: "/freeze",
            path: "/advertiser",
            method: "POST"
        },
        //获取易效域行业列表
        "getYXIndustry": {
            url: "/getIndustryLevel1List",
            path: "/user",
            method: "GET"
        },
        //获取易效域二级行业列表
        "getYXSubIndustry": {
            url: "/getIndustryLevel2List",
            path: "/user",
            method: "GET"
        },
        //获取行业列表
        "getIndustry": {
            url: "/getIndustry",
            path: "/sys",
            method: "POST"
        },
        //广告主初始化审核信息
        "startAudit": {
            url: "/startAudit",
            path: "/advertiser",
            method: "POST"
        },
        //获取拒绝原因列表
        "getReasonList": {
            url: "/getReasonList",
            path: "/sys",
            method: "POST"
        },
        //提交广告主审核结果接口
        "subAudit": {
            url: "/subAudit",
            path: "/advertiser",
            method: "POST"
        },
        //获取dsp列表
        "getDsp": {
            url: "/getDsp",
            path: "/sys",
            method: "POST"
        },
        //创意NEX列表
        "nexAuditList": {
            url: "/nexAuditList",
            path: "/idea",
            method: "POST"
        },
        //创意易效列表
        "idea_p4pList": {
            url: "/p4pList",
            path: "/idea",
            method: "POST"
        },
        //创意管理列表
        "managerList": {
            url: "/managerList",
            path: "/idea",
            method: "POST"
        },
        //获取代理商列表
        "getAgents": {
            url: "/getAgents",
            path: "/idea",
            method: "POST"
        },
        //创意审核基本信息
        "ideaStartAudit": {
            url: "/startAudit",
            path: "/idea",
            method: "POST"
        },

        "adIdeaList": {
            url: "/adIdeaList",
            path: "/idea",
            method: "POST"
        },
        //创意管理下钻进入审核接口
        "ideaDetail": {
            url: "/ideaDetail",
            path: "/idea",
            method: "POST"
        },
        "subAuditIdeas": {
            url: "/subAuditIdeas",
            path: "/idea",
            method: "POST"
        },
        "operate": {
            url: "/operate",
            path: "/user",
            method: "POST"
        },
        "getNeedAudit": {
            url: "/getNeedAudit",
            path: "/stat",
            method: "POST"
        },
        "getAuditWorks": {
            url: "/getAuditWorks",
            path: "/stat",
            method: "POST"
        },
        "logout": {
            url: "/logout",
            path: "/user",
            method: "POST"
        },
        "getMenus": {
            url: "/getMenus",
            path: "/sys",
            method: "POST"
        },
        "subAuditAds": {
            url: "/subAuditAds",
            path: "/idea",
            method: "POST"
        },
        "userInfo": {
            url: "/userInfo",
            path: "/user",
            method: "POST"
        },
        "getRoleList": {
            url: "/roleList",
            path: "/role",
            method: "POST"
        },
        "getAllMenus": {
            url: "/getAllPermissions",
            path: "/sys",
            method: "POST"
        },
        "deleteRole": {
            url: "/delete",
            path: "/role",
            method: "POST"
        },
        getUserList: {
            url: "/userList",
            path: "/user",
            method: "POST"
        },
        "deleteUser": {
            url: "/delete",
            path: "/user",
            method: "POST"
        },
        getUserDetail: {
            url: "/getUserDetail",
            path: "/user",
            method: "POST"
        },
        getRoleDetail: {
            url: "/getRoleDetail",
            path: "/role",
            method: "POST"
        },
        "saveOrUpateRole": {
            url: "/saveOrUpdate",
            path: "/role",
            method: "POST"
        },
        saveOrUpateUser: {
            url: "/saveOrUpdate",
            path: "/user",
            method: "POST"
        },
        checkRole: {
            url: "/checkRole",
            path: "/role",
            method: "POST"
        },
        checkUser: {
            url: "/checkUser",
            path: "/user",
            method: "POST"
        },
        "dspQuery": {
            url: "/query",
            path: "/dsp",
            method: "GET"
        },
        "getUserCurrentAccount": {
            url: '/getCurrentAccount',
            path: '/user',
            method: 'GET'
        },
        "invoiceList": { //发票列表
            url: "/list",
            path: '/invoice',
            method: "GET"
        },
        "invoiceExport": { //发票导出
            url: "/export",
            path: '/invoice',
            method: "GET"
        },
        "invoiceMarkIssued": { //发票标记开具
            url: '/mark_issued',
            path: '/invoice',
            method: "POST"
        },
        "invoiceInfo": { //发票详情
            url: '/info',
            path: '/invoice',
            method: 'GET'
        },
        "invoceCancelApply": { //申请撤销
            url: '/cancel_apply',
            path: '/invoice',
            method: 'POST'
        },
        "invoiceCancelApplyCheck": { //处理撤销申请
            url: '/cancel_apply_check',
            path: '/invoice',
            method: 'POST'
        },
        "invoiceMarkRefused": { //拒绝开具
            url: '/mark_refused',
            path: '/invoice',
            method: 'POST'
        },
        "invoiceMarkAbandon": { //发票作废
            url: '/mark_abandon',
            path: '/invoice',
            method: 'POST'
        },
        "invoiceMarkPosted": { //发票邮寄
            url: '/mark_posted',
            path: '/invoice',
            method: 'POST'
        },
        "advRevenue": {
            url: "/advRevenue",
            path: "/stat",
            method: "POST"
        },
        "overView": {
            url: "/overview",
            path: "/stat",
            method: "POST"
        },

        "overViewChart": {
            url: "/trendGraphic",
            path: "/overview",
            method: "POST"
        },
        "agentRevenue": { //代理商收入统计接口
            url: "/agentRevenue",
            path: "/statistics",
            method: "POST"
        },
        "industryRevenue": { //行业收入统计接口
            url: "/industryRevenue",
            path: "/statistics",
            method: "POST"
        },
        "positionRevenue": { //位置收入统计接口
            url: "/positionRevenue",
            path: "/statistics",
            method: "POST"
        },
        "queryColumnsWithPosition": { //位置收入统计接口
            url: "/queryColumnsWithPosition",
            path: "/statistics",
            method: "POST"
        }
    };

    //获取当前主路径名(协议+dns[ip]+[端口号]+项目名称)
    function getRootPath() {
        //var rootPath = $location.absUrl().split("/").splice(0, 4).join("/");
        ////console.log(rootPath);
        //return rootPath;
        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var pos = curWwwPath.indexOf(pathName);
        var localhostPaht = curWwwPath.substring(0, pos);
        var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
        return (localhostPaht + projectName);
    };

    //封装输出结果
    function packUrlPath(obj, type) {
        if (!type) type = "local";
        var result = {
            method: obj.method,
            url: config.domain[type] + obj.path + obj.url
        };
        return result;
    };

    //接口
    return function (key, type) {
        //寻找key是否在mapping中
        if (mapping.hasOwnProperty(key)) {
            return packUrlPath(mapping[key], type);
        }
        //没有找到url映射
        else {
            return false;
        }
    };
})

/*  End
 *
 *  Service mock 模拟数据
 *
 *  Start
 */

.factory('httpMock', function () {

    //广告主-易效-获取数据列表接口
    var p4pList = function () {
        return {
            "total": 32, //条数
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "role": 1, //角色：1.管理员 2.审核员
            "userStatus": 0, //用户是否可以参与审核 0打开 1关闭
            "info": null, //提示信息
            "list": [{
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "待审核", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 2, //自增id
                "dspAdvertiserId": 2, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 3, //自增id
                "dspAdvertiserId": 3, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 4, //自增id
                "dspAdvertiserId": 4, //广告主id
                "name": "该广告主信息已被修改,操作失败", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 9, //自增id
                "dspAdvertiserId": 9, //广告主id
                "name": "点击我查看不符合审核条件,已从列表移除", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 10, //自增id
                "dspAdvertiserId": 10, //广告主id
                "name": "该广告主正在被审核,操作失败", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "123", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 9, //广告主id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "channelSaler": "王维", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //广告主-易效-获取数据列表接口
    var p4pManageList = function () {
        return {
            "total": 32, //条数
            "info": null, //提示信息
            "invdata": [{
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "正常", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }, {
                "id": 1, //自增id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "accountStatusStr": "已停投(账户未通过)", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "industryDetail": "药品-药品交易", //所属行业
                "channelStr": "直客", //渠道
                "agentId": null, //代理商ID
                "agentName": "", //代理商名称
                "accountLeft": 20000.00, //渠道销售人员
                "nowCreativityNum": 12000, //在投创意数量
                "totalCreativityNum": 12110, //总创意数
                "refuseCreativityNum": 110, //被拒登创意数
                "registerTime": 13000000000, //提交资质时间
                "registerTimeStr": "2016-08-15 16:15:20" //提交资质时间
            }]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //易效域下的一级行业列表
    var getYXIndustry = function (options) {
        return {
            "code": 200000, //成功
            "detail": {
                "level1List": [{
                    "id": 1,
                    "name": "网络服务类"
                }, {
                    "id": 2,
                    "name": "IT产品类"
                }, {
                    "id": 3,
                    "name": "消费电子类"
                }, {
                    "id": 4,
                    "name": "食品饮料类"
                }, {
                    "id": 5,
                    "name": "交通类"
                }]
            },
            error: "成功"
        }
    };

    //end -----------------
    //end -----------------
    //end -----------------
    //易效域下的二级行业列表
    var getYXSubIndustry = function (options) {
        return {
            "code": 200000, //成功
            "detail": {
                "level2List": [{
                    "id": 49,
                    "name": "普通食品"
                }, {
                    "id": 50,
                    "name": "保健食品"
                }, {
                    "id": 51,
                    "name": "进口食品"
                }, {
                    "id": 52,
                    "name": "粮油调味"
                }, {
                    "id": 53,
                    "name": "生鲜食品"
                }]
            },
            error: "成功"
        }
    };

    //end -----------------
    //end -----------------
    //end -----------------

    //获取行业列表
    var getIndustry = function (options) {
        var id = options.data.id;
        //获取一级行业列表
        if (id == "") {
            return {
                "rs": 1,
                "info": null,
                "industrys": [{
                    "id": 1, //行业 id
                    "name": "汽车", //行业名称
                }, {
                    "id": 2, //行业id
                    "name": "药品", //行业名称
                }]
            }
        }
        //获取id = 1的二级行业
        else if (id == 1) {
            return {
                "rs": 1,
                "info": null,
                "industrys": [{
                    "id": 3,
                    "name": "大众汽车",
                }, {
                    "id": 4,
                    "name": "宝马汽车",
                }]
            }
        }
        //获取id = 2的二级行业
        else if (id == 2) {
            return {
                "rs": 1,
                "info": null,
                "industrys": [{
                    "id": 5,
                    "name": "哈药六厂",
                }, {
                    "id": 6,
                    "name": "同仁医药",
                }]
            }
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //广告主详情接口
    var advertiserDetails = function (options) {
        return {
            "result": "success", //结果状态 success：成功 error : 失败
            "data": {
                "version": "123123",
                "info": null, //提示信息
                "id": 1, //广告主自增id
                "dspAdvertiserId": 111, //广告主id
                "name": "爱他美", //广告主名称
                "accountStatusStr": "正常", //账户状态
                "channelStr": "代理商-蓝标集团", //渠道
                "agentName": "xx代理", //所属代理商
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //所属行业
                "contacter": "关先生", //联系人
                "tel": "13800138000", //保密电话
                "email": "xxxxxxxxx@corp.netease.com", //保密邮箱
                "address": "北京市海淀区软件园二期8号", //通讯地址
                "registerTimeStr": "2015-12-12 12:12:12", //注册时间
                "lastFreezeStatus": false, //最后一次账户冻结状态
                "accountLeft": 20000, //账户余额
                "totalRecharge": 30000, //累计充值
                "totalExpense": 10000, //累计消费
                "totalRefuse": 800, //总创意数
                "unauditRefuse": 40, //待审核创意数
                "auditSuccessRefuse": 460, //已通过创意数
                "auditFailRefuse": 300 //未通过创意数
            },
            "success": true
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //广告主冻结/解除接口
    var advertiserFreeze = function (options) {
        return {
            "result": "success", //结果状态 success：成功  error：失败
            "data": null,
            "success": true
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //初始化审核接口
    var startAudit = function (options) {
        var id = options.data.id;
        //查看id = 1的审核信息
        if (id === 1) {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "version": "123123",
                "role": 1, //角色：1.管理员 2.审核员
                "info": null, //提示信息
                "id": 1, //广告主id
                "name": "爱他美", //广告主名称
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //行业
                "channelStr": "代理商-蓝标集团", //渠道
                "dspName": "品友互动", //dsp名称
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "statusStr": "待审核", //审核状态
                "lastAduitStatusStr": null, //最近一次审核结果
                "dspAdvertiserId": "000011", //广告主id
                "credentials": [{
                    "id": 29, //资质ID
                    "cid": 29, //资质类型ID(请求拒绝原因)
                    "name": "广告主基本信息",
                    "expireTimeStr": "", //失效日期
                    "expireNeed": "false", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 2, //资质ID
                    "cid": 2, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": null, //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "true",
                    "statusStr": "拒绝", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens1.jpg", "./css/_images/test-liscens2.jpeg", "./css/_images/test.png.zip", "./css/_images/test.pdf"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 3, //资质ID
                    "cid": 3, //资质类型ID(请求拒绝原因)
                    "name": "ICP备案",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens2.jpeg", "./css/_images/test.png.zip"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 4, //资质ID
                    "cid": 4, //资质类型ID(请求拒绝原因)
                    "name": "身份证复印件",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens2.jpeg"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 5, //资质ID
                    "cid": 5, //资质类型ID(请求拒绝原因)
                    "name": "药品生产许可证",
                    "expireTimeStr": "", //失效日期
                    "expireNeed": "false", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens2.jpeg"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 6, //资质ID
                    "cid": 6, //资质类型ID(请求拒绝原因)
                    "name": "药品GMP证书",
                    "expireTimeStr": "", //失效日期
                    "expireNeed": "false", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens2.jpeg"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }]
            }
        }
        //查看id = 2的审核信息
        else if (id === 2) {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "version": "123123",
                "role": 1, //角色：1.管理员 2.审核员
                "info": null, //提示信息
                "id": 2, //广告主id
                "name": "爱他美", //广告主名称
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //行业
                "channelStr": "代理商-蓝标集团", //渠道
                "dspName": "品友互动", //dsp名称
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "statusStr": "通过", //审核状态
                "lastAduitStatusStr": "通过", //最近一次审核结果
                "dspAdvertiserId": "000022", //广告主id
                "credentials": [{
                    "id": 1, //资质ID
                    "cid": 1, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png", ],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 2, //资质ID
                    "cid": 2, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id ": 3, //资质ID
                    "cid": 3, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 4, //资质ID
                    "cid": 4, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, ]
            }
        }
        //
        else if (id === 4) {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "version": "123123",
                "role": 1, //角色：1.管理员 2.审核员
                "info": null, //提示信息
                "id": 4, //广告主id
                "name": "爱他美", //广告主名称
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //行业
                "channelStr": "代理商-蓝标集团", //渠道
                "dspName": "品友互动", //dsp名称
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "statusStr": "通过", //审核状态
                "lastAduitStatusStr": "通过", //最近一次审核结果
                "dspAdvertiserId": "000022", //广告主id
                "credentials": [{
                    "id": 4, //资质ID
                    "cid": 4, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }]
            }
        }
        //
        else if (id === 10) {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "version": "123123",
                "role": 1, //角色：1.管理员 2.审核员
                "info": null, //提示信息
                "id": 4, //广告主id
                "name": "爱他美", //广告主名称
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //行业
                "channelStr": "代理商-蓝标集团", //渠道
                "dspName": "品友互动", //dsp名称
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "statusStr": "通过", //审核状态
                "lastAduitStatusStr": "通过", //最近一次审核结果
                "dspAdvertiserId": "000022", //广告主id
                "credentials": [{
                    "id": 4, //资质ID
                    "cid": 4, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }]
            }
        }
        //无此待审数据
        else if (id === 9) {
            return {
                "rs": 2,
                "info": "无待审数据，即将返回列表",
                "errorType": 1,
            }
        }
        //随机分配的一个信息
        else {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "version": "123123",
                "role": 1, //角色：1.管理员 2.审核员
                "info": null, //提示信息
                "id": 3, //广告主id
                "name": "我是随机分配的广告主哦", //广告主名称
                "url": "http://aa.com", //网址
                "industryDetail": "药品-药品交易", //行业
                "channelStr": "代理商-蓝标集团", //渠道
                "dspName": "品友互动", //dsp名称
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "statusStr": "待审核", //审核状态
                "lastAduitStatusStr": "待审核", //最近一次审核结果
                "dspAdvertiserId": "00003", //广告主id
                "credentials": [{
                    "id": 1, //资质ID
                    "cid": 1, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 2, //资质ID
                    "cid": 2, //资质类型ID(请求拒绝原因)
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }, {
                    "id": 3, //资质ID
                    "cid": 3, //资质类型ID(请求拒绝原因)
                    "advertiserId": 8, //广告主id
                    "name": "营业执照",
                    "expireTimeStr": "2016-08-15", //失效日期
                    "expireNeed": "true", //是否显示失效日期
                    "required": "false",
                    "statusStr": "待审核", //审核状态
                    "urlArr": //资质url数组
                        ["./css/_images/test-liscens.png", "./css/_images/test-liscens.png"],
                    "reason": "照片不清", //最近一次拒绝原因
                    "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                    "operatorName": "王", //操作人
                    "operateTime": "2016-08-15 16:15:20", //操作时间
                    "resonIds": "1,3,4,5"
                }]
            }
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //获取拒绝原因列表
    var getReasonList = function (options) {
        var id = options.data.id;
        switch (id) {
            case 1:
                return {
                    "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                    "info": null,
                    "reasons": [{
                        "id": 1, //原因 id
                        "reason": "公司网址存在第三方跳转", //原因描述
                    }, {
                        "id": 2, //原因 id
                        "reason": "公司logo与公司网站不一致", //原因描述
                    }, {
                        "id": 3, //原因 id
                        "reason": "公司网站打不开", //原因描述
                    }, {
                        "id": 4, //原因 id
                        "reason": "行业与公司经营范围不一致", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }]
                }
            case 2:
            default:
                return {
                    "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                    "info": null,
                    "reasons": [{
                        "id": 1, //原因 id
                        "reason": "公司网址存在第三方跳转", //原因描述
                    }, {
                        "id": 2, //原因 id
                        "reason": "公司logo与公司网站不一致", //原因描述
                    }, {
                        "id": 3, //原因 id
                        "reason": "公司网站打不开", //原因描述
                    }, {
                        "id": 4, //原因 id
                        "reason": "行业与公司经营范围不一致", //原因描述
                    }, {
                        "id": 5, //原因 id
                        "reason": "创意和落地页中不得使用国旗", //原因描述
                    }]
                }

        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //提交广告主审核结果
    var subAudit = function (params) {
        var id = params.data.id;
        if (id === 4) {
            return {
                "rs": 2,
                "info": "该广告主信息已被修改，操作失败",
            }
        }
        if (id === 10) {
            return {
                "rs": 2,
                "info": "该广告主正在被审核，操作失败",
            }
        }
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //获取菜单树列表
    var getMenus = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null,
            "menus": [{
                    "id": -1, //菜单 id
                    "name": "运营概览", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-overview.png",
                    "state": "overview"
                },
                /*{
                    "id": -2, //菜单 id
                    "name": "运营概览", //菜单 名称
                    "pid": -1, //父Id
                    "state": "overview"
                    },*/
                {
                    "id": 1, //菜单 id
                    "name": "审核管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-manage.png",
                    "state": "management"
                }, {
                    "id": 2, //菜单 id
                    "name": "广告主审核", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-advertiser.png",
                    "state": ""
                }, {
                    "id": 3, //菜单 id
                    "name": "创意审核", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-creativity2.png",
                    "state": ""
                }, {
                    "id": 15, //菜单 id
                    "name": "广告主管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-advertisermanage.png",
                    "state": ""
                }, {
                    "id": 3, //菜单 id
                    "name": "代理商管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-agent.png",
                    "state": ""
                }, {
                    "id": 3, //菜单 id
                    "name": "资源位管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-resouce.png",
                    "state": ""
                }, {
                    "id": 3, //菜单 id
                    "name": "消息管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-message.png",
                    "state": ""
                }, {
                    "id": 300, //菜单 id
                    "name": "发票管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-invoice.png",
                    "state": "invoice-list"
                }
                /*,
                                {
                                    "id": 301, //菜单 id
                                    "name": "发票列表", //菜单 名称
                                    "pid": 300, //父Id
                                    "state": "invoice-list"
                                }*/
                , {
                    "id": 10, //菜单 id
                    "name": "收入统计", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-income.png",
                    "state": ""
                }, {
                    "id": 100, //菜单 id
                    "name": "权限管理", //菜单 名称
                    "pid": 0, //父Id
                    "icon": "./css/_images/menu-icon-authorize.png",
                    "state": ""
                }, {
                    "id": 101, //菜单 id
                    "name": "角色列表", //菜单 名称
                    "pid": 100, //父Id
                    "state": "authorize-roleList"
                }, {
                    "id": 102, //菜单 id
                    "name": "用户列表", //菜单 名称
                    "pid": 100, //父Id
                    "state": "authorize-userList"
                },
                /*{
                    "id": 4, //菜单 id
                    "name": "审核管理", //菜单 名称
                    "pid": 1, //父Id
                    "state": "management"
                }, */
                {
                    "id": 5, //菜单 id
                    "name": "易效广告主", //菜单 名称
                    "pid": 2, //父Id
                    "state": "advertiser-yixiao"
                }, {
                    "id": 6, //菜单 id
                    "name": "NEX广告主", //菜单 名称
                    "pid": 2, //父Id
                    "state": "advertiser-nex"
                }, {
                    "id": 7, //菜单 id
                    "name": "易效创意", //菜单 名称
                    "pid": 3, //父Id
                    "state": "creativity-yixiao"
                }, {
                    "id": 8, //菜单 id
                    "name": "NEX创意", //菜单 名称
                    "pid": 3, //父Id
                    "state": "creativity-nex"
                }, {
                    "id": 9, //菜单 id
                    "name": "创意管理", //菜单 名称
                    "pid": 3, //父Id
                    "state": "creativity-manage",
                }, {
                    "id": 11, //菜单 id
                    "name": "易效广告主收入", //菜单 名称
                    "pid": 10, //父Id
                    "state": "advertiser-income",
                }, {
                    "id": 12, //菜单 id
                    "name": "易效代理商收入", //菜单 名称
                    "pid": 10, //父Id
                    "state": "agent-income",
                }, {
                    "id": 13, //菜单 id
                    "name": "行业收入", //菜单 名称
                    "pid": 10, //父Id
                    "state": "industry-income",
                }, {
                    "id": 14, //菜单 id
                    "name": "位置收入", //菜单 名称
                    "pid": 10, //父Id
                    "state": "area-income"
                }, {
                    "id": 16, //菜单 id
                    "name": "易效广告主管理", //菜单 名称
                    "pid": 15, //父Id
                    "state": "advertisermanage-yixiao"
                }
            ]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------


    //获取广告主NEX广告主列表
    var nexList = function () {
        return {
            "total": 32, //条数
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "role": 2, //角色：1.管理员 2.审核员
            "userStatus": 0, //用户是否可以参与审核 0打开 1关闭
            "info": null, //提示信息
            "list": [{
                "id": 8, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "审核通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "dspId": 123, //dspID
                "dspName": "品友互动", //dsp名称
                "channelSaler": "王维", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }, {
                "id": 9, //自增id
                "dspAdvertiserId": 8, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "statusStr": "审核通过", //审核状态
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "dspId": 123, //dspID
                "dspName": "品友互动", //dsp名称
                "channelSaler": "王维", //渠道销售人员
                "subTimeStr": "2016-08-15 16:15:20", //提交资质时间
                "lastAuditTimeStr": "2016-08-15 16:15:20" //最后审核时间
            }]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //获取Dsp列表
    var getDsp = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null,
            "dsps": [{
                "dspId": 1, //dsp id
                "dspName": "品友互动", //dsp 名称
            }, {
                "dspId": 2, //dsp id
                "dspName": "哇哈哈哇", //dsp 名称
            }]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    //创意nex列表
    var nexAuditList = function () {
        return {
            "total": 32, //条数
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "role": 1, //角色：1.管理员 2.审核员
            "info": null, //提示信息
            "userStatus": 1, //用户是否可以参与审核 0打开 1关闭
            "list": [{
                "id": 1, //广告主id
                "dspAdvertiserId": 1, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 2, //广告主id
                "dspAdvertiserId": 2, //广告主id
                "name": "该广告主不符合审核条件,已从列表移除", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 3, //广告主id
                "dspAdvertiserId": 3, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 4, //广告主id
                "dspAdvertiserId": 4, //广告主id
                "name": "广州网易计算机系统有限公司", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }]
        }
    };
    //end -----------------
    //end -----------------
    //end -----------------

    var idea_p4pList = function () {
        return {
            "total": 32, //条数
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "role": 2, //角色：1.管理员 2.审核员
            "userStatus": 0, //用户是否可以参与审核 0打开 1关闭
            "info": null, //提示信息
            "list": [{
                "id": 8, //广告主id
                "dspAdvertiserId": 8, //广告主id
                "name": "爱他美", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }, {
                "id": 9, //广告主id
                "dspAdvertiserId": 9,
                "name": "爱他美", //广告主名称
                "auditNum": 5, //待审数量
                "updateTimeStr": "2016-08-15 16:15:20", //更新时间
                "industryStr": "药品", //一级行业
                "subIndustryStr": "药品交易", //二级行业
                "channelStr": "代理商", //渠道
                "agentId": 123, //代理商ID
                "agentName": "蓝标集团", //代理商名称
                "dspId": 123, //dspID
                "dspName": "品友互动" //dsp名称
            }]
        }
    }

    //end -----------------
    //end -----------------
    //end -----------------

    //创意管理列表
    var managerList = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "total": 22,
            "info": null, //提示信息
            "ideas": [{
                "id": 123,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 302, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-图文",
                "material": "../css/_images/test-img-small.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "通过",
                "reason": "",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 124,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 303, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "NEX", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-下载图文",
                "material": "../css/_images/test-img-small.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "拒绝",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 125,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 304, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-大图",
                "material": "../css/_images/test-img-big.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "作废",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 126,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 305, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-下载大图",
                "material": "../css/_images/test-img-big.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "待审核",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 127,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 306, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-三图",
                "material": "../css/_images/test-show-three.png,../css/_images/test-show-three.png,../css/_images/test-show-three.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "拒绝",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 127,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 307, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-视频",
                "material": "../css/_images/test-show-vedio-img.png,../css/_images/test-show-vedio-vedio.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "拒绝",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }, {
                "id": 127,
                "dspAdvertiserId": 8, //广告主id
                "dspIdeaId": 308, //创意id
                "advertiserName": "爱他美", //广告主名称
                "industryDetail": "药品-药品交易", //行业
                "categoryStr": "易效", //产品分类
                "dspAgent": "安徽网新", //代理商或者dsp的名称
                "typeStr": "信息流-GIF",
                "material": "../css/_images/test-show-gif.png,../css/_images/test-show-gif.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "statusStr": "拒绝",
                "reason": "创意和落地页中不得使用国旗、国歌",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
            }]
        }
    };

    var getAgents = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null,
            "agents": [{
                "id": 1,
                "name": "代理商1"
            }, {
                "id": 2,
                "name": "代理商2"
            }, {
                "id": 3,
                "name": "代理商3"
            }]
        }
    };

    //初始化创意审核接口
    var ideaStartAudit = function (params) {
        var id = params.data.id;
        if (id === 2) {
            return {
                "rs": 2,
                "info": "该广告主不符合审核条件，已从列表中移除"
            }
        }
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "role": "1", //角色：1.管理员 2.审核员
            "info": null, //提示信息
            "id": 8, //广告主id
            "name": "爱他美", //广告主名称
            "url": "http://aa.com", //网址
            "industryDetail": "药品-药品交易", //行业
            "channelStr": "代理商-蓝标集团", //渠道
            "dspName": "品友互动", //dsp名称
            "version": "asdfsww1212", //版本号
            "required-credentials": [{
                "id": 1,
                "name": "事业单位法人登记证书",
                "url": ["./css/_images/test-liscens.png"],
            }, {
                "id": 2,
                "name": "ICP备案",
                "url": //资质url数组
                    ["./css/_images/test-show-gif.png"]

            }, {
                "id": 3,
                "name": "身份证复印件",
                "url": //资质url数组
                    ["./css/_images/test-liscens.png"]

            }, {
                "id": 4,
                "name": "出入境检验检疫合格证明",
                "url": //资质url数组
                    ["./css/_images/test-liscens1.jpg"]

            }, {
                "id": 5,
                "name": "进口食品标签审核证书",
                "url": //资质url数组
                    ["./css/_images/test-liscens2.jpeg"]

            }],
            "other-credentials": [{
                "id": 1,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test-liscens.png"]

            }, {
                "id": 2,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test-liscens.png"]

            }],
            "idea-credentials": [{
                "id": 1,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test-liscens.png"]

            }, {
                "id": 2,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test-liscens.png"]

            }, {
                "id": 3,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test.png.zip"]

            }, {
                "id": 4,
                "name": "营业执照",
                "url": //资质url数组
                    ["./css/_images/test.pdf"]

            }]
        }
    };

    //创意审核 广告主下列表数据
    var adIdeaList = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "total": 100,
            "role": "1", //角色：1.管理员 2.审核员
            "info": null, //提示信息
            "id": 8, //广告主id
            "name": "爱他美", //广告主名称
            "url": "http://aa.com", //网址
            "industry": "药品-药品交易", //行业
            "channel": "代理商-蓝标集团", //渠道
            "dspName": "品友互动", //dsp名称
            "ideas": [{
                "id": 123,
                "dspIdeaId": 123,
                "typeStr": "信息流-图文",
                "statusStr": "通过",
                "reason": "",
                "material": "../css/_images/test-img-small.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "",
                "iosUrl": "",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-25 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 124,
                "dspIdeaId": 124,
                "typeStr": "信息流-下载图文",
                "statusStr": "通过",
                "reason": "",
                "material": "../css/_images/test-img-small.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 223,
                "dspIdeaId": 223,
                "typeStr": "信息流-大图", //类型
                "statusStr": "待审核",
                "reason": "拒绝",
                "material": "../css/_images/test-img-big.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 224,
                "dspIdeaId": 224,
                "typeStr": "信息流-下载大图", //类型
                "statusStr": "待审核",
                "reason": "拒绝",
                "material": "../css/_images/test-img-big.png", //物料地址多个
                "title": "****不符合审核条件****",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 323,
                "dspIdeaId": 323,
                "typeStr": "信息流-三图", //类型
                "statusStr": "拒绝",
                "reason": "创意及落地页面涉嫌夸大",
                "material": "../css/_images/test-show-three.png,../css/_images/test-show-three.png,../css/_images/test-show-three.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 423,
                "dspIdeaId": 423,
                "typeStr": "信息流-视频", //类型
                "statusStr": "待审核",
                "reason": "拒绝",
                "material": "../css/_images/test-show-vedio-img.png,../css/_images/test-show-vedio-vedio.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 523,
                "dspIdeaId": 523,
                "typeStr": "信息流-GIF", //类型
                "statusStr": "作废",
                "reason": "拒绝",
                "material": "../css/_images/test.gif,../css/_images/test.gif", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }, {
                "id": 623,
                "dspIdeaId": 623,
                "typeStr": "信息流-GIF", //类型
                "statusStr": "作废",
                "reason": "拒绝",
                "material": "../css/_images/test-show-gif.png,../css/_images/test-show-gif.png", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "cid": 12,
            }]
        }
    };

    //创意提交
    var subAuditIdeas = function (params) {
        var ids = params.data.ids;
        //模拟id = 224时审核失败情况
        var flag = false;
        for (var i = 0, len = ids.length; i < len; i++) {
            if (ids[i] === 224) {
                flag = true;
                break;
            }
        }
        //模拟id = 224时审核失败情况
        if (flag) {
            return {
                "rs": 2, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "info": "该广告主不符合审核条件，已从列表中移除", //提示信息
            }
        }
        //
        else {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "info": null, //提示信息
            }
        }
    };

    //广告主一键通过
    var subAuditAds = function (params) {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
        }
    };

    //管理员查看待审数量
    var getNeedAudit = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "advertiser": {
                "total": 100,
                "p4p": 40,
                "nex": 60
            },
            "idea": {
                "total": 100,
                "p4p": 40,
                "nex": 60
            }
        }
    };

    //管理员打开关闭操作员接口
    var operate = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
        }
    };

    //查看工作量
    var getAuditWorks = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "list": [{
                "userId": "123123",
                "userName": "审核员1",
                "advertiserTotal": 400,
                "advertiserP4p": 40,
                "advertiserNex": 60,
                "ideaTotal": 100,
                "ideaP4p": 40,
                "ideaNex": 60,
                "auditOpen": "false"
            }, {
                "userId": "1",
                "userName": "审核管理员",
                "advertiserTotal": 400,
                "advertiserP4p": 40,
                "advertiserNex": 60,
                "ideaTotal": 100,
                "ideaP4p": 40,
                "ideaNex": 60,
                "auditOpen": "false"
            }, {
                "userId": "100023",
                "userName": "审核员2",
                "advertiserTotal": 100,
                "advertiserP4p": 40,
                "advertiserNex": 550,
                "ideaTotal": 100,
                "ideaP4p": 40,
                "ideaNex": 60,
                "auditOpen": "true",
            }]
        }
    };

    //用户退出接口
    var logout = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
        }
    };

    //创意管理下钻明细接口
    var ideaDetail = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "total": 100,
            "role": "1", //角色：1.管理员 2.审核员
            "info": null, //提示信息
            "ideas": [{
                "id": 123,
                "dspIdeaId": 123, //（新增）
                "typeStr": "信息流-图文",
                "material": "http://aa.com/a.jpg,http://aa.com/b.jpg", //物料地址多个
                "title": "京北富氧美宅与新城双轨直达",
                "clickUrl": "http://public.ho.html",
                "androidUrl": "http://public.ho.html",
                "iosUrl": "http://public.ho.html",
                "updateTimeStr": "2016-08-15 16:15:20",
                "operatorName": "1号管理员 ", //操作人
                "operateTimeStr": "2016-08-15 16:15:20", ////操作时间
                "version": "asdfsww1212", //版本号
                "statusStr": "通过", //审核状态
                "cid": 1, //资质类型ID(请求拒绝原因)

            }]
        }
    };


    var dspQuery = function () {
        return {
            "invdata": [{
                "dspName": "品友互动",
                "dspId": 1
            }],
            "total": 13,
            "info": null,
            "result": "success"
        }
    };


    //发票列表
    var invoiceList = function () {
        return {
            "invdata": [{
                "applyAmount": 101,
                "creationDate": "2016-09-09",
                "dspId": 1,
                "dspName": "DSP名称",
                "id": 1,
                "invoiceType": 2,
                "lastModifiedDate": "2016-09-09",
                "refuseReason": "",
                "status": 0
            }, {
                "id": 24,
                "creationDate": "2016-09-30 10:57",
                "dspId": 5,
                "dspName": "有道智选",
                "applyAmount": 300,
                "invoiceType": 1,
                "lastModifiedDate": "2016-10-31 17:56",
                "status": 4,
                "refuseReason": "",
                "firstCommit": 0,
                "invoiceTitle": "广告抬头",
                "invoiceItemType": 1,
                "corpName": "公司名称",
                "corpBank": "北京工商银行",
                "corpRateCode": "123",
                "corpBankAccount": "6225881248376583",
                "corpAddress": "北京市海淀区",
                "corpTel": "18612485554",
                "corpCertUrl": "http://static.netease.com/xxxxxxxx.jpg"
            }, {
                "id": 24,
                "creationDate": "2016-09-30 10:57",
                "dspId": 5,
                "dspName": "有道智选",
                "applyAmount": 300,
                "invoiceType": 1,
                "lastModifiedDate": "2016-10-31 17:56",
                "status": 3,
                "refuseReason": "",
                "firstCommit": 0,
                "invoiceTitle": "广告抬头",
                "invoiceItemType": 1,
                "corpName": "公司名称",
                "corpBank": "北京工商银行",
                "corpRateCode": "123",
                "corpBankAccount": "6225881248376583",
                "corpAddress": "北京市海淀区",
                "corpTel": "18612485554",
                "corpCertUrl": "http://static.netease.com/xxxxxxxx.jpg"
            }],
            "total": 90,
            "info": null
        }
    }

    //发票导出
    var invoiceExport = function () {
            return {
                "info": 'success'
            }
        }
        //标记开具
    var invoiceMarkIssued = function () {
        return {
            "info": 'success'
        }
    }

    var invoiceInfo = function () {
        return {
            "data": {
                "checkPending": false,
                "dspName": "有道智投",
                "invoiceApply": {
                    "id": 1,
                    "dspId": 1,
                    "applyAmount": 10011,
                    "invoiceType": 2,
                    "invoiceTitle": "申请开发票",
                    "invoiceItemType": 1,
                    "invoiceAmount": 20021,
                    "corpName": "北京XXYY公司",
                    "corpRateCode": "9999",
                    "corpAddress": "北京市海淀区XXX",
                    "corpBank": "中国工商银行",
                    "corpBankAccount": "6558998545874512",
                    "corpTel": "010-25471234",
                    "corpCertUrl": "http://nssale.nosdn.127.net/20161206/20161206634f5597220ee92189b348?watermark&type=1&gravity=northeast&dissolve=30&dx=20&dy=20&image=MTUzMTc5NzIxNzU3MTRhOGQ0NWNlZWYucG5n",
                    "corpCertBegin": "2014-12-31",
                    "corpCertEnd": "2016-12-31",
                    "contactPerson": "张三",
                    "contactAddress": "北京市海淀区中关村软件园",
                    "contactEmail": "bjhexin3@corp.netease.com",
                    "contactTel": "186123485554",
                    "status": 0,
                    "lastStatus": 0,
                    "firstCommit": 0,
                    "refuseReason": null,
                    "creationDate": "2016-08-30 15:19",
                    "lastModifiedDate": "2016-08-30 15:19",
                    "lastModifierStr": "张秋实"
                },
                "logs": [{
                    "id": null,
                    "invoiceApplyId": null,
                    "opType": null,
                    "opDate": "2016-09-21 18:16",
                    "operator": null,
                    "reason": "发票抬头错误",
                    "revokeApplyId": null,
                    "opTypeStr": "发票开具",
                    "operatorStr": "张秋实"
                }]
            },
            "result": "success",
            "success": true
        }
    }

    var invoiceMarkRefused = function () {
        return {
            "data": null,
            "result": "success",
            "success": true
        }
    }

    var invoiceCancelApplyCheck = function () {
        return {
            "data": null,
            "result": "success",
            "success": true
        }
    }

    var invoceCancelApply = function () {
        return {
            "data": null,
            "result": "success",
            "success": true
        }
    }

    var invoiceMarkAbandon = function () {
        return {
            "data": null,
            "result": "success",
            "success": true
        }
    }
    var invoiceMarkPosted = function () {
        return {
            "data": null,
            "result": "success",
            "success": true
        }
    }

    var getUserCurrentAccount = function () {
        return {
            "data": {
                "name": "stenio",
                "permissions": ["B_INVOICE", "B_SUCCESS_SEND", "B_REFUSE", "B_CANCEL", "B_APPLY_REVOKE", "B_REVOKE_AUDIT", "B_POI"],
                "roleId": 8
            },
            "result": "success",
            "success": true
        }
    }

    //广告主收入列表接口
    var advRevenue = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "total": 4,
            "lists": [{
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }, {
                "advertiserId": 8, //广告主id
                "advertiserName": "有道", //广告主名称
                "channelName": "代理商", //渠道
                "agentId": "123", //代理商ID
                "agentName": "代理商名称", //代理商名称
                "industry": "教育-学历教育", //行业
                "revenue": 2000, //收入
                "expend": 2000, //花费
                "exposures": 20000, //曝光量
                "clicks": 20, //点击量
                "clickRate": 0.01, //点击率
                "pvCost": 1.0, //千次展示成本
                "clickCost": 20
            }]
        }
    }

    //运营概览
    var overView = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "yipin": {
                "totalIncome": 9999,
                "todayIncome": null,
                "usingAdvertisers": 60,
                "auditAdvertisers": 0,
                "auditIdeas": null
            },
            "p4p": {
                "totalIncome": 100,
                "todayIncome": 40,
                "usingAdvertisers": 60,
                "auditAdvertisers": 60,
                "auditIdeas": 60
            },
            "nex": {
                "totalIncome": 100,
                "todayIncome": 40,
                "usingAdvertisers": 60,
                "auditAdvertisers": 60,
                "auditIdeas": 60
            }
        }
    };

    //概览图表
    var overViewChart = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "lists": {
                date: ["2016-11-10 00:00", "2016-11-11 01:00", "2016-11-12 02:00", "2016-11-13 03:00", "2016-11-14 04:00", "2016-11-15 05:00", "2016-11-16 06:00", "2016-11-17 07:00", "2016-11-18 08:00", "2016-11-19 09:00", "2016-11-20 10:00"],
                income: ["4000", "3902.87", "230.0", "1543.55", "1458.34", "4000", "3902.87", "2300", "1543.55", "1458.34", "1543.55"]
            }
        }
    };


    var getRoleList = function (op) {
        var postData = op.data;
        return {
            rs: 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            info: '',
            total: 29, //条数
            list: [{
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 2, //自增id
                "roleName": "管理员2", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 3, //自增id
                "roleName": "管理员3", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 4, //自增id
                "roleName": "管理员4", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }, {
                "roleId": 1, //自增id
                "roleName": "管理员1", //角色名称
                "roleDesc": "拥有运管系统全部权限", //角色描述
            }].slice((postData.start - 1) * postData.limit, postData.start * postData.limit)
        }
    }

    var deleteRole = function () {
        return {
            rs: 2,
            info: '删除失败！'
        }
    }
    var getAllMenus = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null,
            "menus": [{
                id: 1,
                pid: 0,
                name: 'A',
                type: 0,
            }, {
                id: 2,
                pid: 0,
                name: 'B',
                type: 0,
            }, {
                id: 3,
                pid: 1,
                name: 'C',
                type: 1,
            }, {
                id: 4,
                pid: 1,
                name: 'D',
                type: 1,
            }, {
                id: 5,
                pid: 1,
                name: 'E',
                type: 1,
            }, {
                id: 6,
                pid: 2,
                name: 'FFFF',
                type: 1,

            }, {
                id: 7,
                pid: 4,
                name: 'D',
                type: 2,

            }, {
                id: 8,
                pid: 4,
                name: 'E',
                type: 2,
            }, {
                id: 9,
                pid: 6,
                name: 'FFFF',
                type: 2,
            }]
        }
    }
    var getRoleDetail = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": "",
            "roleName": "销售", //角色名称
            "roleDesc": "拥有销售权限", //角色描述
            "permissionIds": " 1,2,6" //权限ID
        }

    }
    var saveOrUpateRole = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": ""
        }

    }
    var getUserList = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": "",
            "total": 32, //条数
            "list": [{
                "userId": 1, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 1, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 1, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 1, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 1, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, {
                "userId": 2, //自增id
                "nickName": "bjwaaaa", //用户名
                "userName": "王五", //真实姓名
                "roleNames": "管理员，财务", //角色列表
            }, ]
        }
    }

    var deleteUser = function () {
        return {
            rs: 2,
            info: '删除失败'
        }
    }

    var getUserDetail = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": "",
            "userId": 1, //userid
            "nickName": "bjwangxuemei", //用户名
            "userName": "王雪梅", //用户姓名
            "roleIds": " 1,2,6" //角色ID
        }
    }
    var saveOrUpateUser = function () {
        return {
            rs: 2,
            info: '提交失败！'
        }
    }

    var userInfo = function () {
        return {
            "rs": 1,
            "user": {
                "userId": 1,
                "userName": "MOCK先生",
                "nickName": "MOCK先生",
                "password": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
                "identifyId": null,
                "phone": null,
                "email": null,
                "sex": 0,
                "birthday": null,
                "createTime": null,
                "updateTime": null,
                "operatorId": null,
                "operatorName": null,
                "remarks": null,
                "userStatus": 0,
                "dataStatus": 0,
                "pointer": null,
                "roleIds": "1"
            },
            "info": ""
        }
    };
    var checkUser = function () {
        return {
            rs: 2
        }
    }
    var checkRole = function () {
            return {
                rs: 2
            }
        }
        //代理商收入列表接口
    var agentRevenue = function () {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "info": null, //提示信息
                "total": 32,
                "lists": [{
                    "id": 8, //消息id
                    "name": "天津科技公司", //广告主名称
                    "industryStr": "教育 - 学历教育", //行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20
                }, {
                    "id": 8, //消息id
                    "name": "天津科技公司", //广告主名称
                    "industryStr": "教育 - 学历教育", //行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20
                }, {
                    "id": 8, //消息id
                    "name": "天津科技公司", //广告主名称
                    "industryStr": "教育 - 学历教育", //行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20
                }, {
                    "id": 8, //消息id
                    "name": "天津科技公司", //广告主名称
                    "industryStr": "教育 - 学历教育", //行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20
                }]
            }
        }
        //行业收入列表接口
    var industryRevenue = function () {
            return {
                "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
                "info": null, //提示信息
                "total": 32,
                "lists": [{
                    "categoryStr": "易效", //产品线
                    "industryStr": "药品", //一级行业
                    "subIndustryStr": "药品交易", //二级行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20, //平均点击成
                    "clickCost": 20
                }, {
                    "categoryStr": "易效", //产品线
                    "industryStr": "药品", //一级行业
                    "subIndustryStr": "药品交易", //二级行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20, //平均点击成
                    "clickCost": 20
                }, {
                    "categoryStr": "易效", //产品线
                    "industryStr": "药品", //一级行业
                    "subIndustryStr": "药品交易", //二级行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20, //平均点击成
                    "clickCost": 20
                }, {
                    "categoryStr": "易效", //产品线
                    "industryStr": "药品", //一级行业
                    "subIndustryStr": "药品交易", //二级行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20, //平均点击成
                    "clickCost": 20
                }, {
                    "categoryStr": "易效", //产品线
                    "industryStr": "药品", //一级行业
                    "subIndustryStr": "药品交易", //二级行业
                    "income": 2000, //收入
                    "cost": 2000, //花费
                    "pv": 20000, //曝光量
                    "click": 20, //点击量
                    "clickRate": 0.01, //点击率
                    "cpmCost": 1.0, //千次展示成本
                    "clickCost": 20, //平均点击成
                    "clickCost": 20
                }]
            }
        }
        //获取栏目位置接口
    var queryColumnsWithPosition = function (options) {
        var id = options.data.id;
        //获取一级行业列表
        if (id == "") {
            return {
                "rs": 1,
                "info": null,
                "columns": [{
                    "id": 1, //栏目 id
                    "name": "网易新闻客户端", //栏目名称
                }, {
                    "id": 2, //栏目id
                    "name": "头条", //栏目名称
                }, {
                    "id": 3, //栏目id
                    "name": "财经", //栏目名称
                }, {
                    "id": 4, //栏目id
                    "name": "家居", //栏目名称
                }, {
                    "id": 5, //栏目id
                    "name": "健康", //栏目名称
                }, {
                    "id": 6, //栏目id
                    "name": "科技", //栏目名称
                }, {
                    "id": 7, //栏目id
                    "name": "旅游", //栏目名称
                }, {
                    "id": 8, //栏目id
                    "name": "汽车", //栏目名称
                }, {
                    "id": 9, //栏目id
                    "name": "旅游", //栏目名称
                }, {
                    "id": 10, //栏目id
                    "name": "汽车", //栏目名称
                }, {
                    "id": 11, //栏目id
                    "name": "热点", //栏目名称
                }, {
                    "id": 12, //栏目id
                    "name": "时尚", //栏目名称
                }, {
                    "id": 13, //栏目id
                    "name": "手机", //栏目名称
                }, {
                    "id": 14, //栏目id
                    "name": "数码", //栏目名称
                }, {
                    "id": 15, //栏目id
                    "name": "体育", //栏目名称
                }, {
                    "id": 16, //栏目id
                    "name": "游戏", //栏目名称
                }, {
                    "id": 17, //栏目id
                    "name": "娱乐", //栏目名称
                }, {
                    "id": 18, //栏目id
                    "name": "独家", //栏目名称
                }, {
                    "id": 19, //栏目id
                    "name": "通发文章页相关新闻", //栏目名称
                }, {
                    "id": 20, //栏目id
                    "name": "房产", //栏目名称
                }, {
                    "id": 21, //栏目id
                    "name": "教育", //栏目名称
                }]
            }
        }
        //获取id = 1的位置
        else if (id == 1) {
            return {
                "rs": 1,
                "info": null,
                "positions": [{
                    "id": 3,
                    "name": "大众汽车",
                }, {
                    "id": 4,
                    "name": "宝马汽车",
                }]
            }
        }
        //获取id = 2的栏目
        else if (id == 2) {
            return {
                "rs": 1,
                "info": null,
                "positions": [{
                    "id": 5,
                    "name": "哈药六厂",
                }, {
                    "id": 6,
                    "name": "同仁医药",
                }]
            }
        } else {
            return {
                'rs': 1,
                'info': '参数出错'
            }
        };
    }

    //位置收入列表接口
    var positionRevenue = function () {
        return {
            "rs": 1, //结果状态 1：成功  2：失败（失败时info会有提示信息）
            "info": null, //提示信息
            "total": 0,
            "lists": []
        }
    }
    return {
        "userInfo": userInfo,
        "p4pList": p4pList,
        "p4pManageList": p4pManageList,
        "getYXIndustry": getYXIndustry,
        "getYXSubIndustry": getYXSubIndustry,
        "getIndustry": getIndustry,
        "advertiserDetails": advertiserDetails,
        "advertiserFreeze": advertiserFreeze,
        "startAudit": startAudit,
        "getReasonList": getReasonList,
        "subAudit": subAudit,
        "getMenus": getMenus,
        "nexList": nexList,
        "getDsp": getDsp,
        "nexAuditList": nexAuditList,
        "idea_p4pList": idea_p4pList,
        "managerList": managerList,
        "getAgents": getAgents,
        "ideaStartAudit": ideaStartAudit,
        "adIdeaList": adIdeaList,
        "subAuditIdeas": subAuditIdeas,
        "getAuditWorks": getAuditWorks,
        "operate": operate,
        "getNeedAudit": getNeedAudit,
        "logout": logout,
        "subAuditAds": subAuditAds,
        "ideaDetail": ideaDetail,
        //"advRevenue": advRevenue,
        "overView": overView,
        "overViewChart": overViewChart,
        "dspQuery": dspQuery,
        "invoiceList": invoiceList,
        "invoiceExport": invoiceExport,
        "invoiceMarkIssued": invoiceMarkIssued,
        "invoiceInfo": invoiceInfo,
        "invoiceCancelApplyCheck": invoiceCancelApplyCheck,
        "invoiceMarkRefused": invoiceMarkRefused,
        "invoceCancelApply": invoceCancelApply,
        "invoiceMarkAbandon": invoiceMarkAbandon,
        "invoiceMarkPosted": invoiceMarkPosted,
        "getUserCurrentAccount": getUserCurrentAccount,
        "advRevenue": advRevenue,
        "getRoleList": getRoleList,
        "deleteRole": deleteRole,
        "getAllMenus": getAllMenus,
        "getRoleDetail": getRoleDetail,
        "saveOrUpateRole": saveOrUpateRole,
        "getUserList": getUserList,
        "deleteUser": deleteUser,
        "getUserDetail": getUserDetail,
        "saveOrUpateUser": saveOrUpateUser,
        "queryColumnsWithPosition": queryColumnsWithPosition,
        "industryRevenue": industryRevenue,
        "agentRevenue": agentRevenue,
        "positionRevenue": positionRevenue,
        checkUser: checkUser,
        checkRole: checkRole
    }
})