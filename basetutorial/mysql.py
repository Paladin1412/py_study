#!/usr/bin/env python

import MySQLdb
import sys
import os


try:
    #conn = MySQLdb.connect(host='172.30.17.2', user='admin', db='folio', passwd='admin', port=3306)
    conn = MySQLdb.connect(host='172.30.2.10', user='se', db='homelink_mobile', passwd='123456', port=6606)
    cur = conn.cursor()
    cur.execute("SELECT DISTINCT devId,userCode FROM mobileapi_login WHERE channel='link' AND devId!='unknown'")
    rows = cur.fetchall()
    for recode in rows:
        print recode
    cur.close()
    conn.commit()
    conn.close()
except Exception, e:
    print e
    sys.exit()

