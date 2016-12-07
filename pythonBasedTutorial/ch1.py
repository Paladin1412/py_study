#!/usr/bin/env python 

import math
import cmath

print cmath.sqrt(-1)
print math.sqrt(9), math.floor(32.8), math.ceil(32.8), int(32.8), (1+3j) * (9+4j)

print "hello \"world"
print 'hello \"world'

t=43
print "the num is " + `t`
print "the num is " + repr(t)
print "the num is " + str(t) 


x=raw_input("please input a num: ");
print x
print type(x)


print '''
hello world
goodbye world
'''

print "hello world" \
        "goodbye world"

print r'c:\zhangjiwei\abc\zz' '\\'
print 'c:\zhangjiwei\abc\zz' '\\'
print 'c:\zhangjiwei\\abc\zz' '\\'
print pow(2, 3)
print u'hello world'
