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
from twisted.internet import epollreactor
from twisted.internet import reactor, task  
from twisted.web.client import HTTPConnectionPool  
import treq  
import random  
from datetime import datetime
import utils

req_generated = 0  
req_made = 0  
req_done = 0

cooperator = task.Cooperator()

pool = HTTPConnectionPool(reactor)

def init_log(logger_name='opensearch'):
    file_name = 'opensearch.log'
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

def counter():  
    '''This function gets called once a second and prints the progress at one 
    second intervals. 
    '''
    logger.debug("Requests: {} generated; {} made; {} done".format(req_generated, req_made, req_done))
    # reset the counters and reschedule ourselves
    reactor.callLater(1, counter)

def body_received(body):  
    global req_done
    req_done += 1

def request_done(response):  
    global req_made
    deferred = treq.json_content(response)
    req_made += 1
    deferred.addCallback(body_received)
    deferred.addErrback(lambda x: None)  # ignore errors
    return deferred

def request(index):
    global req_generated
    headers = get_headers()
    params = get_params()
    try:
        deferred = treq.post(config.INDEX_URL,
                             data=json.dumps(params),
                             headers=headers,
                             pool=pool)
        deferred.addCallback(request_done)
        req_generated += 1
    except Exception as e:
        deferred = None
    return deferred

def requests_generator(index):  
    global req_generated
    while True:
        deferred = request()
        req_generated += 1
        # do not yield deferred here so cooperator won't pause until
        # response is received
        yield None

def run_threadpool(num=3, pool_size=3):
    pool = threadpool.ThreadPool(pool_size)
    data = [((index, ), {}) for index in xrange(num)]
    print data
    reqs = threadpool.makeRequests(
        request,
        data
    )
    [pool.putRequest(req) for req in reqs]
    pool.wait()
    pool.dismissWorkers(pool_size, do_join=True)

if __name__ == '__main__':  
    init_log()
    logger = logging.getLogger('opensearch')

    # make cooperator work on spawning requests
    cooperator.cooperate(run_threadpool())

    # run the counter that will be reporting sending speed once a second
    reactor.callLater(1, counter)

    # run the reactor
    reactor.run()
