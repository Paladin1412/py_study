#!/usr/bin/env python
#-*- coding: UTF-8 -*-

def half_search(arr, char):
    left = 0
    right = len(arr) -1
    for i in range(right/2 + 1):
        if left > right:
            return -1
        mid = (left + right) / 2
        if arr[mid] == char:
            return mid
        elif arr[mid] > char:
            right = mid - 1
        else:
            left = mid + 1

arr = [20, 30, 40, 50, 60, 70, 80, 90, 100]
print arr
print half_search(arr, 60)
print half_search(arr, 10)
print half_search(arr, 65)
print half_search(arr, 90)


