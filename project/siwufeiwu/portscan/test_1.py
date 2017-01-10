#!/usr/bin/python3
# -*- coding: utf-8 -*-

import sys
import threading
import time
from socket import *

def tcp_test(port):
    sock = socket(AF_INET, SOCK_STREAM)
    sock.settimeout(10)
    result = sock.connect_ex((target_ip, port))
    if result == 0:
        lock.acquire()
        print("Opened Port:",port)
        lock.release()
class myThread (threading.Thread): # from threading import Thread
    def __init__(self, port):
        threading.Thread.__init__(self)
        self.port = port
    def run(self):
        tcp_test(self.port)
if __name__=='__main__':
    # portscan.py <host> <start_port>-<end_port>
    host = sys.argv[1]
    portstrs = sys.argv[2].split('-')

    start_port = int(portstrs[0])
    end_port = int(portstrs[1])

    target_ip = gethostbyname(host)

    lock = threading.Lock()
    thread_arr = []
    for port in range(start_port, end_port):
        myThread(port).start()