# coding=utf-8
from django.shortcuts import render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from models import *
from django.views.generic import ListView
from core.product.models import Product,Modules
from core.adminlte.views import *
from django.shortcuts import render
from django.db.models import Q
from core.interface.result_view import getpagelist



# Create your views here.
def product(req):
    product = Product.objects.all()
    return render(req, 'product.html', {'products': product})

def product_new(req):
    if req.method == 'GET':
        return render(req, 'product_new.html', '')
    else:
        if req.POST['name'] != '':
            product_name = req.POST['name']
            p = Product()
            p.product_name = product_name
            p.save()
            return HttpResponseRedirect('/product/module_list/')
        else:
            error = '产品名称不能为空！'
            return render(req, 'product_new.html', {'error': error})

def getModulelist(request):
    product_filter_status = True
    product_name_list = Product.objects.filter(Q(status=product_filter_status))
    try:
        module = request.GET.get('module_name')
        product = request.GET.get('product_id')
    except:
        module = ''
        product = ''
    object_list = Modules.objects.all()

    if module:
        object_list = object_list.filter(Q(module_name__icontains=module))
    if product:
        object_list = object_list.filter(Q(product_id=product))
    page_dic = getpagelist(request, object_list)
    return render(request, 'modules_list.html',{'pages': page_dic['pages'], 'perpage': page_dic['perpage'], 'productlist': product_name_list})

def create_module(req):
    if req.method == 'POST':
        try:
            moduleid = req.POST['moduleid']
        except:
            moduleid = ''
        try:
            product_id = req.POST['product_id']
            module_name = req.POST['module_name']
            module_detail = req.POST['module_detail']
        except:
            raise HTTP404
        if moduleid:
            module = Modules.objects.get(id=moduleid)
            module.module_name =module_name
            module.module_detail = module_detail
            module.product_id = product_id

        else:
            module = Modules()
            module.module_name = module_name
            module.module_detail = module_detail
            module.product_id = product_id
        module.save()

        return HttpResponseRedirect('/product/module_list/')
    else:
        product_list = Product.objects.all()
        return render(req, 'module_add.html', {'product_list': product_list})

def deleteModules(req):
    try:
        delete_ifid_list = req.GET.get('moduleid')
        for item in delete_ifid_list.split(','):
            if item:
                modules = Modules.objects.get(id=int(item))
                modules.delete()
        delete_error = '操作成功'
    except:
        delete_error = '操作失败'

    return HttpResponseRedirect('/product/module_list?error=' + str(delete_error))

def editModules(req):
    try:
        edit_id = req.GET.get('moduleid')
    except:
        edit_id = ''

    product_list = Product.objects.all()
    module = Modules.objects.get(id=int(edit_id))

    return render(req,'module_add.html',{'module': module, 'product_list':product_list})