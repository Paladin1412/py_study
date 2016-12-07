#!/usr/bin/env python
#-*- coding: UTF-8 -*-

import traceback

'''
介绍：
堆排序在 top K 问题中使用比较频繁。堆排序是采用二叉堆的数据结构来实现的，虽然实质上还是一维数组。二叉堆是一个近似完全二叉树 。

二叉堆具有以下性质：
父节点的键值总是大于或等于（小于或等于）任何一个子节点的键值。
每个节点的左右子树都是一个二叉堆（都是最大堆或最小堆）。

步骤：
1.构造最大堆（Build_Max_Heap）：若数组下标范围为0~n，考虑到单独一个元素是大根堆，则从下标n/2开始的元素均为大根堆。于是只要从n/2-1开始，向前依次构造大根堆，这样就能保证，构造到某个节点时，它的左右子树都已经是大根堆。
2.堆排序（HeapSort）：由于堆是用数组模拟的。得到一个大根堆后，数组内部并不是有序的。因此需要将堆化数组有序化。思想是移除根节点，并做最大堆调整的递归运算。第一次将heap[0]与heap[n-1]交换，再对heap[0...n-2]做最大堆调整。第二次将heap[0]与heap[n-2]交换，再对heap[0...n-3]做最大堆调整。重复该操作直至heap[0]和heap[1]交换。由于每次都是将最大的数并入到后面的有序区间，故操作完后整个数组就是有序的了。
3.最大堆调整（Max_Heapify）：该方法是提供给上述两个过程调用的。目的是将堆的末端子节点作调整，使得子节点永远小于父节点 。
'''

def heap_sort(arr):
    n = len(arr)
    first = int(n/2 -1)
    for start in range(first, -1, -1):
        adjust_heap(arr, start, n-1)
    #traceback.print_exc()
    for end in range(n-1, 0, -1):
        arr[end], arr[0] = arr[0], arr[end]
        adjust_heap(arr, 0, end-1)
    return arr

def adjust_heap(arr, start, end):
    root = start
    while True:
        child = root*2 + 1
        if child > end: break
        if child+1 <= end and arr[child] < arr[child+1]:
            child += 1
        if arr[root] < arr[child]:
            arr[root], arr[child] = arr[child], arr[root]
            root = child
        else:
            break

print '-'*40
li = [13 ,14, 94, 33, 82, 25, 59, 94, 65, 23, 45, 27, 73, 25, 39, 10]
print li
heap_sort(li)
print li

