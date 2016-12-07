#!/usr/bin/env python
#-*- coding: UTF-8 -*-

import random

ticket = ['cp-01', 'cp-02', 'cp-03', 'cp-04', 'cp-05']
idx = range(1,6)
random.shuffle(idx)
j = 1
for i in idx:
    print "people:QA%d\tticket:cp-0%d" % (i, j)
    j += 1
