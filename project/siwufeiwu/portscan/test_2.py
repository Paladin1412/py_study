# -*- coding: utf-8 -*-
import sys
from socket import *
import threading
import time
import Queue

host = sys.argv[1]
port = sys.argv[2]
_start_port = int(port.split('-')[0])
_end_port = int(port.split('-')[1])
target_ports = range(_start_port,_end_port)
def scan(host,target_ports):
    target_ip = gethostbyname(host)

    opened_ports = []
    for port in range(_start_port,_end_port):
        sock = socket(AF_INET,SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((target_ip,port))
        print result
        if result == 0:
            opened_ports.append(port)
            pass
        pass

    print 'opened_port:'
    for opened_port in opened_ports:
        print opened_port
        pass

class myThread (threading.Thread):   #继承父类threading.Thread
    def __init__(self):
        threading.Thread.__init__(self)
        pass
    def run(self):                   #把要执行的代码写到run函数里面 线程在创建后会直接运行run函数
        scan(host,port)
        pass
    pass
q = Queue.Queue(0)

for thread in range(0,10):
    t = myThread()
    t.start()