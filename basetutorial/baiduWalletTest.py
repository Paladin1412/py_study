#!/usr/bin/python  
# -*- coding=utf-8 -*-  
# author : 王晓强  
# date: 2014-10-13  
# version: 0.1  
# 
import os
import sys
import re
import urllib2
import smtplib,sys 
import filecmp
from email.mime.text import MIMEText 
def send_mail(sub,content): 
#############
#要发给谁，这里发给1个人
    mailto_list = ['wangxiaoqiang@baidu.com']
    #mailto_list = ['wallet-mobile-qa@baidu.com;wallet-mobile-rd@baidu.com']
#####################
#设置服务器，用户名、口令以及邮箱的后缀
    mail_host="email.baidu.com"
    mail_user="wangxiaoqiang"
    mail_pass="xxx"
    mail_postfix="baidu.com"
######################
    me=mail_user+"<"+mail_user+"@"+mail_postfix+">"
    msg = MIMEText(content,_charset='gbk') 
    msg['Subject'] = sub 
    msg['From'] = me 
    msg['To'] = ";".join(mailto_list) 
    try: 
        s = smtplib.SMTP() 
        s.connect(mail_host,25) 
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(mail_user,mail_pass) 
        s.sendmail(me, mailto_list, msg.as_string()) 
        s.quit() 
        return True
    except Exception, e: 
        print str(e) 
        return False

#截取XML特定内容
def getCaseResultfromXML(FilePath):
    f = open(FilePath,'r').readlines()
    x = ''
    for p in f:
        if '''<?xml version='1.0' encoding='utf-8' standalone='yes' ?>''' in p:
            p = p.replace('''<?xml version='1.0' encoding='utf-8' standalone='yes' ?>''','')
        if r'<testsuites>' in p:
            p = p.replace('<testsuites>','')
        if r'</testsuites>' in p:
            p = p.replace('</testsuites>','')
        x = x+p
    return x
    
#创建新文件
def creatFile(FilePath):
    if not os.path.isfile(FilePath):
        file=open(FilePath,'w')
        file.write('')
        file.close()
        
def writeContentToFile(FilePath,Content):
    f = open(FilePath,'a')
    f.write(Content)
    f.close
        
def getContent(hostPageUrl):
    response = urllib2.urlopen(hostPageUrl)
    html = response.read()
    return html

def uploadToPlat(job_name, job_url, build_url, build_id, moudle_name, total, passed, failed, error):
    update_url = "http://cp01-sys-rath4-c32-qa172.cp01.baidu.com:8800/walletauto/report/autoresult?group=wallet&team=client&program=ux&job_name=%s&job_type=dailyrun&case_type=ui&job_result=1&job_url=%s&build_url=%s&build_id=%s&module=wallet_android_sdk_%s&total_num=%d&succ_num=%d&fail_num=%d&err_num=%d&service_addr=cp01-qa-yun-009.cp01.baidu.com" % (job_name, job_url, build_url, build_id, moudle_name, total, passed, failed, error)
    content = getContent(update_url)
    #print content
    
def exeClass(FilePath, saveResultPath, className, resultXML, job_name, job_url, build_url, build_id, sdk_version): 
    casename = []
    lines = open(FilePath,'r').readlines()
    for line in lines:
        case = line.strip('\n')
        casename.append(case)
    exeNum = len(casename)
    errorCase = 0
    #执行操作命令    
    for i in range(0,exeNum):
        oper = 'adb -s 8a0c0cc4 shell am instrument -e reportDir "/sdcard/logFiles/" -e reportFile "report_%s%d.xml" -e class com.baidu.paysdk.demo.test.%s#%s -w com.baidu.paysdk.demo.test/com.zutubi.android.junitreport.JUnitReportTestRunner' %(className,i,className,casename[i])            
        os.system(oper)
        print oper
        str = 'adb -s 8a0c0cc4 pull /sdcard/logfiles/report_%s%d.xml ./report' % (className,i)
        os.system(str)
        file = 'report/report_%s%d.xml' % (className,i)
        #重命名操作
        '''modName = 'ren junit-report.xml %s%d.xml' % (className,i)
        os.system(modName)'''
        
        
        #删除操作
        delOper = 'del %s' %(file)
        f = open(file,'r').readlines()
        for p in f:
            if 'failure' in p:
                #f.close()
                os.system(delOper)
                os.system(oper)
                os.system(str)
                f = open(file,'r').readlines()
                for x in f:
                    if 'failure' in x:
                        errorCase = errorCase + 1
                        writeContentToFile(saveResultPath,'%s fail \n'%casename[i])
                        break
        xmlresult = getCaseResultfromXML(file)
        writeContentToFile(resultXML,xmlresult)
    moudle_name = sdk_version + className
    uploadToPlat(job_name, job_url, build_url, build_id, moudle_name, exeNum, exeNum - errorCase, errorCase, 0)


        
