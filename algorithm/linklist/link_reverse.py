#!/usr/bin/env python
#-*- coding: UTF-8 -*-

class Node(object):
    def __init__(self, data, p=0):
        self.data = data
        self.next = p


class Linklist(object):
    def __init__(self):
        self.head = 0
        self.size = 0

    def inititial(self):
        print 'input numbers: (! to quit)'

        try:
            data = raw_input()
            if data is not '!':
                self.head = Node(int(data))
                self.size += 1
            p = self.head
            while data != '!':
                data = raw_input()
                if data == '!': break
                p.next = Node(int(data))
                p = p.next
                self.size += 1
        except ValueError:
            print 'input value error'
        finally:
            print 'input over'

    def init_list(self):
        print 'input size numbers: '

        try:
            size = int(raw_input())
            self.size = size
            self.head = Node(1)
            p = self.head
            for i in range(2,size+1):
                p.next = Node(i)
                p = p.next
        except ValueError:
            print 'input value error'
        finally:
            print 'input over'

    def print_list(self):
        if self.size == 0: print None
        p = self.head
        print 'size:%d values:%s' % (self.size, self.head.data),

        while p.next != 0:
            print p.next.data,
            p = p.next
        print ''

    def revers(self):
        p = self.head
        nex = self.head.next
        pre = Node(0)

        while self.head.next != 0:
            nex = self.head.next
            self.head.next = pre
            pre = self.head
            self.head = nex
        self.head.next = pre
        pre = self.head

        print 'print revers: ',
        while pre.next != 0:
            print pre.data,
            pre = pre.next

if __name__ == '__main__':
    ll = Linklist()
    ll.init_list()
    ll.print_list()
    ll.revers()






