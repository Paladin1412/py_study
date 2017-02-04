#!/usr/bin/env python 
# -*- coding: UTF-8 -*-

import time
import os
import re
import sys
import json
import logging as log
import multiprocessing as mp
import commands 
import pprint
import datetime


class CustLogFilter:
    
    def __init__(self):
        #log.basicConfig(level=log.DEBUG,
        #                format='[%(asctime)s] [%(levelname)-8s] %(filename)s:%(lineno)d | %(message)s',
        #                datefmt='%Y/%m/%d %H:%M:%S',
        #                filename='customer_filter.log',
        #                filemode='w')
        self.post_uri = [
            'folio/secondhand/customer/invalid.json',
            'folio/secondhand/customer/remark.json',
            'folio/secondhand/customer/noattention/set.json',
            'folio/secondhand/customer/noattention/cancel.json',
            'folio/secondhand/customer/rate.json',
            'folio/secondhand/customer/show/add.json',
            'folio/secondhand/customer/detail/add.json',
            'folio/secondhand/customer/detail/recommend.json',
            'folio/secondhand/customer/common/tags.json',
            'folio/secondhand/customer/detail/update.json',
            'folio/secondhand/customer/convert.json',
        ]
        self.get_uri = [
            'folio/secondhand/customer/query.json',
            'folio/secondhand/customer/detail.json',
            'folio/secondhand/customer/remark.json',
            'folio/secondhand/customer/show.json',
            'folio/secondhand/customer/showtime.json',
            'folio/secondhand/customer/noattention/reachlimit.json',
            'folio/secondhand/customer/common/tags.json',
            'folio/secondhand/customer/tags.json',
            'folio/secondhand/customer/common/enum.json',
            'folio/secondhand/customer/query/lj.json',
            'folio/secondhand/customer/check/phone.json',
            'folio/secondhand/customer/check/addible.json',
            'folio/secondhand/customer/common/delegate/all.json',
            'folio/secondhand/customer/common/accompany.json',
            'folio/secondhand/customer/common/sysbroker.json',
            'folio/secondhand/customer/check/recommend.json',
            'folio/secondhand/customer/check/permission.json',
            'folio/secondhand/customer/contact.json',
            'folio/secondhand/customer/detail/toUpdate.json',
            'folio/secondhand/customer/show/addcheck.json',
        ]
        self.all_uri = []
        self.all_uri.extend(self.get_uri)
        self.all_uri.extend(self.post_uri)
        self.uri_2_param = {}

    def exeShell(self, cmd):
        return commands.getstatusoutput(cmd)

    def parserLine(self, stat_log, proc_name, lock):
        proc_name = proc_name + '_' + str(os.getpid()) + '_' + stat_log.split('.')[len(stat_log.split('.'))-1]
        log_dir = os.path.dirname(stat_log)
        info_log = os.path.join(log_dir, stat_log.split('/')[len(stat_log.split('/'))-1].replace('stat', 'info'))
        save_log = os.path.join(log_dir, 'uri_params.' + stat_log.split('.')[len(stat_log.split('.'))-1])
        fh = open(stat_log, "rb")
        fw = open(save_log, "wb")
        lines = fh.readlines()
        for line in lines:
            match = re.search( r"(trace_\S+)].+/(folio/.+)\?(\S+).+city:(\d+).+code:(\d+).+cost:", line )
            if match is None: continue
            trace_id = match.group(1)
            uri = match.group(2)
            params = match.group(3)
            city_id = match.group(4)
            uc_id = match.group(5)
            if uri not in self.all_uri: continue
            print '\n[' + proc_name + ']  ' + trace_id, uri, params, city_id, uc_id
            if uri in self.get_uri:
                if uri == 'folio/secondhand/customer/remark.json' and params == 'null': continue
                if uri == 'folio/secondhand/customer/common/tags.json' and params == 'null': continue
                key = uri.replace('/', '-')
                if not self.uri_2_param.has_key(key):
                    self.uri_2_param[key] = {}
                    self.uri_2_param[key]['idx'] = 0
                    idx = self.uri_2_param[key]['idx']
                    self.uri_2_param[key][idx] = {}
                    self.uri_2_param[key][idx]['uri'] = uri.replace('-', '/')
                    self.uri_2_param[key][idx]['uc_id'] = uc_id
                    self.uri_2_param[key][idx]['city_id'] = city_id
                    data = {}
                    for i in params.split('&'):
                        if i == '': continue
                        left, right = i.split('=')
                        data[left] = right
                    self.uri_2_param[key][idx]['data'] = data 
                    w_data = json.dumps(self.uri_2_param[key][idx])
                    print '[Params]' + w_data + '\n'
                    self.uri_2_param[key]['idx'] += 1
                    lock.acquire()
                    fw.write(w_data + '\n')
                    lock.release()
                else:
                    idx = self.uri_2_param[key]['idx']
                    self.uri_2_param[key][idx] = {}
                    self.uri_2_param[key][idx]['uri'] = uri.replace('-', '/')
                    self.uri_2_param[key][idx]['uc_id'] = uc_id
                    self.uri_2_param[key][idx]['city_id'] = city_id
                    data = {}
                    for i in params.split('&'):
                        if i == '': continue
                        left, right = i.split('=')
                        data[left] = right
                    self.uri_2_param[key][idx]['data'] = data 
                    w_data = json.dumps(self.uri_2_param[key][idx])
                    print '[Params]' + w_data + '\n'
                    self.uri_2_param[key]['idx'] += 1
                    lock.acquire()
                    fw.write(w_data + '\n')
                    lock.release()
            #pprint.pprint(self.uri_2_param)

            '''
            if uri in self.post_uri:
                if uri == 'folio/secondhand/customer/remark.json' and params != 'null': continue
                if uri == 'folio/secondhand/customer/common/tags.json' and params != 'null': continue
                cmd = 'cat ' + info_log + ' | grep ' +  trace_id
                status, output = self.exeShell(cmd)
                pprint.pprint(output)
                if (status != 0) or (output == ''): continue
                if uri == 'folio/secondhand/customer/detail/add.json':
                    preg_match = re.search( r"param:(.+)\n[0-9]{4}", output)
                    if preg_match is None: continue
                    params = preg_match.group(1)
                    print '[Params][' + proc_name + ']' + params
                    data = json.loads(params)
                    #pprint.pprint(data)
                if uri == 'folio/secondhand/customer/show/add.json':
                    preg_match = re.search( r'- ({.+)\n[0-9]{4}', output)
                    if preg_match is None: continue
                    params = preg_match.group(1)
                    print '[Params][' + proc_name + ']' + params
                    data = json.loads(params)
                    #pprint.pprint(data)
                if uri == 'folio/secondhand/customer/invalid.json':
                    preg_match = re.search( r'customerId:[0-9]{12}', output)
                    if preg_match is None: continue
                    params = preg_match.group()
                    print '[Params][' + proc_name + ']' + params
                    data = json.loads(params)
                    #pprint.pprint(data)
            '''
        fh.close()


if __name__ == '__main__':
    cust = CustLogFilter()
    log_path = "/home/work/.private/zhangjiwei/online_log"
    os.chdir(log_path)
    print '[INFO]current path: ' + os.getcwd()
    print '[INFO]Main Processing: ', os.getpid()

    stat_log_list = []
    for i in os.listdir(log_path):
        if (str(i).find('folio-stat') != -1 ) and (os.path.isfile(os.path.join(log_path, i))):
            stat_log_list.append(i)
    pprint.pprint(stat_log_list)

    start_time = datetime.datetime.now().strftime('%b-%d-%y %H:%M:%S')
    record = []
    lock = mp.Lock()
    for i in range(len(stat_log_list)):
        print 'process_' + str(i) + " started"
        process = mp.Process(target=cust.parserLine, args=(stat_log_list[i], 'process_' + str(i), lock))
        process.start()
        record.append(process)
    for process in record:
        process.join()
    end_time = datetime.datetime.now().strftime('%b-%d-%y %H:%M:%S')
    print 'start_time: ' + start_time
    print 'end_time: ' + end_time

    status, output = cust.exeShell('cat uri_params.* | sort | uniq > uri.txt')
    print output
    sys.exit(status)






