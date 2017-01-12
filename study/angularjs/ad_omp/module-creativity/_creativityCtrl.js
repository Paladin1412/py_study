"use strict"
/**
 *  Module
 *
 *  创意模块 Controller
 */
angular.module('omp.creativity.ctrl', [])

/*  End
 *
 *  Controller 创意列表-易效NEX管理
 *
 *  Start
 */

//edit by mengna 2222
.controller('omp-creativity-listCtrl', function ($scope, $sce, $state, $stateParams, $timeout, http, tools) {

    $scope.sce = $sce.trustAsResourceUrl;
    //初始化程序
    function init() {
        //设置当前页面类型
        getCurrentPageType($state.current.name);
        //监听分页请求
        listenPageInfo();
        //获取查询缓存信息
        var store = JSON.parse(window.sessionStorage.getItem("ideaSearchStore"));
        //有缓存 并且从上一级菜单返回需要缓存
        /*if (store && $stateParams.msg.reload === true) {
            getSearchSessionStorage(store);
            //获取数据列表
            getDataList(setSearchParams());
        }
        //其他情况
        else {*/
        //清除缓存
        window.sessionStorage.removeItem("ideaSearchStore");
        if ($scope.data.pageType === 1 || $scope.data.pageType === 2) {
            //获取一级行业列表
            getIndustry("");
        }
        //当为NEX页面时获取DSP列表
        if ($scope.data.pageType === 2) {
            getDspList();
        }
        //创意管理获取dspAgent列表
        if ($scope.data.pageType === 3) {
            getDspAgent("");
        }
        //获取数据列表
        getDataList(setSearchParams());
        /*}*/
        $('body').on('click', '.img-style-vedio a,.omp-pop-background', function () {
            //    创意模块-查看详情（信息流-视频）  关闭预览页面的事件监听************************
            $(".img-style-vedio").find("video").remove();

        })

    };

    /*  * * * * * * * * * * * PART 1 基本信息 * * * * * * *
     *  $scope.data         页面基本信息
     *
     *  pageType            页面类型(1yixiao 2nex 3manage)
     *  total               数据总条数
     *  role                角色(1管理员 2审核员)
     *  checked             全选框
     *  checkedCount        勾选框计数
     *  btnDisable          一键通过是否可用
     *  userStatus          用户开始审核是否有效
     *
     *  inputWarning        广告主ID/名称 错误提示
     *  inputWarningTitle   创意标题错误提示
     *  inputWarningId
     *
     *  sortKey             排序关键字
     *  sortDir             排序方式
     */
    $scope.data = {
        // "pageStart": 1,
        "pageType": 1,
        "role": 0,
        "total": "",
        "btnDisable": true,
        "checked": false,
        "checkedCount": 0,
        "inputWarning": "",
        "inputWarningTitle": "",
        "inputWarningId": "",
        "sortKey": "",
        "sortDir": "",
    };

    //通过获取当前ui-router状态名 设置页面类型
    function getCurrentPageType(key) {
        var enumPageType = {
            "creativity-yixiao": 1,
            "creativity-nex": 2,
            "creativity-manage": 3
        };

        if (enumPageType.hasOwnProperty(key)) {
            $scope.data.pageType = enumPageType[key];
        }
    };

    /*  * * * * * * * * * * * PART 2 页面搜索 * * * * * * *
     *  $scope.search     页面搜索部分
     *
     *  mediaType         选中展现形式
     *  mediaTypeList     展现形式列表
     *
     *  category          选中的产品线
     *  categoryList      产品线列表
     *
     *  dspAgent          dsp/代理商选中
     *  dspAgentList      dsp/代理商列表
     *  dsp               选中的dsp名称
     *  dspList           dsp列表
     *
     *  state             审核状态
     *  stateList         待审核状态
     *
     *  channel           选中的渠道
     *  channelList       渠道列表
     *
     *  industry          选中的一级行业
     *  industryList      一级行业列表
     *
     *  subIndustry       选中的二级行业
     *  subIndustryList   二级行业列表
     *
     *  inputAdvertiser   查询广告主ID
     *  inputCreateId     查询创意ID
     *  inputTitle        查询创意标题
     *
     *  var sort          排序查询
     *
     *  key               排序名
     *  dir               排序方式  ASC DESC
     *
     */
    $scope.search = {
        mediaType: {
            "id": "",
            "name": "全部"
        },
        mediaTypeList: [{
            "id": "",
            "name": "全部"
        }, {
            "id": 3,
            "name": "信息流-图文"
        }, {
            "id": 10,
            "name": "信息流-大图"
        }, {
            "id": 16,
            "name": "信息流-下载图文"
        }, {
            "id": 15,
            "name": "信息流-下载大图"
        }, {
            "id": 11,
            "name": "信息流-三图"
        }, {
            "id": 18,
            "name": "信息流-GIF"
        }, {
            "id": 13,
            "name": "信息流-视频"
        }],
        category: {
            "id": "",
            "name": "全部"
        },
        categoryList: [{
            "id": "",
            "name": "全部"
        }, {
            "id": 1,
            "name": "易效"
        }, {
            "id": 2,
            "name": "NEX"
        }],
        dspAgent: {
            "id": "",
            "name": "全部"
        },
        dspAgentList: [],
        dsp: {
            "id": "",
            "name": "全部"
        },
        dspList: [],
        channel: {
            "id": "",
            "name": "全部"
        },
        channelList: [{
            "id": "",
            "name": "全部"
        }, {
            "id": 1,
            "name": "直客"
        }, {
            "id": 2,
            "name": "代理商"
        }],
        industry: {
            "id": "",
            "name": "全部一级行业"
        },
        industryList: [],
        subIndustry: {
            "id": "",
            "name": "全部二级行业"
        },
        subIndustryList: [{
            "id": "",
            "name": "全部二级行业"
        }],
        inputAdvertiser: "",
        inputTitle: "",
        inputCreateId: "",
    };

    //长度验证
    function inputLengthCheck(value, warningKey, maxLength, tips) {
        //长度验证不通过
        if (tools.getCharLength(value) > parseInt(maxLength)) {
            $scope.data[warningKey] = tips;
            return false;
        }
        //长度验证通过
        else {
            $scope.data[warningKey] = "";
            return true;
        }
    };

    //获取行业数组 id = ""获取一级行业 else二级行业
    function getIndustry(id, defaultName) {
        var params = {
            "id": id
        }
        http("getIndustry", {
            data: params
        }, function (msg) {
            //一级行业
            if (id == "") {
                $scope.search.industryList = msg.industrys;
                $scope.search.industryList.unshift({
                    id: "",
                    name: "全部一级行业"
                });
                $scope.search.industry = null;
                //如果有默认选中项
                if (defaultName) {
                    for (var i = 0, len = $scope.search.industryList.length; i < len; ++i) {
                        if ($scope.search.industryList[i].name === defaultName) {
                            $scope.search.industry = $scope.search.industryList[i];
                            break;
                        }
                    }
                };
                //如果没有默认选中项
                if ($scope.search.industry === null) {
                    $scope.search.industry = {
                        id: "",
                        name: "全部一级行业"
                    };
                }
            }
            //二级行业
            else if (id >= 0) {
                $scope.search.subIndustryList = msg.industrys;
                $scope.search.subIndustryList.unshift({
                    id: "",
                    name: "全部二级行业"
                });
                $scope.search.subIndustry = null;
                //如果有默认选中项
                if (defaultName) {
                    for (var i = 0, len = $scope.search.subIndustryList.length; i < len; ++i) {
                        if ($scope.search.subIndustryList[i].name === defaultName) {
                            $scope.search.subIndustry = $scope.search.subIndustryList[i];
                            break;
                        }
                    }
                };
                //如果没有默认选中项
                if ($scope.search.subIndustry === null) {
                    $scope.search.subIndustry = {
                        id: "",
                        name: "全部二级行业"
                    };
                };
            }
        });
    };

    //获取dsp列表
    function getDspList(defaultName) {
        http("getDsp", {
            "adapter": "dsp"
        }, function (msg) {
            $scope.search.dspList = msg.dsps;
            $scope.search.dspList.unshift({
                "id": "",
                "name": "全部"
            });
            if (defaultName) {
                for (var i = 0, len = $scope.search.dspList.length; i < len; ++i) {
                    if ($scope.search.dspList[i].name === defaultName) {
                        $scope.search.dsp = $scope.search.dspList[i];
                        break;
                    }
                }
            }
        });
    };

    //更换产品线 修改代理商/DSP列表
    function getDspAgent(id, defaultName) {
        $scope.search.dspAgent = null;
        //全部产品线
        if (id == "") {
            $scope.search.dspAgentList = [{
                "id": "",
                "name": "全部"
            }];
            $scope.search.dsp = {
                "id": "",
                "name": "全部"
            };
        }
        //易效 代理商
        else if (id == 1) {
            http("getAgents", {}, function (msg) {
                $scope.search.dspAgentList = msg.agents;
                //添加默认全部情况
                $scope.search.dspAgentList.unshift({
                    "id": "",
                    "name": "全部"
                });
                //查找默认值
                if (defaultName) {
                    for (var i = 0, len = $scope.search.dspAgentList.length; i < len; ++i) {
                        if ($scope.search.dspAgentList[i].name === defaultName) {
                            $scope.search.dspAgent = $scope.search.dspAgentList[i];
                            break;
                        }
                    }
                }
            });
        }
        //NEX DSP
        else if (id == 2) {
            http("getDsp", {
                "adapter": "dsp"
            }, function (msg) {
                $scope.search.dspAgentList = msg.dsps;
                //添加默认全部情况
                $scope.search.dspAgentList.unshift({
                    "id": "",
                    "name": "全部"
                });
                //查找默认值
                if (defaultName) {
                    for (var i = 0, len = $scope.search.dspAgentList.length; i < len; ++i) {
                        if ($scope.search.dspAgentList[i].name === defaultName) {
                            $scope.search.dspAgent = $scope.search.dspAgentList[i];
                            break;
                        }
                    }
                }
            });
        }
        if ($scope.search.dspAgent === null) {
            $scope.search.dspAgent = {
                "id": "",
                "name": "全部"
            };
        }
    };

    //将当前搜索内容缓存
    function setSearchSessionStorage() {
        var store = {
            "pageType": $scope.data.pageType,
            "start": pageInfo.start,
            "limit": pageInfo.limit,
            "sort": $scope.data.sortKey,
            "dir": $scope.data.sortDir,
            "nameId": $scope.search.inputAdvertiser,
        };
        //创意管理
        if ($scope.data.pageType === 3) {
            store["category"] = $scope.search.category;
            store["dspAgent"] = $scope.search.dspAgent;
            store["mediaType"] = $scope.search.mediaType;
            store["title"] = $scope.search.inputTitle;
        }
        //易效NEX查询
        else {
            store["industry"] = $scope.search.industry;
            store["subIndustry"] = $scope.search.subIndustry;
            //易效
            if ($scope.data.pageType === 1) {
                store["channel"] = $scope.search.channel;
            }
            //NEX
            if ($scope.data.pageType === 2) {
                store["dspId"] = $scope.search.dsp;
            }
        }
        window.sessionStorage.setItem("ideaSearchStore", JSON.stringify(store));
    };

    //取出上一次缓存搜索内容
    function getSearchSessionStorage(store) {
        pageInfo.start = store["start"];
        pageInfo.limit = store["limit"];
        $scope.data.sortKey = store["sort"];
        $scope.data.sortDir = store["dir"];
        $scope.search.inputAdvertiser = store["nameId"];
        //创意管理
        if ($scope.data.pageType === 3) {
            $scope.search.category = store["category"];
            $scope.search.dspAgent = store["dspAgent"];
            $scope.search.mediaType = store["mediaType"];
            $scope.search.inputTitle = store["title"];
            $scope.search.inputCreateId = store["id"];
            //获取dpsAgent列表
            getDspAgent($scope.search.category.id, $scope.search.dspAgent.name);
            //设置产品线默认选中值
            for (var i = 0, len = $scope.search.categoryList.length; i < len; ++i) {
                if (store["category"].name === $scope.search.categoryList[i].name) {
                    $scope.search.category = $scope.search.categoryList[i];
                    break;
                }
            }
            //设置展现形式默认选中值
            for (var i = 0, len = $scope.search.mediaTypeList.length; i < len; ++i) {
                if (store["mediaType"].name === $scope.search.mediaTypeList[i].name) {
                    $scope.search.mediaType = $scope.search.mediaTypeList[i];
                    break;
                }
            }
        }
        //易效NEX查询
        else {
            $scope.search.industry = store["industry"];
            $scope.search.subIndustry = store["subIndustry"];
            //获取一级行业列表
            getIndustry("", $scope.search.industry.name);
            //获取二级行业列表
            getIndustry($scope.search.industry.id, $scope.search.subIndustry.name);
            //易效
            if ($scope.data.pageType === 1) {
                //设置渠道默认选中值
                for (var i = 0, len = $scope.search.channelList.length; i < len; ++i) {
                    if (store["channel"].name === $scope.search.channelList[i].name) {
                        $scope.search.channel = $scope.search.channelList[i];
                        break;
                    }
                }
            };
            //NEX
            if ($scope.data.pageType === 2) {
                getDspList(store["dspId"].name);
            };
        }
    };

    //设置查询条件参数 pageFlag=>true页面从0计算
    function setSearchParams(pageFlag) {
        var params = {};
        //分页起始页重置
        if (pageFlag === true) {
            //add   fenye
            //pageInfo.start = 0;
            pageInfo.start = 1;
        }
        params["start"] = pageInfo.start;
        params["limit"] = pageInfo.limit;
        params["sort"] = $scope.data.sortKey;
        params["dir"] = $scope.data.sortDir;
        params["nameId"] = $scope.search.inputAdvertiser;
        //管理查询
        if ($scope.data.pageType === 3) {
            params["category"] = $scope.search.category.id;
            params["dspAgentId"] = $scope.search.dspAgent.id;
            params["type"] = $scope.search.mediaType.id;
            params["dspIdeaId"] = $scope.search.inputCreateId;
            params["title"] = $scope.search.inputTitle;
        }
        //易效NEX查询
        else {
            params["industry"] = $scope.search.industry.id;
            params["subIndustry"] = $scope.search.subIndustry.id;
            //易效
            if ($scope.data.pageType === 1) {
                params["channel"] = $scope.search.channel.id;
            }
            //NEX
            if ($scope.data.pageType === 2) {
                params["dspId"] = $scope.search.dsp.id;
            }
        }
        return params;
    };

    /*  * * * * * * * * * * * PART 3 数据列表 * * * * * * *
     *  $scope.listX  列表数据
     *
     *  listY         易效
     *  listN         NEX
     *  listM         创意管理
     *
     */
    $scope.listY = [];
    $scope.listN = [];
    $scope.listM = [];

    function getDataList(params) {
        //查询参数
        switch ($scope.data.pageType) {
            case 1:
                http("idea_p4pList", {
                    data: params
                }, function (msg) {
                    $scope.data.role = msg.role;
                    $scope.data.total = msg.total || 0;
                    $scope.data.userStatus = msg.userStatus;
                    $scope.listY = msg.list;
                    //重置勾选框
                    $scope.data.btnDisable = true;
                    $scope.data.checked = false;
                    $scope.data.checkedCount = 0;
                    //添加勾选属性
                    $scope.listY.forEach(function (curNode) {
                        curNode["checked"] = false;
                    });
                    //发送分页数据
                    pageInfo.total = msg.list.length;
                    sendPageInfo();
                });
                break;
            case 2:
                http("nexAuditList", {
                    data: params
                }, function (msg) {
                    $scope.data.role = msg.role;
                    $scope.data.total = msg.total || 0;
                    $scope.data.userStatus = msg.userStatus;
                    $scope.listN = msg.list;
                    //重置勾选框
                    $scope.data.btnDisable = true;
                    $scope.data.checked = false;
                    $scope.data.checkedCount = 0;
                    //添加勾选属性
                    $scope.listN.forEach(function (curNode) {
                        curNode["checked"] = false;
                    });
                    //发送分页数据
                    pageInfo.total = msg.list.length;
                    sendPageInfo();
                });
                break;
            case 3:
                http("managerList", {
                    data: params
                }, function (msg) {
                    $scope.data.total = msg.total || 0;
                    $scope.listM = msg.ideas;
                    //materials字段为字符串数组 将其转换为数组
                    $scope.listM.forEach(function (curNode) {
                        curNode.materials = curNode.material.split(",");
                    });
                    //发送分页数据
                    pageInfo.total = msg.ideas.length;
                    sendPageInfo();
                });
                break;
            default:
                return null;
        }
    };

    //全选按键操作
    function checkedAll() {
        $scope.data.checked = !$scope.data.checked;
        //易效
        if ($scope.data.pageType === 1) {
            $scope.listY.forEach(function (curNode) {
                curNode.checked = $scope.data.checked;
            })
        }
        //NEX
        else if ($scope.data.pageType === 2) {
            $scope.listN.forEach(function (curNode) {
                curNode.checked = $scope.data.checked;
            })
        }
        //chuangyi
        else if ($scope.data.pageType === 3) {
            $scope.listN.forEach(function (curNode) {
                curNode.checked = $scope.data.checked;
            })
        }
        $scope.data.checkedCount = $scope.data.checked ? pageInfo.total : 0;
        lookCheckedCount();
    };

    //点击单个 若为取消勾选则取消全选勾选
    function clickChecked(node) {
        node.checked = !node.checked;
        //累计-1
        if (!node.checked) {
            $scope.data.checkedCount--;
        }
        //累计+1
        else {
            $scope.data.checkedCount++;
        }
        lookCheckedCount();
    };

    function lookCheckedCount() {
        //无勾选状态
        if ($scope.data.checkedCount <= 0) {
            $scope.data.checkedCount = 0;
            $scope.data.btnDisable = true;
        }
        //有勾选批量按键可用
        else if ($scope.data.checkedCount > 0 && $scope.data.checkedCount < pageInfo.total) {
            //取消勾线全选按键
            $scope.data.checked = false;
            $scope.data.btnDisable = false;
        }
        //全选状态
        else if ($scope.data.checkedCount >= pageInfo.total) {
            $scope.data.checkedCount = pageInfo.total;
            //若全部勾选则勾选全选按键
            $scope.data.btnDisable = false;
            $scope.data.checked = true;
        }
    };

    function getCheckedList(id) {
        var idList = [];
        //指定id
        if (id) {
            idList.push(id);
        }
        //没有指定id 查找批处理勾选框
        else {
            //易效
            if ($scope.data.pageType === 1) {
                $scope.listY.forEach(function (curNode) {
                    if (curNode.checked)
                        idList.push(curNode.id);
                })
            }
            //NEX
            else if ($scope.data.pageType === 2) {
                $scope.listN.forEach(function (curNode) {
                    if (curNode.checked)
                        idList.push(curNode.id);
                })
            }
        }
        return idList;
    };

    //一键通过提交函数
    function passAll() {
        var params = {
            "ids": getCheckedList(),
            "status": 1
        }
        popAlertShow(1, "", "数据处理中,请稍等");
        $scope.popLoading = true;

        http("subAuditAds", {
            data: params
        }, function (msg) {
            //数据处理中弹窗最少显示0.5秒,防止闪烁情况
            $timeout(function () {
                //关闭弹窗
                $scope.popAlert.show = false;
                $scope.popLoading = false;
                //成功后重新获取列表
                getDataList(setSearchParams());
            }, 500)
        });
    };


    /*  * * * * * * * * * * * PART 4 分页通信 * * * * * * *
     *  var pageInfo   分页信息
     *
     *  start          页面开始点
     *  limit          页面条数限制
     *  total          当前页面总条数
     *
     */
    var pageInfo = {
        start: 1,
        total: 0,
        limit: 10,
    };

    //监听分页请求 msg.start / limit
    function listenPageInfo() {
        $scope.$on("getPageInfo", function (event, msg) {
            pageInfo.start = msg.start;
            pageInfo.limit = msg.limit;
            getDataList(setSearchParams());
        })
    };
    //重新计算分页请求
    function sendPageInfo() {
        var params = {
            start: parseInt(pageInfo.start),
            total: parseInt($scope.data.total),
            length: parseInt(pageInfo.total)
        }
        $scope.$broadcast("setPageInfo", params);
    };

    /*  * * * * * * * * * * * PART 5 事件绑定 * * * * * * *
     *  $scope.event    事件绑定列表
     *
     *  search          点击查询按键
     *  changeIndustry  切换行业
     *  changeCategory  切换产品线
     *  sort            点击排序方式
     *  checkAll        全选勾选框点击事件
     *  check           单个勾选框点击事件
     *  passAll         点击一键通过按键
     *  audit           点击开始审核/或点击a标签开始审核
     *  showImgDetail   查看图片浮窗
     *
     */
    $scope.event = {
        search: function () {
            if (!inputLengthCheck($scope.search.inputAdvertiser, "inputWarning", 42, "最多为42个字符")) return;
            //创意管理中需要在检查 创意ID & 创意标题输入框
            if ($scope.data.pageType === 3) {
                if (!inputLengthCheck($scope.search.inputTitle, "inputWarningTitle", 44, "最多为44个字符")) return;
                if (!inputLengthCheck($scope.search.inputCreateId, "inputWarningId", 20, "最多为20个字符")) return;
            }
            //缓存查询条件
            setSearchSessionStorage();
            //获取列表内容
            getDataList(setSearchParams(true));
        },
        //选择一级行业联动二级行业
        changeIndustry: function (id) {
            // 选择全部一级行业
            if (id == "") {
                $scope.search.subIndustryList = [{
                    id: "",
                    name: "全部二级行业"
                }];
                $scope.search.subIndustry = {
                    id: "",
                    name: "全部二级行业"
                }
            }
            // 选择具体一级行业 二级行业联动
            else {
                getIndustry(id);
            }
        },
        //更换产品线 修改代理商/DSP列表
        changeCategory: function (id) {
            getDspAgent(id);
        },
        //改变排序方式
        sort: function (key) {
            if ($scope.data.sortDir === "") $scope.data.sortDir = "DESC";
            else if ($scope.data.sortDir === "DESC") $scope.data.sortDir = "ASC";
            else if ($scope.data.sortDir === "ASC") $scope.data.sortDir = "DESC";
            $scope.data.sortKey = key;
            getDataList(setSearchParams(true));
        },
        checkAll: function () {
            checkedAll();
        },
        check: function (node) {
            clickChecked(node);
        },
        //一键通过
        passAll: function () {
            if ($scope.data.btnDisable === true) return;
            popAlertShow(2, "一键通过", '此操作会将所选广告主待审创意的状态全部设置为"已通过",您确认进行此操作?');
        },
        //主键id = ""/正整数 category (1yixiao/2nex) 当前页面类型type(1yixiao/2nex/3manage)
        //advertiserId广告主id disable=true时不可用 ideaId创意id
        audit: function (id, category, type, advertiserId, disable, ideaId, dspIdeaId) {
            if (disable) return;
            //创意管理列表中 type值为字符创易效/NEX
            if (category === "易效")
                category = 1;
            if (typeof category == 'string' && category.toUpperCase() === "NEX")
                category = 2;
            var params = {
                id: id,
                category: category,
                type: type,
                advertiserId: advertiserId,
                dspIdeaId: dspIdeaId,
                //创意管理审核时制定创意id
                ideaId: ideaId ? ideaId : "",
            };
            $state.go("creativity-aduit", {
                msg: params
            });
        },
        showImgDetail: function (type, materials) {
            showImgDetail(type, materials);

        },
        //弹窗中点击确认
        popAlertConfirm: function () {
            passAll();
        },
        inputLengthCheck: function (value, warningKey, maxLength, tips) {
            inputLengthCheck(value, warningKey, maxLength, tips);
        }
    };

    /*  * * * * * * * * * * * PART 7 显示图弹窗 * * * * *
     *  $scope.popImg  大图弹窗
     *
     *  show           弹窗是否显示
     *  type           类型(1三图2GIF3视频)
     *  materials      资源url数组
     *
     */
    $scope.popImg = {
        show: false,
        type: 0,
        materials: []
    };

    function showImgDetail(type, materials) {
        $scope.popImg.show = true;
        $scope.popImg.type = type;
        $scope.popImg.materials = materials;
        //点击信息流-视频-查看详情时动态添加video标签
        var $vedios = '<video controls="controls" src="' + $scope.popImg.materials[1] + '"></video>';
        $(".img-style-vedio").append($vedios);
    }


    /*  * * * * * * * * * * * PART 8 提示弹窗 * * * * * * *
     *  $scope.popAlert
     *
     *  show            是否显示弹窗
     *  type            提示窗类型1(文字居中 无button) 2(文字左对齐 双button) 3(文字居中 双button)
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

    $scope.trustSrc = function (url) {
        return $sce.trustAsResourceUrl(url);
    };

    init();
})

/*  End
 *
 *
 *
 *
 *
 *
 *
 * Controller 审核
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *  Start
 */
.controller('omp-creativity-auditCtrl', function ($scope, $state, $stateParams, $sce, http, tools) {

    function init() {
        //监听分页请求
        listenPageInfo();
        //判断当前页是否为刷新 如果是缓存页获取缓存信息
        if (!$stateParams.msg.type) {

            var store = getAuditSessionStorage();
            if (store) {
                if (store.stateParamsMsg.type == 3) { //创意管理明细界面
                    store.stateParamsMsg.id = store.stateParamsMsg.advertiserId
                }
                //设置为上一次路由信息 及 搜索信息
                $stateParams.msg = store.stateParamsMsg;
                $scope.search.inputCreateId = store.searchParams.ideaId;
                $scope.search.inputTitle = store.searchParams.title;
                pageInfo.start = store.searchParams.start;
                pageInfo.limit = store.searchParams.limit;
                for (var i = 0, len = $scope.search.stateList.length; i < len; ++i) {
                    if (store.searchParams.status === $scope.search.stateList[i].id) {
                        $scope.search.state = $scope.search.stateList[i];
                        break;
                    }
                }
            }
        }

        //设置页面信息
        setPageInfo();
        //获取广告主基本信息
        getAdvertiseInfo();
    };

    /*  * * * * * * * * * * * PART 1 页面基本信息 * * * * * * *
     *  $scope.data  事件绑定列表
     *
     *  pageCategory    资质类型(1易效 2NEX)
     *  pageNav         页面导航(1易效 2NEX 3创意管理)
     *  pageTitle       页面导航标题(1易效 2NEX 3创意管理)
     *
     *  id              广告主id
     *  name            广告主名称
     *  url             链接
     *  industryDetail  行业
     *  dspChannel      dsp/代理商
     *  batchReasonId   批量处理时拒绝原因id,取列表第一项值
     *
     *  advertiserList  广告主资质列表
     *  requireList     必备资质列表
     *  otherList       其他资质列表
     *  ideaList        创意资质列表
     *
     *  checked         全选按键
     *  checkedCount    当前勾选累计 0-pageInfo.length
     *  btnDisable      全部通过/拒绝按键是否可用
     *
     *  inputWarningTitle   创意标题错误提示
     *  inputWarningId      创意Id错误提示
     *
     */
    $scope.data = {
        infoType: 1,
        pageNav: "",
        id: "",
        name: "",
        url: "",
        industryDetail: "",
        dspChannel: "",
        batchReasonId: 1,
        checked: false,
        checkedCount: 0,
        btnDisable: true,
        advertiserList: [],
        requireList: [],
        otherList: [],
        ideaList: [],
        inputWarningTitle: "",
        inputWarningId: "",
        version: "",
    };

    //设置页面基本信息
    function setPageInfo() {
        $scope.showTurnRight = true;
        switch ($stateParams.msg.type) {
            case 1:
                $scope.data.pageTitle = "易效创意待审列表";
                $scope.data.pageNav = "creativity-yixiao";
                $scope.showTurnRight = true;
                break;
            case 2:
                $scope.data.pageTitle = "NEX创意待审列表";
                $scope.data.pageNav = "creativity-nex";
                $scope.showTurnRight = true;
                break;
            case 3:
                $scope.data.pageTitle = "创意管理";
                $scope.data.pageNav = "creativity-manage";
                //创意管理搜索框填写选中的id
                $scope.search.inputCreateId = $stateParams.msg.dspIdeaId;
                //创意管理状态栏没有待审核状态
                $scope.search.stateList.splice(1, 1);
                $scope.showTurnRight = false;
                break;
            default:
                break;
        }
        $scope.data.pageCategory = $stateParams.msg.category;
    };

    //从$stateParams获取当前页基本信息 // random === true 随机获取
    function getAdvertiseInfo(random) {
        var params = {
            "category": $stateParams.msg.category,
            "id": random === true ? "" : $stateParams.msg.id
        };
        http("ideaStartAudit", {
            data: params
        }, function (msg) {
            //请求失败
            if (msg.rs === 2) {
                popErrorShow(msg.info);
            }
            //没有数据
            else if (msg.rs === 3) {
                $state.go($scope.data.pageNav);
            }
            //请求成功
            else {
                //设置搜索栏缓存参数
                var searchParams = setSearchParams();
                //获取创意列表
                searchParams.dspAdvertiserId = msg.id;
                searchParams.advertiserId = msg.advertiserId;
                //设置缓存信息
                setAuditSessionStorage(searchParams, $stateParams.msg);
                //设置广告主基本信息
                setAdvertiseInfo(msg);
                getDataList(searchParams);
            }
        });
    };

    //设置广告主基本信息
    function setAdvertiseInfo(data) {
        $scope.data.id = data.id;
        $scope.data.advertiserId = data.advertiserId;
        $scope.data.name = data.name;
        $scope.data.url = data.url;
        $scope.data.version = data.version;
        $scope.data.industryDetail = data.industryDetail;
        $scope.data.dspAgent = $stateParams.msg.category === 1 ? data.channelStr : data.dspName;
        $scope.data.role = data.role; //角色
        //易效 设置必备资质/其他资质/创意资质
        if ($scope.data.pageCategory === 1) {
            $scope.data.requireList = data["required-credentials"];
            $scope.data.otherList = data["other-credentials"];
            $scope.data.ideaList = data["idea-credentials"];
            //设置必备资质弹窗基本信息
            setPopCredential();
        }
        //NEX 设置全部资质/创意资质
        else if ($scope.data.pageCategory === 2) {
            $scope.data.advertiserList = data["required-credentials"].concat(data["other-credentials"]);
            $scope.data.ideaList = data["idea-credentials"];
        }
    };

    //随机获取下一个广告主
    function getNextAdvertiserAudit() {
        getAdvertiseInfo(true);
    };

    /*  * * * * * * * * * * * PART 2 页面搜索 * * * * * * *
     *  $scope.search     页面搜索部分
     *
     *  state             审核状态
     *  stateList         待审核状态
     *  inputCreateId     查询创意ID
     *  inputTitle        查询创意标题
     *
     */
    $scope.search = {
        state: {
            id: "",
            name: "全部"
        },
        stateList: [{
            id: "",
            name: "全部"
        }, {
            id: 1,
            name: "通过"
        }, {
            id: 2,
            name: "拒绝"
        }],
        inputTitle: "",
        inputCreateId: ""
    };

    //长度验证
    function inputLengthCheck(value, warningKey, maxLength, tips) {
        //长度验证不通过
        if (tools.getCharLength(value) > parseInt(maxLength)) {
            $scope.data[warningKey] = tips;
            return false;
        }
        //长度验证通过
        else {
            $scope.data[warningKey] = "";
            return true;
        }
    };

    //获取参数 pageFlag ==> true时 分页起始值0/id为空
    function setSearchParams(pageFlag) {
        var params = {
            "advertiserId": $stateParams.msg.advertiserId,
            "dspIdeaId": $scope.search.inputCreateId,
            "title": $scope.search.inputTitle,
            "start": pageInfo.start,
            "limit": pageInfo.limit,
            "status": $scope.search.state.id,
        };
        if (pageFlag === true) {
            pageInfo.start = 0;
            params["id"] = "";
            params["start"] = 0;
        };
        //创意审核列表下钻参数
        if ($stateParams.msg.type === 3) {
            if ($stateParams.msg.id != "") {
                params["id"] = $stateParams.msg.ideaId;
                params["dspIdeaId"] = $stateParams.msg.dspIdeaId;
            }
            //下钻进入之后再次查询则不指定创意主键id
            $stateParams.msg.id = "";
        }
        return params;
    };

    function setSearchParamsForManger(pageFlag) {
        var params = {
            "advertiserId": $stateParams.msg.advertiserId,
            "dspIdeaId": $scope.search.inputCreateId,
            "title": $scope.search.inputTitle,
            "start": pageInfo.start,
            "limit": pageInfo.limit,
            "status": $scope.search.state.id,
        };
        if (pageFlag === true) {
            pageInfo.start = 0;
            params["id"] = "";
            params["start"] = 0;
        };
        return params;
    };

    /*  * * * * * * * * * * * PART 3 事件绑定 * * * * * * *
     *  $scope.event     页面事件
     *
     *  link
     *  search           点击查询
     *  popClose         错误原因弹窗关闭
     *  popShow          错误原因弹窗打开
     *  popSubmit        错误原因提交
     *  submitPass       批量处理通过按键
     *  showImgDetail    显示弹窗细节
     *
     */
    var __imgPath = './css/_images/compressed-files-icon.png';

    $scope.event = {
            materialDownload: function () {
                if ($scope.popCredential.material === __imgPath) {
                    window.open($scope.popCredential.__material, '_blank');
                }
            },
            link: function () {
                //告诉上一级页面,从缓存中获取查询条件
                var params = {
                    type: $stateParams.msg.type,
                    reload: true
                };
                $state.go($scope.data.pageNav, {
                    "msg": params
                });
            },
            search: function (advertiserId) {
                if (inputLengthCheck($scope.search.inputTitle, 'inputWarningTitle', 44, '最多为44个字符') !== true) return;
                if (inputLengthCheck($scope.search.inputCreateId, 'inputWarningId', 20, '最多为20个字符') !== true) return;
                //设置搜索栏缓存参数
                var searchParams = setSearchParamsForManger(true);
                if (advertiserId) searchParams.advertiserId = advertiserId;
                //设置缓存信息
                setAuditSessionStorage(searchParams, $stateParams.msg);
                getDataList(searchParams);
            },
            //全选操作
            checkedAll: function () {
                checkedAll();
            },
            //勾选某一个按键操作
            checked: function (node) {
                clickChecked(node);
            },
            //关闭拒绝原因弹窗
            popClose: function () {
                popClose();
            },
            //打开拒绝原因弹窗
            popShow: function (id) {
                popShow(id);
            },
            //包含错误原因提交
            popSubmit: function () {
                var params = popSubmit();
                //弹窗返回false没有通过验证
                if (params === false) return;
                submitAudit(params);
            },
            //通过提交
            submitPass: function (id, advertiserId) {
                if ($scope.data.btnDisable === true && !id)
                    return;

                var ids = getCheckedList(id, true);
                var map = {};
                for (var key in ids) {
                    map[ids[key]] = _.find($scope.list, {
                        id: ids[key]
                    }).version;
                }
                var params = {
                    "idVersionMap": map, //传递的时候传递带版本信息的ids
                    "status": 1,
                    "reasonIds": "",
                    "reason": "",
                    "advertiserId": advertiserId,
                };
                submitAudit(params);
            },
            //点击查看详细信息弹窗
            showImgDetail: function (type, materials) {
                showImgDetail(type, materials);
            },

            fixInputCnLength: function (value) {
                $scope.pop.inputCharLength = tools.getCharLength(value);
            },
            //显示资质图片
            showPopCredential: function (index) {
                showPopCredential(index);
            },
            //查看前一张资质图片
            prevPopCredential: function () {
                prevPopCredential();
            },
            //查看后一张资质图片
            nextPopCredential: function () {
                nextPopCredential();
            },
            //输入text长度校验
            inputLengthCheck: function (value, warningKey, maxLength, tips) {
                inputLengthCheck(value, warningKey, maxLength, tips);
            },
            //随机获取下一个广告主
            getNextAdvertiserAudit: function () {
                getNextAdvertiserAudit();
            },
            //点击查看资质内容
            lookupCredentials: function (type) {
                lookupCredentials(type);
            },
            //错误弹窗 点击关闭
            popErrorClose: function () {
                $state.go($scope.data.pageNav);
            },
            //错误弹窗 点击关闭
            popBatchOperationClose: function () {
                document.getElementById("popBatchOperationId").style.display = "none";
                var searchParams = setSearchParams();
                getDataList(searchParams);

            }
        }
        /*  * * * * * * * * * * * PART 4 分页通信 * * * * * * *
         *  var pageInfo   分页信息
         *
         *  start          页面开始点
         *  limit          页面条数限制
         *  length         当前页面总条数
         *  total          所有页面总条数
         *
         */
    var pageInfo = {
        //add fenye
        start: 1,
        total: 0,
        length: 0,
        limit: 10,
    };


    //监听分页请求 msg.start / limit
    function listenPageInfo() {
        $scope.$on("getPageInfo", function (event, msg) {
            pageInfo.start = msg.start;
            pageInfo.limit = msg.limit;
            getDataList(setSearchParams());
        })
    };

    //重新计算分页请求
    function sendPageInfo() {
        var params = {
            start: pageInfo.start,
            total: pageInfo.total,
            length: pageInfo.length
        }
        $scope.$broadcast("setPageInfo", params);
    };

    /*  * * * * * * * * * * * PART 5 创意列表 * * * * * * *
     *  $scope.list     创意列表数据
     *
     *
     *
     */
    $scope.list = [];

    //获取列表数据
    function getDataList(params) {
        //从创意管理页面进入审核时,通过ideaDetail获取参数
        if ($stateParams.msg.type === 3) {
            http("ideaDetail", {
                data: params
            }, function (msg) {
                $scope.list = msg.ideas;
                //初始化批量按键和勾选状态为不可用/不勾选
                $scope.data.btnDisable = true;
                $scope.data.checked = false;
                //遍历数据添加checked属性
                $scope.list.forEach(function (curNode) {
                    //设置默认不勾选
                    curNode.checked = false;
                    //materials字段为字符串数组 将其转换为数组
                    curNode.materials = curNode.material.split(",");
                });
                //设置批量处理时查询拒绝原因id = 27
                if ($scope.list.length > 0) {
                    $scope.data.batchReasonId = 27;
                }
                //更新分页数据
                pageInfo.total = msg.total;
                pageInfo.length = msg.ideas.length;
                sendPageInfo();
            })
        }
        //从NEX/创意页面进入审核时,通过adIdeaList获取列表信息
        else if ($stateParams.msg.type === 2 || $stateParams.msg.type === 1) {
            http("adIdeaList", {
                data: params
            }, function (msg) {
                $scope.list = msg.ideas;
                //初始化批量按键和勾选状态为不可用/不勾选
                $scope.data.btnDisable = true;
                $scope.data.checked = false;
                //遍历数据添加checked属性
                $scope.list.forEach(function (curNode) {
                    //设置默认不勾选
                    curNode.checked = false;
                    //materials字段为字符串数组 将其转换为数组
                    curNode.materials = curNode.material.split(",");
                });
                //设置批量处理时查询拒绝原因id = 27
                if ($scope.list.length > 0) {
                    $scope.data.batchReasonId = 27;
                }
                //更新分页数据
                pageInfo.total = msg.total;
                pageInfo.length = msg.ideas.length;
                sendPageInfo();
            });
        }
    };

    //全选按键操作
    function checkedAll() {
        $scope.data.checked = !$scope.data.checked;
        $scope.list.forEach(function (curNode) {
            curNode.checked = $scope.data.checked;
        })
        $scope.data.checkedCount = $scope.data.checked ? pageInfo.length : 0;
        lookCheckedCount();
    };

    //点击单个 若为取消勾选则取消全选勾选
    function clickChecked(node) {
        node.checked = !node.checked;
        //累计-1
        if (!node.checked) {
            $scope.data.checkedCount--;
        }
        //累计+1
        else {
            $scope.data.checkedCount++;
        }
        lookCheckedCount();
    };

    //检查当前勾选个数
    function lookCheckedCount() {
        //无勾选状态
        if ($scope.data.checkedCount <= 0) {
            $scope.data.checkedCount = 0;
            $scope.data.btnDisable = true;
            $scope.data.checked = false;
        }
        //有勾选批量按键可用
        else if ($scope.data.checkedCount > 0 && $scope.data.checkedCount < pageInfo.length) {
            //取消勾线全选按键
            $scope.data.checked = false;
            $scope.data.btnDisable = false;
        }
        //全选状态
        else if ($scope.data.checkedCount >= pageInfo.length) {
            $scope.data.checkedCount = pageInfo.length;
            //若全部勾选则勾选全选按键
            $scope.data.btnDisable = false;
            $scope.data.checked = true;
        }
    };

    //获取已经勾选id数组 doNotNeedPassStatus = true时代表不需要状态已经为通过的选项
    function getCheckedList(id, doNotNeedPassStatus) {
        var idList = [];
        //指定id
        if (id) {
            idList.push(id);
        }
        //没有指定id 查找批处理勾选框
        else {
            $scope.list.forEach(function (curNode) {
                if (curNode.checked === true) {
                    //需要doNotNeedPassStatus状态 则原状态必须为"通过"
                    if (curNode.statusStr === "待审核") {
                        idList.push(curNode.id);
                    }
                }
            });
        }
        return idList;
    };

    /*  * * * * * * * * * * * PART 6 拒绝原因弹窗 * * * * *
     *  $scope.pop    拒绝弹窗
     *
     *  show          弹窗是否显示
     *  input         其他原因输入框
     *  reasonList    拒绝原因列表(id/reason/checked)
     *  checkedIds    提交时ID列表
     */
    $scope.pop = {
        show: false,
        input: "",
        warning: "",
        reasonList: [],
        checkedIds: [],
        inputCharLength: 0,
    };

    //弹窗返回错误原因参数
    function popSubmit() {
        //长度大于200点击无效
        if ($scope.pop.inputCharLength > 200)
            return false;
        var ids = [];
        $scope.pop.reasonList.forEach(function (curNode) {
            if (curNode.checked) {
                ids.push(curNode.id);
            }
        });
        //没有勾选错误内容
        if (ids.length === 0 && $scope.pop.input === "") {
            $scope.pop.warning = "请选择或输入拒绝原因";
            return false;
        }
        $scope.pop.warning = "";
        //拒绝原因转化为字符串
        ids = ids.join(",");
        //关闭弹窗
        $scope.pop.inputCharLength = 0;
        $scope.pop.show = false;
        //key  和数据版本对应
        var map = {};
        var keys = $scope.pop.checkedIds;
        for (var key in keys) {
            map[keys[key]] = _.find($scope.list, {
                id: keys[key]
            }).version
        }
        return {
            "idVersionMap": map,
            "reasonIds": ids,
            "status": 2,
            "reason": $scope.pop.input,
            "advertiserId": $scope.data.advertiserId,
        };
    };

    //打开弹窗
    function popShow(id) {
        //清空上一次空原因列表 和 输入内容
        $scope.pop.reasonList = [];
        $scope.pop.input = "";
        //批量处理不可用 和 没有选中id时不做处理
        if ($scope.data.btnDisable === true && !id)
            return;
        //获取选中的id列表
        $scope.pop.checkedIds = getCheckedList(id);
        //显示弹窗
        $scope.pop.show = true;
        //获取原因列表 默认值为27
        var params = {
            id: $scope.data.batchReasonId
        };
        http("getReasonList", {
            data: params
        }, function (msg) {
            //获取拒绝原因列表为空
            if (msg.rs === 2) return;
            //
            $scope.pop.reasonList = msg.reasons;
            //设置勾选框
            $scope.pop.reasonList.forEach(function (curNode) {
                curNode.checked = false;
            });
        })
    };

    //关闭弹窗
    function popClose() {
        $scope.pop.show = false;
        $scope.pop.input = "";
        $scope.pop.inputCharLength = 0;
    };
    $scope.popBatchOperation = {
        show: false,
        type: -1,
        content: ""
    };

    //提交错误/通过原因
    function submitAudit(params) {
        console.log(params);
        http("subAuditIdeas", {
            data: params
        }, function (msg) {
            //提交失败
            if (msg.rs === 2) {
                popErrorShow(msg.info);
            } else if (msg.rs === 3) {
                $scope.popBatchOperation.show = true;
                $scope.popBatchOperation.content = msg.info;
            }
            //提交成功
            else {
                var searchParams = setSearchParams();
                if (params.advertiserId) {
                    searchParams.advertiserId = params.advertiserId;
                }
                getDataList(searchParams);
            }
        });
    };

    /*  * * * * * * * * * * * PART 7 显示图弹窗 * * * * *
     *  $scope.popImg  大图弹窗
     *
     *  show           弹窗是否显示
     *  type           类型(1三图2GIF3视频)
     *  materials      资源url数组
     *
     */
    $scope.popImg = {
        show: false,
        type: 0,
        materials: []
    };

    function showImgDetail(type, materials) {
        $scope.popImg.show = true;
        $scope.popImg.type = type;
        $scope.popImg.materials = materials;
    };

    /*  * * * * * * * * * * * PART 8 查看必备资质弹窗 * * * * *
     *  $scope.popCredential  大图弹窗
     *
     *  show                  弹窗是否显示
     *  index                 当前显示序号(从0开始计算)
     *  from/to               序号范围
     *  material              显示资质图片资源
     *
     */
    $scope.popCredential = {
        show: false,
        index: -1,
        from: "",
        to: "",
        material: ""
    };

    //初始化资质弹窗from/to值
    function setPopCredential() {
        $scope.popCredential.from = $scope.data.requireList.length - 1;
        //保证有必备资质资源数组
        if ($scope.popCredential.from > 0) {
            $scope.popCredential.to = 0;
        }
    };
    //打开弹窗
    function showPopCredential(index) {
        $scope.popCredential.index = index;
        $scope.popCredential.material = tools["isImg"]($scope.data.requireList[index].url[0]) ? $scope.data.requireList[index].url[0] : __imgPath;
        $scope.popCredential.__material = $scope.data.requireList[index].url[0];
        $scope.popCredential.show = true;
    };

    //查看前一个弹窗
    function prevPopCredential() {
        if ($scope.popCredential.index > $scope.popCredential.to) {
            $scope.popCredential.index--;
            $scope.popCredential.material = tools["isImg"]($scope.data.requireList[index].url[0]) ? $scope.data.requireList[index].url[0] : __imgPath;
            $scope.popCredential.__material = $scope.data.requireList[index].url[0];

        }
    };

    //查看后一个弹窗
    function nextPopCredential() {
        if ($scope.popCredential.index < $scope.popCredential.from) {
            $scope.popCredential.index++;
            $scope.popCredential.material = tools["isImg"]($scope.data.requireList[index].url[0]) ? $scope.data.requireList[index].url[0] : __imgPath;
            $scope.popCredential.__material = $scope.data.requireList[index].url[0];

        }
    };

    /*  * * * * * * * * * * * PART 9 弹窗查看创意/其他资质 * * * * *
     *
     *
     */
    function lookupCredentials(type) {
        var storage = {};
        //查看创意资质
        if (type === "idea") {
            storage["type"] = "idea";
            storage["list"] = $scope.data.ideaList;
        }
        //查看其他资质
        else if (type === "other") {
            storage["type"] = "other";
            storage["list"] = $scope.data.otherList;
        }
        //查看广告主资质
        else if (type === "advertiser") {
            storage["type"] = "advertiser";
            storage["list"] = $scope.data.advertiserList;
        }
        window.localStorage.removeItem("lookupCredentials");
        window.localStorage.setItem("lookupCredentials", JSON.stringify(storage));
        var handle = window.open("./omp-credentials.html");
    };

    /*  * * * * * * * * * * * PART 10 错误弹窗 * * * * * * *
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

    function popErrorShow(content) {
        //清理缓存 避免当前情况下刷新问题
        window.sessionStorage.removeItem("ideaAuditAdvertiserAndSearchInfo");
        $scope.popError.content = content;
        $scope.popError.show = true;
    };

    /*  * * * * * * * * * * * PART 11 刷新缓存 * * * * * * *
     *
     */
    function setAuditSessionStorage(searchParams, stateParamsMsg) {
        var store = {
            "searchParams": searchParams,
            "stateParamsMsg": stateParamsMsg
        };
        window.sessionStorage.setItem("ideaAuditAdvertiserAndSearchInfo", JSON.stringify(store));
    };

    function getAuditSessionStorage() {
        var store = window.sessionStorage.getItem("ideaAuditAdvertiserAndSearchInfo");
        return JSON.parse(store);
    };
    if ($stateParams.msg.type == "2") {
        $scope.search.state = $scope.search.stateList[1];
    }
    init();

});