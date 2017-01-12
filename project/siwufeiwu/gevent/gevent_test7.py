#coding:utf-8

import gevent
from gevent.lock import BoundedSemaphore
 
lock = BoundedSemaphore(2) #等于1相当于是同步锁
 
def worker(n):
    lock.acquire()
    print('Worker %i acquired semaphore' % n)
    gevent.sleep(0)
    lock.release()
    print('Worker %i released semaphore' % n)
 
gevent.joinall([gevent.spawn(worker, i) for i in xrange(0, 6)])
