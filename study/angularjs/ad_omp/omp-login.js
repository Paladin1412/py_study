/*
 *
 *  Module
 *
 *  Login Module 
 *  
 */
angular.module('Omp', [])
    /*  
     *
     *  Controller omp-login-ctrl
     *
     *  Start
     */
    .controller('omp-login-ctrl', function($scope, http) {

        /* 私有变量定义 */

        warningText = {
            username: "请输入邮箱",
            password: "请输入密码",
            verifycodeNull: "请输入验证码",
            verifycodeErr: "验证码错误",
            submitErr: "用户名或密码错误"
        }

        /* $scope 数据绑定 */

        $scope.data = {
            warning: "",
        };

        /* $scope 事件绑定 */

        $scope.event = {
            submit: function(formInfo) {
            //add 取cookie里面的word  name
                var CookieUtil = {
                    get:function(name){
                        var cookieName = encodeURIComponent(name) + "=",
                            cookieStart = document.cookie.indexOf(cookieName),
                            cookieValue = null;

                        if(cookieStart>-1){
                            var cookieEnd = document.cookie.indexOf(";",cookieStart);
                            if(cookieEnd == -1){
                                cookieEnd = document.cookie.length;
                            }
                            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length,cookieEnd));
                        }
                        return cookieValue;
                    }
                }
                var name = CookieUtil.get("name");
                var word = CookieUtil.get("word") ;
                $(".omp-login-input1").value = name;
                $(".omp-login-input3").value = word;
            //end

                var result = beforeSubmitCheck(formInfo);

                if (result === true) {
                    submitForm(formInfo);
                }
                //表单验证不通过 
                else {
                    setWarningText(result);
                }
            },
            getVerifyCode: function() {
                getVerifyCode();
            },
        };
        /* 自定义函数 */

        //提交前验证表单
        function beforeSubmitCheck(formInfo) {
            if (formInfo.$valid === true) {
                return true;
            }
            //表单非空验证
            if (!formInfo.username) return warningText.username;
            if (!formInfo.password) return warningText.password;
            if (!formInfo.verifycode) return warningText.verifycodeNull;
            return "";
        };

        //提交表单数据
        function submitForm(formInfo) {
            var params = {
                "name": formInfo.username,
                "password": formInfo.password,
                "authCode": formInfo.verifycode
            };
            http("login", params, function(msg) {
                //登录成功
                if (msg.rs === 1) {
                    $scope.data.warning = "";
                    window.sessionStorage.setItem("username", params.name);
                    window.sessionStorage.setItem("token", params.token);                    
                    window.location.href = "./omp-app.html";
                }
                //登录失败
                else {
                    $scope.data.warning = msg.info;
                    getVerifyCode();
                }
            });

        };

        //设置表单验证失败错误信息
        function setWarningText(text) {
            $scope.data.warning = text;
        };

        //获取验证码
        function getVerifyCode() {
            //利用当前时间秒重新更新src值
            $("#authCode").attr('src', getRootPath() + "/user/getAuthCode?random=" + new Date().getTime());
        }
        /* 初始化自动运行 */
        getVerifyCode();

    })
    /*  End Controller
     *
     *  Service omp-login-service
     *
     *  Start
     */
    .service('http', function($http, $timeout, $location) {

        var env = "qa"; //mock / qa

        function processMock(key, params, callback) {
            //获取验证码
            if (key === "getAuthCode") {
                var result = "./css/_images/login-verifycode-sample.png";
                $timeout(function() {
                    callback(result);
                });
            }
            //登录 
            else if (key === "login") {
                var result = {}
                if (params["authCode"] !== "wdds") {
                    result = {
                        "rs": 2,
                        "info": "验证码错误"
                    }
                } else if (params["name"] !== "qwer") {
                    result = {
                        "rs": 2,
                        "info": "用户名密码错误",
                    }
                } else if (params["password"] !== "123") {
                    result = {
                        "rs": 2,
                        "info": "用户名密码错误",
                    }
                } else {
                    result = {
                        "rs": 1,
                        "info": ""
                    }
                }
                callback(result);
            }
        };

        function processHttp(key, params, callback) {
            var rootPath = getRootPath() + "/user";
            var url;
            switch (key) {
                case "getAuthCode":
                    url = "/getAuthCode";
                    break;
                case "login":
                    url = "/login";
                    break;
                default:
                    url = "";
                    break;
            }
            if (url) {
                url = rootPath + url;
                $http({
                    method: 'POST',
                    url: url,
                    data: $.param(params),
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                    //请求成功
                    .success(function(data, header, config, status) {
                        return callback(data);
                    })
                    //请求失败
                    .error(function(data, header, config, status) {

                    });
            }
        }

        return function(key, params, callback) {
            switch (env) {
                case "mock":
                    return processMock(key, params, callback);
                case "qa":
                    return processHttp(key, params, callback);
                default:
                    break;

            }
        };

    })
    //获取当前主路径名(协议+dns[ip]+[端口号]+项目名称)
function getRootPath() {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var localhostPaht = curWwwPath.substring(0, pos);
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
    return (localhostPaht + projectName);
}
