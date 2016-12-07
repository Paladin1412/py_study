#!/usr/bin/env python
#-*- coding: UTF-8 -*-


'''
介绍：

选择排序无疑是最简单直观的排序。它的工作原理如下。
步骤：
在未排序序列中找到最小（大）元素，存放到排序序列的起始位置。
再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。
以此类推，直到所有元素均排序完毕。
'''
def select_sort(arr):
    n = len(arr)
    for i in range(0, n):
        _min = i
        for j in range(i+1, n):
            if arr[j] < arr[_min]:
                _min = j
        arr[_min], arr[i] = arr[i], arr[_min]
        print "count %d: %s" % (i, str(arr))
    return arr

print '-'*40
li = [5, 3, 8, 7, 2, 6, 9]
print li
select_sort(li)

