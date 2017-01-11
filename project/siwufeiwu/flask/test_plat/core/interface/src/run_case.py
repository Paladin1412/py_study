#coding = utf-8
import requests,sys,json
from tools import *
from core.result.models import Res
from coon_mysql import run_sql
from check_res import check_res
from core.adminlte.constants import TestcaseRes
reload(sys)  
sys.setdefaultencoding('utf8') 
class RunCase(object):
	"""docstring for run_case"""
	def __init__(self, case_id,porduct_id,module_id,method,interface_name,case_detail,
		req_url,req_param,res_code_chk,res_chk,json_flag=False,init_sql='',delete_sql='',is_smoke=False):
		self.case_id = case_id
		self.porduct_id = porduct_id
		self.module_id = module_id
		self.method = method
		self.interface_name = interface_name
		self.case_detail = case_detail
		self.req_url = req_url
		self.req_param = req_param
		self.res_code_chk = res_code_chk
		self.res_chk = res_chk
		self.json_flag = json_flag
		self.init_sql = init_sql
		self.delete_sql = delete_sql
		# self.tester = tester
		# self.developer = developer
		self.is_smoke = is_smoke
	def run_case(self,addcaseset):
		return_res = {'passresid':'','failresid':''}
		if self.init_sql !='':
			p=run_sql(host='10.164.96.205',user='root',passwd='123456',db='adcpm',
				sql=self.init_sql)
			sql_res=p.coon_db()
			if 'error' in sql_res:
				fail_case=Testcase.objects.get(id=self.case_id)
				fail_case.caseresult = TestcaseRes.FAIL
				sql_err_res=Res.objects.create(case_id=self.case_id,response=sql_res,res_status=TestcaseRes.FAIL,product_id=self.porduct_id,module_id=self.module_id,elapsed_time='0')
				if addcaseset:
					sql_err_res.caseset_id = int(addcaseset)
					print "caseset is %s"%addcaseset
				sql_err_res.save()
				return_res['failresid']+= str(sql_err_res.id)+','
				return return_res
		if self.method == 1:
			try:
				if self.json_flag==False:
					res=requests.get(self.req_url,json.loads(self.req_param))
				else:
					res=requests.get(self.req_url,json=json.loads(self.req_param))
			except Exception,e:
				res_text = e
				res_code = 999
			else:
				res_code = res.status_code
				res_text = res.text
		elif self.method==2:
			try:
				if self.json_flag==False:
					res=requests.post(self.req_url,json.loads(self.req_param))
				else:
					res=requests.post(self.req_url,json=json.loads(self.req_param))
			except Exception,e:
				res_text = e
				res_code = 999
			else:
				res_code = res.status_code
				res_text = res.text
		result = Res.objects.create(case_id=self.case_id,response=res_text,
					 product_id=self.porduct_id,module_id=self.module_id,elapsed_time='0')
		case = Testcase.objects.get(pk=self.case_id)
		case.count+=1
		case.res_id=result.pk
		if self.res_code_chk == res_code and 'ok' in check_res(self.res_chk,res_text):
			case.caseresult = TestcaseRes.PASS
			case.pass_count += 1
			result.res_status = TestcaseRes.PASS
			if addcaseset:
				result.caseset_id = int(addcaseset)
			result.save()
			case.save()
			return_res['passresid'] += str(result.id) + ','
		else:
			case.caseresult = TestcaseRes.FAIL
			case.fail_count += 1
			result.res_status = TestcaseRes.FAIL
			if addcaseset:
				result.caseset_id = int(addcaseset)
				print "caseset is %s" % addcaseset
			result.save()
			case.save()
			return_res['failresid'] += str(result.id) + ','
		# case.updated_time=timezone.now()


		return return_res

'''
if self.delete_sql != '':
	p = run_sql(host='10.164.96.205', user='root', passwd='123456', db='adcpm',
				sql=self.delete_sql)
	sql_res = p.coon_db()
	if 'error' in sql_res:
		fail_case = Testcase.objects.get(id=self.case_id)
		fail_case.caseresult = 2
		sql_err_res = Res(case_id=self.case_id, response=sql_res, res_status='fail', product_id=self.porduct_id,
						  module_id=self.module_id)
		fail_case.res_id = sql_err_res.id
		fail_case.save()
		sql_err_res.save()
		return 'ok'
'''