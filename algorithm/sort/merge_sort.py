#!/usr/bin/env python
#-*- coding: UTF-8 -*-


'''
介绍：
归并排序是采用分治法的一个非常典型的应用。归并排序的思想就是先递归分解数组，再合并数组。
先考虑合并两个有序数组，基本思路是比较两个数组的最前面的数，谁小就先取谁，取了后相应的指针就往后移一位。然后再比较，直至一个数组为空，最后把另一个数组的剩余部分复制过来即可。
再考虑递归分解，基本思路是将数组分解成left和right，如果这两个数组内部数据是有序的，那么就可以用上面合并数组的方法将这两个数组合并排序。如何让这两个数组内部是有序的？可以再二分，直至分解出的小组只含有一个元素时为止，此时认为该小组内部已有序。然后合并排序相邻二个小组即可。
'''

def merge_sort(arr):
    if len(arr) <=1 : return arr
    spot = int(len(arr)/2)
    left = merge_sort(arr[:spot])
    right = merge_sort(arr[spot:])
    print "left: %s, right: %s" % (str(left), str(right))
    return merge(left, right)

def merge(left, right):
    l,r = 0, 0
    result = []
    while l<len(left) and r<len(right):
        if left[l] < right[r]:
            result.append(left[l])
            l += 1
        else:
            result.append(right[r])
            r += 1
    result += left[l:]
    result += right[r:]
    return result

print '-'*40
li = [5, 3, 8, 7, 2, 6, 9, 1, 4, 15, 32, 12, 17]
li = [13 ,14, 94, 33, 82, 25, 59, 94, 65, 23, 45, 27, 73, 25, 39, 10]
print li
merge_sort(li)

