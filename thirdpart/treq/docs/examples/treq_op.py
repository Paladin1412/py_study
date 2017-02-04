# coding: utf-8 
import os
import json 
import pdb 
import time 
import urllib 
import requests 
import hashlib 
import copy 
import threadpool
import logging
import treq
from twisted.internet import reactor, task  
from twisted.web.client import HTTPConnectionPool  
from data import data 
import utils 
import config 

cooperator = task.Cooperator()
pool = HTTPConnectionPool(reactor)

def init_log(logger_name='opensearch'):
    file_name = config.LOG_FILE
    if os.path.isfile(file_name):
        os.system('rm -rf %s' % file_name)
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.DEBUG)
    fh = logging.FileHandler(file_name)
    fh.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        "[%(levelname)s] [%(asctime)s] [%(filename)s: %(lineno)s] [%(message)s]"
    )
    fh.setFormatter(formatter)
    logger.addHandler(fh)

def get_security(secret, params, timestamp): 
    tmp = secret+params+str(timestamp) 
    return hashlib.md5(tmp).hexdigest().upper() 
 
def get_headers(params=''): 
    headers = {"Content-Type": "application/json", "Cache-Control": "no-cache"} 
    timestamp = str(int(time.time()*1000)) 
    security = get_security(config.SECRET, params, timestamp) 
    headers.update({'token': config.TOKEN, 'security': security, 'timestamp': timestamp}) 
    return headers 
 
def get_params(): 
    tmp = copy.deepcopy(data.default_data) 
    tmp['docs'][0]['data']['id'] = int(utils.randomNumString(10)) 
    return tmp 

def handle_response(response):
    res = treq.content(response)
    logger.debug(res)
 
def request(index):
    headers = get_headers() 
    params = get_params() 
    d = treq.post(config.INDEX_URL, 
        data=json.dumps(params),
        headers=headers)
    d.addCallback(handle_response)
    return d

def requests_generator():  
    num = 0
    while num < 10:
        num += 1
        deferred = request(1)
        yield None
        
def run_threadpool(num=config.MAX_RECORD_NUM, pool_size=config.MAX_POOL_SIZE):
    pool = threadpool.ThreadPool(pool_size)
    data = [((index, ), {}) for index in xrange(num)]
    reqs = threadpool.makeRequests(
        request_core,
        data
    )
    [pool.putRequest(req) for req in reqs]
    pool.wait()
    pool.dismissWorkers(pool_size, do_join=True)

if __name__ == '__main__':
    init_log()
    logger = logging.getLogger('opensearch')
    cooperator.cooperate(requests_generator())
    reactor.run()
