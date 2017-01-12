/*
 *  Module 主模块
 *
 *  Controller 定义
 */
angular.module('omp.ctrl', [])

    /*  End
     *
     *  Controller Menu
     *
     *  Start
     */

    .controller('omp-ctrl-menu', function($scope, $state, $timeout, http) {

        /*
         *  $scope.menusTree 导航栏信息树
         *
         *  id               当前id名
         *  name             名称
         *  pid              父节点id
         *  state            路由状态 null/具体路由
         *  expand           是否展开 true/false
         *  [url]            icon图片地址
         *  tree             数组结构,记录二级路由,节点内容同此结构
         */
        $scope.menusTree = [];

        //记录上一次点击节点的序号
        var last = {
            index: "",
            parentIndex: "",
        };

        $scope.event = {
            toggle: function (node, index, parentIndex) {
                //展开当前菜单，收起其它菜单
                if (node.pid == 0) {
                    $(".omp-menu-sup > ul").height(0);                    

                    if (node.expand === true) {
                        $(".omp-menu-sup > ul").eq(index).height(0);
                    }
                    //展开
                    else {
                        $(".omp-menu-sup > ul").eq(index).height(node.tree.length * 50);
                    }
                    node.expand = !node.expand;

                    $scope.menusTree.forEach(function (v) {
                        if (v.id !== node.id) { 
                            v.expand = false;
                        }
                    })

                    //跳转
                    if (node.state !== "") {                   
                        $("div.omp-menu-content > ul").eq(last.parentIndex).find("ul.omp-menu-sub > li").eq(last.index).removeClass('omp-menu-click-bg');                    
                        $state.go(node.state);
                    }
                    setSessionExpandInfo(0, node, index, parentIndex);
                }
                //二级菜单处理
                else {
                    $(".omp-menu-sup > ul").each(function(iterIndex) {
                        //查看此节点的父节点 不同父节点元素收回
                        if (iterIndex != parentIndex && $scope.menusTree[iterIndex].expand === true) {
                           /* $(".omp-menu-sup > p > a i").eq(iterIndex).toggleClass('omp-menu-arrow-rotate');*/
                            $scope.menusTree[iterIndex].expand = false;
                            $(this).height(0);
                        }
                    });
                    //上一次点击取消背景图
                    $("div.omp-menu-content > ul").eq(last.parentIndex).find("ul.omp-menu-sub > li").eq(last.index).removeClass('omp-menu-click-bg');
                    //点击后添加背景图
                    $("div.omp-menu-content > ul").eq(parentIndex).find("ul.omp-menu-sub > li").eq(index).addClass('omp-menu-click-bg');
                    //记录上一次点击位置
                    last = {
                        "index": index,
                        "parentIndex": parentIndex
                    };
                    //记录展开状态
                    setSessionExpandInfo(1, node, index, parentIndex);
                    //路由状态切换
                    $state.go(node.state, { "msg": { "reload": false } });
                }
            }
        };

        //获取菜单树 构建树结构menusTree
        function getMenusTree() {

            var menusTreeRet = null;
            //有缓存从缓存取
            if (menusTreeRet) {
                $scope.menusTree = menusTreeRet;
                $timeout(function() {
                    getSessionExpandInfo();
                });
            }
            //没有缓存进行http请求
            else {
                http("getMenus", {}, function(msg) {
                	if(msg.menus != null){
                		for (var i = 0, len1 = msg.menus.length; i < len1; ++i) {
                            //插入树根节点
                            var node = msg.menus[i];
                            node.tree = [];
                            if (node.pid === 0) {
                                node.expand = false;
                                node.ngStyle = { "background": "url(" + node.icon + ") no-repeat left center" };
                                $scope.menusTree.push(node);
                            }
                            //寻找父节点
                            else {
                                for (var j = 0, len2 = $scope.menusTree.length; j < len2; ++j) {
                                    if (node.pid === $scope.menusTree[j].id) {
                                        $scope.menusTree[j].tree.push(node);
                                        break;
                                    }
                                }
                            }
                        } //for

                        if (!location.hash.trim()) {
                            setTimeout(function() {
                                var fIndex = _.findIndex($scope.menusTree, function(v) {
                                    return !!v.state || (v.tree && v.tree.length > 0)
                                });
                                if (fIndex >= 0) {
                                    if ($scope.menusTree[fIndex].tree && $scope.menusTree[fIndex].tree.length > 0) {
                                        $state.go($scope.menusTree[fIndex].tree[0].state, { "msg": { "reload": false } });
                                        $scope.event.toggle($scope.menusTree[fIndex], fIndex, 0);
                                        $scope.event.toggle($scope.menusTree[fIndex].tree[0], 0, fIndex);
                                    }
                                    else {
                                        $state.go($scope.menusTree[fIndex].state, { "msg": { "reload": false } });
                                        $scope.event.toggle($scope.menusTree[fIndex], fIndex, 0);
                                    }
                                }
                            }, 0);
                        }    

                        setSessionMenusTree();
                        window.sessionStorage.setItem("authorize_menus_list",JSON.stringify(msg.menus))
                	}
                })
            }
        };

        function getSessionExpandInfo() {
            var parent = JSON.parse(window.sessionStorage.getItem("parentMenuInfo"));
            var child = JSON.parse(window.sessionStorage.getItem("childMenuInfo"));
            //展开一级菜单
            if (parent) {
                /*$(".omp-menu-sup > p > a i").eq(parent.index).toggleClass('omp-menu-arrow-rotate');*/
                $(".omp-menu-sup > ul").eq(parent.index).height(parent.node.tree.length * 50);
                $scope.menusTree.forEach(function(cur) {
                    if (cur.id === parent.node.id) {
                        cur.expand = parent.node.expand;
                    }
                });
            }
            //选中二级菜单
            if (child) {
                $("div.omp-menu-content > ul").eq(child.parentIndex).find("ul.omp-menu-sub > li").eq(child.index).addClass('omp-menu-click-bg');
                last = {
                    "index": child.index,
                    "parentIndex": child.parentIndex
                };
            }
        };

        //缓存展开信息
        function setSessionExpandInfo(type, node, index, parentIndex) {
            var store = {
                "node": node,
                "index": index,
                "parentIndex": parentIndex,
            };
            if (type === 0) {
                window.sessionStorage.setItem("parentMenuInfo", JSON.stringify(store));
            }
            //
            else if (type === 1) {
                window.sessionStorage.setItem("childMenuInfo", JSON.stringify(store));
            }
        };
        //缓存menusTree
        function setSessionMenusTree() {
            window.sessionStorage.setItem("menusTree", JSON.stringify($scope.menusTree));

        };
        //获取缓存menusTree
        function getSessionMenusTree() {
            return JSON.parse(window.sessionStorage.getItem("menusTree"));
        };

        //init 初始化程序
        getMenusTree();
        //init End
    })

    /*  End
     *
     *  Controller Header
     *
     *  Start
     */

    .controller('omp-ctrl-header', function($rootScope, $scope, $state, http) {

        function init() {
            $scope.data.username = window.sessionStorage.getItem("username");
            http("userInfo", {}, function(msg) {
                $scope.data.username = msg.user.userName;
                window.sessionStorage.setItem("token", msg.user.token);                    
            });
        };
        /* scope数据绑定 */

        $scope.data = {
            username: ""
        }

        $scope.event = {
            //登出操作
            logout: function() {
                window.location.href = "./welcome.html";
                window.sessionStorage.clear();
                http("logout", {}, function(msg) {

                });
            }
        };
        //启动程序
        init();
    })

// window.localStorage.setItem("advertiser-yixiao",params);
//
