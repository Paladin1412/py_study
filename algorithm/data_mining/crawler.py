#!/usr/bin/python
# -*- coding: UTF-8 -*-

import urllib
import webbrowser as web
import shutil
import os
import pprint
import sys
import re

#一篇文章的简单过滤
'''
a_str = '<a title="" target="_blank" href="http://blog.sina.com.cn/s/blog_4701280b0102eck1.html">东望洋</a>'
re_match = re.search(r'href="(.+)"', a_str)
uri = re_match.group(1)
content = urllib.urlopen(uri).read()
filename = uri.split('/')[len(uri.split('/')) - 1]
open(filename, 'wb').write(content)
web.open_new_tab(filename)
'''

'''
#一页的所有文章的过滤
uri = 'http://blog.sina.com.cn/s/articlelist_1191258123_0_1.html'
con = urllib.urlopen(uri).read()
re_pattern = re.compile(r'<a title=.+href="(.+.html)">')
tags_a = re_pattern.findall(con)
print '当前页总共有 ' + str(len(tags_a)) + ' 篇博文'
#pprint.pprint(tags_a)

save_path = os.path.join(os.getcwd(), 'test') #os.sep = '\'
if (not os.path.exists(save_path)) or (not os.path.isdir(save_path)):
    os.mkdir(save_path)
    #os.chdir(save_path)
else:
    #os.rmdir(save_path)
    #os.system('rd /S /Q path')
    shutil.rmtree(save_path)
    #os.mkdir(save_path)
    os.makedirs(save_path)

article_num = 0
for i in tags_a:
    filename = i.split('/')[len(i.split('/')) - 1]
    filename = os.path.join(save_path, filename)
    content = urllib.urlopen(i).read()
    open(filename, 'wb').write(content)
    #web.open_new_tab(filename)
    article_num += 1
    print "第%2d篇博文爬取完毕: %s" % (article_num, filename)
    
#os._exit(1)
sys.exit()
'''

#所有页的所有文章的过滤
def one_page_crawler(uri, page_num, des_path):
    con = urllib.urlopen(uri).read()
    re_pattern = re.compile(r'<a title=.+href="(.+.html)">')
    tags_a = re_pattern.findall(con)
    print '\n第%d页总共有%2d篇博文' % (page_num, len(tags_a))
    article_num = 0
    for i in tags_a:
        filename = os.path.basename(i)  #i.split('/')[len(i.split('/')) - 1]  os.path.dirname(uri)
        filename = os.path.join(des_path, filename)
        content = urllib.urlopen(i).read()
        open(filename, 'wb').write(content)
        article_num += 1
        print "第%2d篇博文爬取完毕: %s" % (article_num, filename)
    return 0

if __name__ == '__main__':
    save_path = os.path.join(os.getcwd(), 'test') 
    if (not os.path.exists(save_path)) or (not os.path.isdir(save_path)):
        os.mkdir(save_path)
    else:
        shutil.rmtree(save_path)
        os.makedirs(save_path)

    total_page = 7
    for i in range(1, total_page + 1):
        uri = 'http://blog.sina.com.cn/s/articlelist_1191258123_0_%s.html' % (str(i))
        one_page_crawler(uri, i, save_path)
    print '---------------end-------------------'
        






