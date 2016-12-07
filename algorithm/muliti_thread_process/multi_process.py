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
lock = multiprocessing.Lock()
for i in range(5):
    process = multiprocessing.Process(target=worker, args=('process_' + str(i), lock))
    process.start()
    record.append(process)

for process in record:
    process.join()


