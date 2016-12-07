#!/usr/bin/env python
#-*- coding: UTF-8 -*-


'''
介绍：

插入排序的工作原理是，对于每个未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

步骤：

从第一个元素开始，该元素可以认为已经被排序
取出下一个元素，在已经排序的元素序列中从后向前扫描
如果被扫描的元素（已排序）大于新元素，将该元素后移一位
重复步骤3，直到找到已排序的元素小于或者等于新元素的位置
将新元素插入到该位置后
重复步骤2~5
'''
def insert_sort(arr):
    n = len(arr)
    for i in range(1, n):
        if arr[i] < arr[i-1]:
            tmp = arr[i]
            idx = i #待插入的下标
            for j in range(i-1, -1, -1): #从i-1 循环到 0 (包括0)
                if arr[j] > tmp:
                    arr[j+1] = arr[j]
                    idx = j #记录待插入下标
                else:
                    break
            arr[idx] = tmp
        print "count %d: %s" % (i, str(arr))
    return arr

print '-'*40
li = [5, 3, 8, 7, 2, 6, 9]
print li
insert_sort(li)

