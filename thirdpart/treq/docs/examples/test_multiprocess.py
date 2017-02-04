#!/usr/bin/env python 


import multiprocessing
import time
def func(msg):
  print msg
  return "done " + msg
if __name__ == "__main__":
  pool = multiprocessing.Pool(processes=3)
  result = []
  for i in xrange(20):
    msg = "hello %d" %(i)
    result.append(pool.apply_async(func, (msg, )))
  #msg = 'hello '
  #result.append(pool.apply_async(func, (msg, )))
  pool.close()
  pool.join()
  for res in result:
      print "res is :" + res.get()
  print "Sub-process(es) done."