if __name__ == '__main__':
    reload(sys)
    sys.setdefaultencoding("gbk")
    #获取job信息
    job_name = sys.argv[1]
    job_url = sys.argv[2]
    build_url = sys.argv[3]
    build_id = sys.argv[4]
    
    if os.path.isfile('AllResult.txt'):
        os.system('del AllResult.txt')
        os.system('del *.xml')
    if os.path.isfile('xml/AllResult.xml'):
        os.system('del xml\AllResult.xml')
    if os.path.isfile('xml/Report.xml'):
        os.system('del xml\Report.xml')    
    if os.path.isfile('xml/out.xml'):
        os.system('del xml\out.xml')
    #if os.path.isfile('xml/checklist.txt'):
    #    os.system('del xml\checklist.txt')
    if os.path.isfile('AllTestResult.txt'):
        os.system('del AllTestResult.txt')
    if os.path.isfile('report'):
        os.system('del report\*.xml')

    
    creatFile('xml/AllResult.xml')
    
    creatFile('AllResult.txt')
    exeClass('UXCombinePay.txt','AllResult.txt','UXCombinePay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXPrivacyProtection.txt','AllResult.txt','UXPrivacyProtection','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXTransfer.txt','AllResult.txt','UXTransfer','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXUpdateMobilePWD.txt','AllResult.txt','UXUpdateMobilePWD','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXCompletionPay.txt','AllResult.txt','UXCompletionPay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXWalletHome.txt','AllResult.txt','UXWalletHome','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXNewAccout.txt','AllResult.txt','UXNewAccout','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXBlancePay.txt','AllResult.txt','UXBlancePay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXInvalidInfoPay.txt','AllResult.txt','UXInvalidInfoPay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXTranficcPay.txt','AllResult.txt','UXTranficcPay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    exeClass('UXYouQianPay.txt','AllResult.txt','UXYouQianPay','xml/AllResult.xml', job_name, job_url, build_url, build_id, '5.3')
    creatFile('xml/Report.xml')
    
    #统计测试结果
    Fail = 0

    
    file = open('xml/AllResult.xml','r').readlines()
    for p in file:
        Fail = Fail + p.count('failure')
        print Fail
    Fail = Fail/2
    
    str = 'name="BaiduWalletRefactorDemoTest" project="BaiduWalletRefactorDemoTest" tests="38" started="%s" failures="%s" errors="0" ignored="0"' % ((38-Fail),Fail)
    
    start = r'''<?xml version='1.0' encoding='utf-8' standalone='yes' ?><testsuite %s>''' %(str)
    end = r'</testsuite>'
    f = open('xml/AllResult.xml','r').readlines()
    lines = ''
    for p in f:
        if '''<?xml version='1.0' encoding='utf-8' standalone='yes' ?>''' in p:
            p = p.replace('''<?xml version='1.0' encoding='utf-8' standalone='yes' ?>''','')
        if r'<testsuites>' in p:
            p = p.replace('<testsuites>','')
        if r'</testsuites>' in p:
            p = p.replace('</testsuites>','')
        lines = lines+p
    writeContentToFile('xml/Report.xml',start)
    writeContentToFile('xml/Report.xml',lines)    
    writeContentToFile('xml/Report.xml',end)
        

    caseName = {
    'testYueChargeNoCard':'无卡充值提现',
    'testManJian_and_bbq':'百宝券满减组合支付',
    'testManJian':'满减测试',
    'testBalancePay':'【有绑卡】余额和卡组合支付',
    'testBindCardInPay':'【无绑卡】手机充值一键支付添加新卡支付',
    'testBindCradSec':'无绑卡 二次绑卡有绑卡 二次绑卡',
    'testTransfer':'【转账】无绑卡 有手机支付密码 绑卡支付转账',
    'testTixian_NoCard':'无卡提现',
    'testDirecBindCard':'【直付】【无绑卡】【有手机支付密码】绑卡支付',
    'testPayUsrCard':'有绑卡弹窗支付',
    'testPayUseNewCard':'有绑卡，支付中使用新卡支付',
    'testPayForPwd':'有绑卡支付过程中忘记卡支付密码',
    'testNoCardandForPwd':'无绑卡支付过程中忘记卡支付密码',
    'testEnChnageLog':'交易记录查看',
    'testChargeUseYue_NoCard':'无卡余额充值',
    'testPayWithYueandCard':'余额和卡组合支付',
    'testTixiantoCard':'有储蓄卡充值提现',
    'testPhoneChargeUseBalance':'手机充值用余额支付',
    'testChargeUseYue':'【有手机支付密码】【余额开启】一键支付',
    'testPayUseBbq':'百宝券支付',
    'testMyPayList':'查看我的交易列表',
    'testMyPayDetails':'查看交易详情',
    'testCompleteCharge':'交易详情中完成手机充值',
    'testClosePay':'交易详情中关闭未完成的转账',
    'testCompeleteTransfer':'交易详情中完成转账',
    'testTranster_to_baifubao_account':'转账到百付宝账号',
    'testTransfer_history':'转账到历史账号联系人',
    'testTransfer_name_verified':'转账到实名认证账号',
    'testModifyMobilePayPWD':'修改手机支付密码',
    'testForgetMobilePayPWD':'忘记手机支付密码',
    'testNewAcount':'新用户注册无线绑卡无线支付',
    'testNoMobilePWD':'无手机支付密码绑卡支付',
    'testPwdaddCardInfo':'直付，补全卡支付',
    'testUseNewCard':'有补全卡，有支付密码，新卡支付',
    'testOpenClosebtn':'打开或关闭隐私开关',
    'testCheckPayInfo':'隐私保护，查看交易记录输入手机支付密码',
    'testCheckBalance':'隐私保护，查看余额输入手机支付密码',
    'testAddLostInfo':'隐私保护，查看交易记录时忘记密码',
    'testDaoDianfu':'到店付',
    'testDaoDianFuSmall':'1元以下不能参与返现',
    'testMobileNumberChanged':'手机号变更',
    'testValidDateExpried':'有效期过期',
    'testMobileChargeWithNewAccout':'话费充值新用户帮卡支付',
    'testNativePayWithNewAccout':'新用户帮卡支付'
    }
    
    fp = open('xml/Report.xml','r').readlines()
    allinfo = ''
    allCaseNum = 0
    for s in fp:
        num = 0
        for key in caseName:
            a = s.replace(key,caseName[key])
            s = a
            num = num + 1
        allinfo = allinfo + s

        allCaseNum = num
    print allCaseNum,Fail
    #结果更新
    file = open('xml/out.xml','w')
    file.write(allinfo)
    file.close()
    
    resultFile = open('AllTestResult.txt','w')
    passnum =(allCaseNum-Fail)
    passrate = passnum*100/allCaseNum
    results = "All cases : %d, Passed %d, Failed %d, PassRate %d%%" %(44,passnum,(44-passnum),passrate)
    resultFile.write(results)
    resultFile.close()
    os.system('del *.xml')
        


    #update_url = "http://cp01-bae-qatest00.cp01.baidu.com:8800/walletauto/report/autoresult?group=wallet&team=client&program=ux&job_name=%s&job_type=dailyrun&case_type=ui&job_result=1&job_url=%s&build_url=%s&build_id=%s&module=wallet_android_sdk&total_num=%d&succ_num=%d&fail_num=%d&err_num=%d&service_addr=cp01-qa-yun-009.cp01.baidu.com" % (job_name, job_url, build_url, build_id, 44, passnum, (44 - passnum), 0)
    #content = getContent(update_url)
    #print content
        
