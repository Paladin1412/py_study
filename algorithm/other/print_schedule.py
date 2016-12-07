#!/usr/bin/env python
#-*- coding: UTF-8 -*-


'''
最近德甲英超西甲各大联赛重燃战火，想起之前写过的一段生成赛程表的代码，用python来写这类东西太舒服了。
这个算法叫做蛇环算法。
即，把所有球队排成一个环形(2列)，左边对阵右边，第一支队伍不动，其他队伍顺时针循环，这样就肯定不重复了。
为了方便说明，假设有8支球队a到h。像下面那样按环形排好。
a - h
|   |
b   g
|   |
c   f
|   |
d - e
这样，第1轮的对阵就是，(a,h)(b,g)(c,f)(d,e)。
下一轮的时候，第一支球队a不动，其它球队像齿轮一样顺时针走一格。
a b
|   |
c h
|   |
d g
|   |
e-f
这样，第2轮的对阵就是，(a,b)(c,h)(d,g)(e,f)。
齿轮继续滑动，直到回到原点，这样每支球队都跟其它所有7支球队对阵了。
'''
from collections import deque  
import random  
import pprint

def build_schedule(_teamarr):  
    scheduleobj = dict.fromkeys(range(1,20))  
    fixpos = _teamarr[0]  
    ring = _teamarr[1:]  
    ring = deque(ring)  
    #前半赛程，1-19轮(round)  
    for round in range(1,20):  
        #第1支球队不动，再加上轮转(rotate)的环  
        teams = [fixpos] + list(ring)  
        #切成2列，左边主队，右边客队  
        home, away = teams[:len(teams)/2],teams[len(teams)/2:]  
        print 'left: %s, right %s' % (str(home), str(away))
        away = away[::-1]  
        print away
        #随机打乱主客队  
        scheduleobj[round] = [(x,y) if random.random()>=0.5 else (y,x) for x,y in zip(home,away)]  
        ring.rotate(1)  
    #后半赛季对阵跟前半赛季一样，但主客队对调  
    for round in range(20,39):  
        scheduleobj[round] = [(y,x) for x,y in scheduleobj[round-19]]  
    return scheduleobj  
  
if __name__ == '__main__':  
    teamarr = [u'曼联', u'阿斯顿维拉', u'切尔西', u'西汉姆', u'富勒姆',  
                u'热刺', u'利物浦', u'南安普顿', u'埃弗顿', u'诺维奇',  
                u'纽卡斯尔', u'曼城', u'斯托克城', u'桑德兰', u'水晶宫',  
                u'西布罗姆维奇', u'阿森纳', u'赫尔城', u'卡迪夫城', u'斯旺西']  
    teamarr = range(1,21)
    scheduleobj = build_schedule(teamarr)  
    pprint.pprint(scheduleobj)
    print u'---联赛第1轮---'  
    for h,a in scheduleobj[1]:  
        print u'{}-{}'.format(h,a)  
  
    print u'---联赛第2轮---'  
    for h,a in scheduleobj[2]:  
        print u'{}-{}'.format(h,a) 
