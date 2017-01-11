# coding=utf-8
from core.product.models import *
from core.interface.models import *
def get_dev_name(interface_name):
	return Interface.objects.get(name=interface_name).developer
def get_userid(user_name):
	return ZtUser.objects.get(realname=user_name).id
def get_ztproduct_id(prodcut_id):
	product_name = Product.objects.get(pk=prodcut_id).product_name
	return ZtProduct.objects.get(name=product_name).id
def get_project_id(prodcut_id):
	product_name = Product.objects.get(pk=prodcut_id).product_name
	return ZtProject.objects.get(name=product_name).id
def get_ztmodule_id(module_id):
	module_name = Modules.objects.get(module_name=module_id)
	return ZtModule.objects.get(name=module_name).id