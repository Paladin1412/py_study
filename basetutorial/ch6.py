#!/usr/bin/env python 

def fun(x):
    'just for test'
    return x ** x
print fun.__doc__

def fac1(n):
    result = n
    for i in range(1, n):
        result *= i
    return result

def fac2(n):
    if n == 1:
        return 1
    else:
        return n * fac2(n - 1)

def power(x, n):
    result = 1
    for i in range(n):
        result *= x
    return result

def power2(x, n):
    if n == 0:
        return 1
    else: 
        return x * power2(x, n - 1)

print fac1(8)
print fac2(8)
print power(2, 3)
print power2(2, 3)

def search(seq, num, lower, upper):
    if lower == upper:
        assert num == seq[upper]
        return upper
    else:
        mid = (lower + upper) / 2
        if num > seq[mid]:
            return search(seq, num, mid + 1, upper)
        else:
            return search(seq, num, lower, mid)


seq = [24, 65, 66, 88, 12, 99]
seq.sort()
print seq
print search(seq, 88, 0, len(seq) - 1)


import functools
print map(str, range(10))
print [x for x in ['foo', 'x41', '?!', '***'] if x.isalnum()]
print filter(lambda x: x.isalnum(), ['foo', 'x41', '?!', '***'])

