#!/usr/bin/env python
#-*- coding: UTF-8 -*-

'''
介绍：
快速排序通常明显比同为Ο(n log n)的其他算法更快，因此常被采用，而且快排采用了分治法的思想，所以在很多笔试面试中能经常看到快排的影子。可见掌握快排的重要性。

步骤：

从数列中挑出一个元素作为基准数。
分区过程，将比基准数大的放到右边，小于或等于它的数都放到左边。
再对左右区间递归执行第二步，直至各区间只有一个数。
'''


def quick_sort(arr):
    return qsort(arr, 0, len(arr)-1)

def qsort(arr, left, right):
    if left >= right: return arr
    key = arr[left]
    lp = left
    rp = right
    while lp < rp:
        while arr[rp] >= key and lp < rp:
            rp -= 1
        while arr[lp] <= key and lp < rp:
            lp += 1
        arr[lp], arr[rp] = arr[rp], arr[lp]
    arr[left], arr[lp] = arr[lp], arr[left]
    qsort(arr, left, lp-1)
    qsort(arr, rp+1, right)
    print arr
    return arr

print '-'*20+"quick_sort"+'-'*20
li = [5, 3, 8, 7, 2, 6, 9]
print li
arr = quick_sort(li)
print arr







