#coding=utf8
import sys
reload(sys)  
sys.setdefaultencoding('utf8') 
def check_res(res_chk,res):
	res_chk=res_chk.split(';')
	for chk in res_chk:
		if chk in res:
			continue
		else:
			return 'error,%s和预期结果不符'%chk
	return 'ok,检查结果通过'
def res_format(res):
	return res.replace('":"','=').replace('":','=')


if __name__ == '__main__':
	res='{"organization":{"organization_logo":"http://www.buka.tv/file/logo/c660d85e89c2a40faea6f487e4a2347b.png","organization_id":13,"organization_url":"sdf3453","organization_room_max_user_num":30,"organization_admin_name":"小鱼","organization_account":"ysm","organization_profile":"refdsfg","organization_landline":"32423443","organization_phone_num":"15210976187","organization_name":"直播时代的视频技术","organization_email":"1232324@qq.com"},"token":"c30789c36d53c603b4972d9ccfac6dcd"}'
	res_chk='organization_logo=http://www.buka.tv/file/logo/c660d85e89c2a40faea6f487e4a2347b.png;organization_admin_name=小鱼;organization_id=13'
	print check_res(res_chk, res)