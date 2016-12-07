#!/usr/bin/env python
#-*- coding: UTF-8 -*-


import os
import threading
import multiprocessing

def worker(sign, lock):
    lock.acquire()
    print sign + '--' + str(os.getpid())
    lock.release()

print 'Main:', os.getpid()

record = []
lock = threading.Lock()
for i in range(5):
    thread = threading.Thread(target=worker, args=('thread_' + str(i), lock))
    thread.start()
    record.append(thread)

for thread in record:
    thread.join()


