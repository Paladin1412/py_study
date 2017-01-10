#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import thread #引入了 thread 库，这是 python 多线程需要的
from socket import *

def tcp_test(port):
    sock = socket(AF_INET, SOCK_STREAM)
    sock.settimeout(10)
    result = sock.connect_ex((target_ip, port))
    if result == 0:
        lock.acquire()
        print "Opened Port:",port
        lock.release()
# print 输出要加锁，如果不加锁就会出现多个输出混合在一起的错误状态
# 而锁需要在程序启动时候创建，从而能让新建的线程共享这个锁

if __name__=='__main__':
    # portscan.py <host> <start_port>-<end_port>
    host = sys.argv[1]
    portstrs = sys.argv[2].split('-')

    start_port = int(portstrs[0])
    end_port = int(portstrs[1])

    target_ip = gethostbyname(host)

    lock = thread.allocate_lock()

    for port in range(start_port, end_port):
        thread.start_new_thread(tcp_test, (port,))