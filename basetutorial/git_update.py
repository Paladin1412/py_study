#!/usr/bin/env python
import sys
sys.path.append("/home/zhangjiwei/software/pexpect-2.3/build/lib")
import pexpect
import os
import commands

if len(sys.argv) < 2:
    print "Usage: " + sys.argv[0] + " <gitpassword>"
    exit()

gitpassword = sys.argv[1]
giturl = [
    'git@git.lianjia.com:qa/mobile.git',
    'git@git.lianjia.com:bigdata/folio.git',
    'git@git.lianjia.com:bigdata/data_center.git',
    'git@git.lianjia.com:bigdata/mobileapi-common-server.git',
    'git@git.lianjia.com:bigdata/bigdata_api.git',
    'git@git.lianjia.com:bigdata/tools.git',
    'git@git.lianjia.com:bigdata/shangji-v2-java.git',
    'git@git.lianjia.com:bigdata/mobileapi-common-util.git',
    'git@git.lianjia.com:bigdata/mobile-static.git',
    'git@git.lianjia.com:bigdata/task_schedule.git',
    'git@git.lianjia.com:bigdata/House_Value.git',
    'git@git.lianjia.com:bigdata/BigdataSpider.git',
    'git@git.lianjia.com:bigdata/yezhuduan.git',
    'git@git.lianjia.com:bigdata/house_feature.git',
    'git@git.lianjia.com:bigdata/log_collect.git',
    'git@git.lianjia.com:bigdata/bd-api.git',
    'git@git.lianjia.com:bigdata/dataplat.git',
    'git@git.lianjia.com:bigdata/yzd_api.git',
    'git@git.lianjia.com:bigdata/dataplatbroker.git',
    'git@git.lianjia.com:bigdata/support-common.git',
    'git@git.lianjia.com:bigdata/test.git',
    'git@git.lianjia.com:bigdata/shangji.git',
    'git@git.lianjia.com:bigdata/report_system.git',
    'git@git.lianjia.com:bigdata/common_lib.git',
    'git@git.lianjia.com:bigdata/test_utility.git',
    'git@git.lianjia.com:bigdata/task_recovery.git',
]

def print_green(str, newline):
    str = '\033[0;32m' + str + '\033[0m'
    if not newline:
        sys.stdout.write(str)
    else:
        print str
    

for url in giturl: #for url in os.listdir(os.getcwd())
    gitpath = os.getcwd() + '/' + os.path.basename(url).replace(".git", "")
    if not os.path.exists(gitpath):
        continue
    try:
        print_green('*' * 70, True)
        os.chdir(gitpath)
        print_green('[INFO]', False)
        print ' CURPATH:\t' + os.getcwd()
        child = pexpect.spawn("git pull\r", timeout = 300)
        #child.logfile = sys.stdout
        child.expect("id_rsa")
        child.sendline(gitpassword)
        child.expect("From git.lianjia.com")
    except pexpect.EOF:
        pass
    except pexpect.TIMEOUT:
        pass
    print_green('[INFO]', False)
    print " " + url + " Update ",
    print_green('[OK]', False) 
    print '\033[0m'
    if os.path.exists(gitpath + '/pom.xml'):
        output = os.system('mvn clean package -P test')
        #(status, output) = commands.getstatusoutput('echo $?')
        print_green('[INFO]', False)
        if not int(output) == 0 :
            print ' Package Update \033[1;31m[FAIL]\033[0m'
        else:
            print ' Package Update ',
            print_green('[OK]\n', False) 
    else:
        sys.stdout.write("\033[1;31m[WARN]\033[0m")
        print " " + gitpath + ' is not exist pom.xml'
    os.chdir("..")

