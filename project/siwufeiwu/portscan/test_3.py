#!/usr/bin/python
# -*- coding:utf-8 -*-

from socket import *
import threading
import sys


lock = threading.RLock()

def tcp_test(port):
    sk = socket()
    sk.settimeout(10)
    result = sk.connect_ex((target_ip, port))
    if result == 0:
        lock.acquire() # for print 
        print "opened ports:", port
        lock.release()



if __name__=='__main__':
    # multi_scan.py <host> <start>-<end port>
    host = sys.argv[1]
    ports = sys.argv[2].split('-')

    s_port = int(ports[0])
    e_port = int(ports[1])

    target_ip = gethostbyname(host)

    for port in range(s_port, e_port):
        t= threading.Thread(target=tcp_test, args=(port,)) # first func name, sacond is params, only a tuple
        t.start()
		

if __name__=='__main__':
    # multi_scan.py <host> <start>-<end port>
    #host = sys.argv[1]
    # ports = sys.argv[2].split('-')

    # s_port = int(ports[0])
    # e_port = int(ports[1])

    hosts = []
    ports = []
    with open("allhost.md") as f:
        hosts.append(f.readline())

    with open("allports.md") as f:
        ports.append(f.readline())

    for host in hosts:
        target_ip = gethostbyname(host)

        for port in ports:
            port = int(port)
            t= threading.Thread(target=tcp_test, args=(port,)) # first func name, sacond is params, only a tuple
            t.start()