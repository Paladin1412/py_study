#!/usr/bin/env python
# -*- coding: utf-8 -*-


from sympy import * 

x = Symbol('x')
pprint(Integral(sqrt(1/x), x))
pprint(Integral(sqrt(1/x), x), use_unicode=False)
print pretty(Integral(sqrt(1/x), x), use_unicode=True)
pprint(x*(sqrt(x**2 + 1) - x), use_unicode=True)

print '-'*40

#x = Symbol('x')
#y = Symbol('y')
x,y = symbols('x y')
print solve([2 * x - y - 3, 3 * x + y - 7], [x,y])

x = Symbol('x')
print '-'*40
exp = 1/x**2
pprint(Limit(exp, x, 0), use_unicode=True)
print "result: %s" % str(limit(exp, x, 0))

print '-'*40
exp = x * (sqrt(x ** 2 + 1) - x)
pprint(Limit(exp, x, oo), use_unicode=True)
print "result: %s" % str(limit(exp, x, oo))


n = Symbol('n')
exp = ((n+3)/(n+2))**n
print '-'*40
pprint(Limit(exp, n, oo), use_unicode=True)
print "result: %s" % str(limit(exp, n, oo))


print '-'*40
pprint(Integral(6*x**5, x), use_unicode=True)
print "result: %s" % str(integrate(6*x**5, x))

print '-'*40
pprint(Integral(cos(x), x), use_unicode=True)
print "result: %s" % str(integrate(cos(x), x))

print '-'*40
t, x = symbols('t x')
pprint(Integral( Integral(sin(t)/(pi-t), (t,0,x)), (x,0,pi) ), use_unicode=True)
print "result: %s" % str(integrate(integrate(sin(t)/(pi-t), (t,0,x)), (x,0,pi)))

print '-'*40
x = Symbol('x')
f = Function('f')
exp = diff(f(x),x) - 2*f(x)*x
pprint(exp)
print "result: %s" % str(dsolve(exp, f(x)))


print '-'*40
x1,x2,x3 = symbols('x1 x2 x3')
a11,a12,a13,a22,a23,a33 = symbols('a11 a12 a13 a22 a23 a33')
m = Matrix([[x1, x2, x3]])
n = Matrix([[a11, a12, a13], [a12, a22, a23], [a13, a23, a33]])
v = Matrix([[x1], [x2], [x3]])
f = m * n * v
print pretty(n)  
pprint(f)
print f[0].subs({x1:1, x2:1, x3:1})
