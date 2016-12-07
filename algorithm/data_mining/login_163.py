#!/usr/bin/python
# -*- coding: UTF-8 -*-

import time
from splinter import Browser

def splinter(url):
    browser = Browser(driver_name="chrome")
    browser.visit(url)
    time.sleep(1)
    browser.find_by_id('userNameIpt').fill('shellsiwufeiwu@163.com')
    browser.find_by_id('pwdInput').fill('shell@623098053')
    browser.find_by_id('btnSubmit').click()
    time.sleep(1)
    #browser.quit()

if __name__ == '__main__':
    uri ='http://email.163.com/#from=ntes_product'
    splinter(uri)





