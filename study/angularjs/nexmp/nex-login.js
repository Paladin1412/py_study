/*
 *
 *  Module
 *
 *  Login Module 
 *  
 */
angular.module('Nex', [])
    /*  
     *
     *	Controller nex-login-ctrl 
     *
     *	Start
     */
    .controller('nex-login-ctrl', function($scope) {

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
            img:"",
        };

        /* $scope 事件绑定 */

        $scope.event = {
            submit: function(formInfo) {

                var result = beforeSubmitCheck(formInfo);

                if (result === true) {
                    submitForm(formInfo);
                }
                //表单验证不通过 
                else {
                    getVerifyCode();
                    setWarningText(result);
                }
            },
        }


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

            var data = {

            };
            window.location.href = "./nex-app.html";
        };

        //设置表单验证失败错误信息
        function setWarningText(text) {
            $scope.data.warning = text;
        };

        //获取验证码
        function getVerifyCode() {
        	$scope.data.img = "./css/_images/login-verifycode-sample.png";
        }

        /* 初始化自动运行 */
        getVerifyCode();

    })
    /*  End Controller
     *
     *	Service nex-login-service
     *
     *	Start
     */
    .service('nex-login-service', function($http) {

        var url;



    })
