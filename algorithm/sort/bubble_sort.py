#!/usr/bin/env python
#-*- coding: UTF-8 -*-

'''
介绍：

冒泡排序的原理非常简单，它重复地走访过要排序的数列，一次比较两个元素，如果他们的顺序错误就把他们交换过来。

步骤：

比较相邻的元素。如果第一个比第二个大，就交换他们两个。
对第0个到第n-1个数据做同样的工作。这时，最大的数就“浮”到了数组最后的位置上。
针对所有的元素重复以上的步骤，除了最后一个。
持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。
'''



def bubble_sort(a_list):
    n = len(a_list)
    for i in range(n): #总共要比较n-1次
        for j in range(1, n-i): #每次比较过后，最后一位已经是终态，不需要参与比较了，可见冒泡的核心是两两比较和交换
            if a_list[j-1] > a_list[j]: #降序改为<即可
                a_list[j-1], a_list[j] = a_list[j], a_list[j-1]
            print "\tcount:%d  array=%s" %(i, str(a_list))
        print "count:%d  array=%s" %(i, str(a_list))
    return

'''
优化1：某一趟遍历如果没有数据交换，则说明已经排好序了，因此不用再进行迭代了。
用一个标记记录这个状态即可。
'''
def bubble_sort2(a_list):
    n = len(a_list)
    for i in range(n):
        flag = 1
        for j in range(1, n-i):
            if a_list[j-1] > a_list[j]:
                a_list[j-1], a_list[j] = a_list[j], a_list[j-1]
                flag = 0
        print "count:%d  array=%s" %(i, str(a_list))
        if flag: break
    return

'''
优化2：记录某次遍历时最后发生数据交换的位置，这个位置之后的数据显然已经有序了。
因此通过记录最后发生数据交换的位置就可以确定下次循环的范围了。
'''
def bubble_sort3(a_list):
    n = len(a_list)
    k = n
    for i in range(n):  #outer layer
        flag = 1
        for j in range(1, n-i):
            if a_list[j-1] > a_list[j]:
                a_list[j-1], a_list[j] = a_list[j], a_list[j-1]
                k = j
                flag = 0
        print "count:%d  array=%s" %(i, str(a_list))
        if flag: break
    return

print '-'*20+"bubble_sort"+'-'*20
li = [5, 3, 8, 7, 2, 6, 9]
print li
bubble_sort(li)

print '-'*20+"bubble_sort2"+'-'*20
#li = [5, 3, 8, 7, 2, 6, 1]
li = [1,2,3,4,5,6,7,8]
print li
bubble_sort2(li)

print '-'*20+"bubble_sort3"+'-'*20
li = [5, 3, 8, 7, 2, 6, 9]
print li
bubble_sort3(li)








