# coding=utf-8
import requests,json,datetime
from core.result.models import Res
from core.interface.models import Testcase
from core.caseset.models import Caseset
from coon_mysql import run_sql
from core.interface.src import check_res
from core.adminlte.constants import TestcaseRes,HttpMothod


def runtestcase(testcaseid,casesetid):
    return_res = {'passresid': '', 'failresid': '','interfacename':''}
    req_code = ''
    req_text = ''
    start_time = datetime.datetime.now()
    testcase = Testcase.objects.get(id=int(testcaseid))
    return_res['interfacename'] = testcase.case_name

    testcase_res = Res.objects.create(case_id=testcase.id,
                                      response="",
                                      res_status=TestcaseRes.FAIL,
                                      product_id=testcase.interface.product_id,
                                      module_id=testcase.interface.module_id,
                                      elapsed_time="0")

    if testcase.init_sql:
        connection = run_sql(host='10.164.96.205', user='root', passwd='123456', db='adcpm',
                    sql=testcase.init_sql)
        sql_res = connection.coon_db()
        if 'error' in sql_res:
            end_time = datetime.datetime.now()
            time_elapsed = str(end_time - start_time).split('.', 2)[0]
            testcase.caseresult = TestcaseRes.FAIL
            testcase.fail_count += 1
            testcase.updated_time = end_time

            if casesetid:
                caseset = Caseset.objetcs.get(id=int(casesetid))
                caseset.updated_time = end_time
                caseset.runresult = TestcaseRes.FAIL
                caseset.save()
                testcase_res.caseset_id = int(casesetid)
                print "caseset is %s" % casesetid
            testcase_res.res_status = TestcaseRes.FAIL
            testcase_res.response += "初始化SQL:%s 运行失败！" % testcase.init_sql
            testcase_res.elapsed_time = time_elapsed
            testcase.count +=1
            testcase.save()
            testcase_res.save()
            return_res['failresid'] += str(testcase_res.id) + ','
            return return_res
        else:
            testcase_res.response += "初始化SQL:%s 运行成功！" % testcase.init_sql
    if testcase.interface.req_url != '' and len(testcase.modify_param) > 0 and testcase.interface.reqmethod == HttpMothod.GET:
        try:
            if testcase.interface.header:
                import ast
                headers = ast.literal_eval(testcase.interface.header)
            if testcase.interface.is_json:
                reqparams = json.loads(testcase.modify_param)
            else:
                reqparams = testcase.modify_param
            if testcase.interface.header:
                req = requests.get(testcase.interface.req_url,headers=headers,params=reqparams)
            else:
                req = requests.get(testcase.interface.req_url, params=reqparams)

        except Exception, e:
            req_text = "Error Occured:",e
            req_code = 999
            print("Error Occured:", e)
        else:
            req_code = req.status_code
            req_text = req.text
    elif testcase.interface.req_url != '' and len(testcase.modify_param) > 0 and testcase.interface.reqmethod == HttpMothod.POST:
        try:
            if testcase.interface.header:
                import ast
                headers = ast.literal_eval(testcase.interface.header)
            if testcase.interface.is_json:
                reqparams = json.loads(testcase.modify_param)
            else:
                reqparams = testcase.modify_param
            if testcase.interface.header:
                req = requests.post(testcase.interface.req_url,data=reqparams,headers=headers)
            else:
                req = requests.post(testcase.interface.req_url,data=reqparams)
        except Exception, e:
            req_text = "Error Occured:",e
            req_code = 999
            print("Error Occured", e)
        else:
            req_code = req.status_code
            req_text = req.text
    else:
        req_text = "运行失败! 请求url：%s ,请求方法：%s ,请求参数：%s。"%(testcase.interface.req_url,testcase.interface.get_reqmethod_display,testcase.modify_param)
        req_code = 999

    if testcase.code_check==req_code and 'ok' in check_res.check_res(testcase.res_check, req_text):
        if testcase.delete_sql:
            connection = run_sql(host='10.164.96.205', user='root', passwd='123456', db='adcpm',
                                 sql=testcase.delete_sql)
            sql_res = connection.coon_db()
            if 'error' in sql_res:
                testcase.caseresult = TestcaseRes.FAIL
                testcase.fail_count += 1
                testcase_res.res_status = TestcaseRes.FAIL
                testcase_res.response += "请求验证成功，清除SQL:%s 运行失败！"%testcase.delete_sql
            else:
                testcase.caseresult = TestcaseRes.PASS
                testcase.pass_count += 1
                testcase_res.res_status = TestcaseRes.PASS
                testcase_res.response += "请求验证成功，清除SQL：%s 运行成功！" % testcase.delete_sql
    else:
        testcase.caseresult = TestcaseRes.FAIL
        testcase.fail_count += 1
        testcase_res.res_status = TestcaseRes.FAIL
        testcase_res.response += "请求验证失败，请求url:%s ,请求参数:%s ，期望返回码:%s,实际状态码:%s,期望返回结果:%s，实际返回结果:%s。" % (testcase.interface.req_url,testcase.modify_param,testcase.code_check,req_code,testcase.res_check,req_text)

        if testcase.delete_sql:
            connection = run_sql(host='10.164.96.205', user='root', passwd='123456', db='adcpm',
                             sql=testcase.delete_sql)
            sql_res = connection.coon_db()
            if 'error' in sql_res:
                testcase_res.response +="清除SQL:%s 运行失败！"% testcase.delete_sql
            else:
                testcase_res.response += "清除SQL:%s 运行成功！" % testcase.delete_sql

    end_time = datetime.datetime.now()
    testcase.updated_time = end_time

    if casesetid:
        caseset = Caseset.objetcs.get(id=int(casesetid))
        caseset.updated_time = end_time
        caseset.runresult = testcase.caseresult
        caseset.save()
        testcase_res.caseset_id = int(casesetid)
    testcase.count += 1
    testcase.save()
    time_elapsed = str(end_time - start_time).split('.', 2)[0]
    testcase_res.elapsed_time = time_elapsed
    testcase_res.save()
    if testcase_res.res_status == TestcaseRes.PASS:
        return_res['passresid'] = str(testcase_res.id) + ','
    else:
        return_res['failresid'] = str(testcase_res.id) + ','
    return return_res
