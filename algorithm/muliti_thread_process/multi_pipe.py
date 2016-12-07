#!/usr/bin/env python
#-*- coding: UTF-8 -*-

import multiprocessing as mul

def proc1(pipe):
    pipe.send('hello')
    print 'proc1 send finished'
    print 'proc1 rec:' + str(pipe.recv())

def proc2(pipe):
    print 'proc2 rec:' + str(pipe.recv())
    pipe.send('hello, too')
    print 'proc2 send finished'

pipe = mul.Pipe()

p1 = mul.Process(target=proc1, args=(pipe[0],))
p2 = mul.Process(target=proc2, args=(pipe[1],))

p1.start()
p2.start()
p1.join()
p2.join()
