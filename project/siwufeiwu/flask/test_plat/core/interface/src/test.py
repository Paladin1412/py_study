# -*- coding:utf-8 -*-
import sys,json
reload(sys)  
sys.setdefaultencoding('utf8')   
import requests as r
url='http://qa.engine.ka.163.com/mf/yr'
data={"phone_num":15210976187,"pwd":111111,"device":""}
data3={
	"id": "AD163_14600863088812443",
	"is_test": "false",
	"device": {
		"os": "Android",
		"network_status": "wifi",
		"idfa": "f8d89e2732f4422xxx9dssddd33ssss3c1b111",
		"idfa_enc": "MD5",
		"udid": "",
		"udid_enc": "MD5",
		"imei": "f8d89e2732f442294a46a4ae2ef73c2b",
		"imei_enc": "MD5",
		"mac": "",
		"mac_enc": "MD5"
	},
	"adunit": {
		"space_id": "697",
		"app": "网易新闻客户端",
		"platform": "IOS",
		"category": "",
		"location": "41",
		"style": "3"
	},
	"geo": {
		"ip": "218.203.223.255",
		"province": "北京市",
		"city": "北京市",
		"latitude": "24.2",
		"longitude": "15.5"
	}
}
s1=json.dumps(data)
data1=json.loads(s1)
print r.post(url,json=data3).text
try:
	s = aa
except Exception,e:
	print e
# print type(s.status_code)
# print s.text
