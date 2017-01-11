# coding=utf-8
from django.http import HttpResponse,HttpResponseRedirect
from core.interface.models import Interface,Testcase
from core.product.models import Product,Modules
from django.shortcuts import render
from django.db.models import Q
from core.adminlte.constants import InterfaceLevel,TestcaseLevel,HttpMothod
from django.shortcuts import get_object_or_404
from django.http import Http404
import json
from core.interface.result_view import getpagelist

__author__ = 'wangxiaoni'

def createInterface(request):
     product_filter_status = True
     module_filter_status = True
     if request.method == "POST":
          try:
               interfaceid = request.POST['interfaceid']
          except:
               interfaceid = ''
          try:
               name = request.POST['name']
               detail = request.POST['detail']
               req_url = request.POST['req_url']
               reqmethod = request.POST['req_method']
               product_id = request.POST['product_id']
               module_id = request.POST['module_id']
               level = request.POST['level']
               headername = request.POST.get('headername').encode('utf-8')
               headervalue = request.POST.get('headervalue').encode('utf-8')
               is_json = str(request.POST.get('is_json'))
               if headername and headervalue:
                    paraheader = str(dict({headername:headervalue}))
               else:
                    paraheader = ''

               if is_json.find('True') > -1:
                    para_data = request.POST['para_data']
                    is_json = True
               else:
                    is_json = False
                    paraname = [item.encode('utf-8') for item in request.POST.getlist('param_name')]
                    paravalue = map(filtervalue, [item.encode('utf-8') for item in request.POST.getlist('param_value')])

                    para_value_pairs = zip(paraname, paravalue)
                    para_data = json.dumps({para: value for para, value in para_value_pairs if para and value})

          except:
               raise Http404

          if interfaceid:
               interface = Interface.objects.get(id=interfaceid)
               interface.name = name
               interface.detail = detail
               interface.req_url = req_url
               interface.reqmethod = reqmethod
               interface.product_id = product_id
               interface.module_id = module_id
               interface.is_json = is_json
               interface.reqheader = paraheader
               interface.level = level
               interface.developer = int(1001)
               interface.default_param = str(para_data)

          else:
               interface = Interface.objects.create(
                    name=name,
                    detail=detail,
                    req_url=req_url,
                    reqmethod=reqmethod,
                    product_id=product_id,
                    module_id=module_id,
                    reqheader=paraheader,
                    is_json=is_json,
                    level=level,
                    developer=int(1001),
                    default_param=str(para_data))
          interface.save()
          return HttpResponseRedirect('/interface/list/')
     else:
          iflevellist = InterfaceLevel.CHOICES
          httpmethods = HttpMothod.CHOICES
          productlist = Product.objects.filter(Q(status=product_filter_status))
          modulelist = Modules.objects.filter(Q(status=module_filter_status))

     return render(request, 'interface_new.html',{'iflevellist':iflevellist,'httpmethods':httpmethods,'productlist':productlist,'modulelist':modulelist})

def filtervalue(input):
     if input.find("'")>-1 :
          return  input.strip("'")
     if input.find('"')>-1 :
          return input.strip('"')
     if input.isdigit() and ( input.find("'")<=-1 or input.find('"')<=-1):
          return eval(input)
     else:
          return input

def createTestCase(request):
     if request.method == "POST":
          try:
               testcaseid = request.POST.get('testcaseid')
          except:
               testcaseid = ''
          try:
               interfaceid = request.POST.get('interfaceid')

               case_name = request.POST.get('case_name')
               selectzento = request.POST.get('selectzento')
               case_detail = request.POST.get('case_detail')
               level = request.POST.get('level')
               is_smoke = str(request.POST.get('is_smoke'))
               if is_smoke.find('True') > -1:
                    is_smoke = True
               else:
                    is_smoke = False
               code_check = request.POST.get('code_check')
               res_check = request.POST.get('res_check')
               init_sql = request.POST.get('init_sql')
               delete_sql = request.POST.get('delete_sql')


               interface = Interface.objects.get(id=interfaceid)

               if interface.is_json:
                    para_data = request.POST.get('para_data')

               else:
                    paraname = [item.encode('utf-8') for item in request.POST.getlist('param_name')]
                    paravalue = map(filtervalue,[ item.encode('utf-8') for item in request.POST.getlist('param_value')])

                    para_value_pairs = zip(paraname, paravalue)
                    para_data = json.dumps({para:value for para, value in para_value_pairs if para and value})

               if testcaseid:
                    testcase = Testcase.objects.get(id=testcaseid)
                    # ----start
                    # 待完善interface_id,created_by
                    testcase.case_name = case_name
                    testcase.zento_bug_id = selectzento
                    testcase.case_detail = case_detail
                    testcase.level = level
                    testcase.is_smoke = is_smoke
                    testcase.code_check = code_check
                    testcase.res_check = res_check
                    testcase.init_sql = init_sql
                    testcase.delete_sql = delete_sql
                    testcase.modify_param = str(para_data)

               else:
                    testcase = Testcase.objects.create(
                    #----start
                    # 待完善interface_id,created_by
                    interface_id=int(interfaceid),
                    created_by=int(100),
                    #--end
                    case_name=case_name,
                    zento_bug_id=selectzento,
                    case_detail=case_detail,
                    level=level,
                    is_smoke=is_smoke,
                    code_check=code_check,
                    res_check=res_check,
                    init_sql=init_sql,
                    delete_sql=delete_sql,
                    modify_param=str(para_data))

               testcase.save()

               return HttpResponseRedirect('/interface/tclist/interface'+str(interfaceid))

          except:
               adderror = 1
               raise Http404
     else:
          tclevellist = TestcaseLevel.CHOICES
          httpmethods = HttpMothod.CHOICES
          try:
               interfaceid = request.GET.get('interfaceid')
               reqmethod = int(request.GET.get('reqmethod'))
          except:
               raise Http404

          interface = Interface.objects.get(id=interfaceid)

          if interface.is_json:
               parastr = interface.default_param
               return render(request, 'testcase_new.html',
                             {'tclevellist': tclevellist, 'parastr':parastr,'interface': interface, 'reqmethod': reqmethod,'httpmethods': httpmethods})
          else:
               paradict = eval(interface.default_param)
               return render(request, 'testcase_new.html', {'tclevellist':tclevellist,'paradict':paradict,'interface':interface,'reqmethod':reqmethod,'httpmethods':httpmethods})


def deleteInterface(request):
     try:
          delete_ifid_list = request.POST.get('interfaceid')
          for item in delete_ifid_list.split(','):
               if item:
                    interface = Interface.objects.get(id=int(item))
                    interface.delete()
          delete_error = '操作成功'
     except:
          delete_error = '操作失败'

     return HttpResponse(json.dumps({'error': delete_error}), content_type="application/json")

def deleteTestcase(request):
     interfaceid = ''
     try:
          delete_tcid_list = request.POST.get('testcaseid')
          for item in delete_tcid_list.split(','):
               if item:
                    testcase = Testcase.objects.get(id=int(item))
                    interfaceid = testcase.interface_id
                    testcase.delete()
          delete_error = '操作成功'
     except:
          delete_error = '操作失败'

     return HttpResponse(json.dumps({'error': delete_error, 'interfaceid': interfaceid}),content_type="application/json")


def getInterfacelist(request):
     product_filter_status = True
     productlist = Product.objects.filter(Q(status=product_filter_status))
     levelchoices = InterfaceLevel.CHOICES
     try:
          name = request.GET.get('name')
          producid = request.GET.get('producid')
          level = request.GET.get('level')
     except:
          name = ''
          producid = ''
          level = ''

     object_list = Interface.objects.all()

     if name or level:
          object_list = object_list.filter(Q(name__icontains=name) & Q(level__icontains=level))
     if producid:
          object_list = object_list.filter(Q(product_id=producid))

     page_dic = getpagelist(request,object_list)

     return render(request, 'interface_list.html',{'pages': page_dic['pages'],'perpage':page_dic['perpage'],'productlist':productlist,'levelchoices':levelchoices})

def  editInterface(request):
     product_filter_status = True
     module_filter_status = True
     try:
          id = request.GET.get('interfaceid')
          interface = get_object_or_404(Interface, pk=id)
     except interface.DoesNotExist:
          raise Http404
     iflevellist = InterfaceLevel.CHOICES
     httpmethods = HttpMothod.CHOICES
     productlist = Product.objects.filter(Q(status=product_filter_status))
     modulelist = Modules.objects.filter(Q(status=module_filter_status))

     if interface.is_json:
          parastr = interface.default_param
          return render(request, 'interface_new.html',
                        {'iflevellist': iflevellist, 'httpmethods': httpmethods, 'productlist': productlist,'parastr': parastr, 'interface': interface,'modulelist':modulelist})

     else:
          paradict = eval(interface.default_param)
          return render(request, 'interface_new.html',
                        {'iflevellist': iflevellist, 'httpmethods': httpmethods, 'productlist': productlist,'paradict': paradict, 'interface': interface,'modulelist':modulelist})

def editTestcase(request):

     tclevellist = TestcaseLevel.CHOICES

     try:
          id = request.GET.get('testcaseid')
          reqmethod = request.GET.get('reqmethod')
          testcase = get_object_or_404(Testcase, pk=id)
     except testcase.DoesNotExist:
          raise Http404
     interfaceid = testcase.interface_id
     interface = Interface.objects.get(id=interfaceid)


     if interface.is_json:
          parastr = testcase.modify_param
          return render(request, 'testcase_new.html',
                        {'interface': interface, 'testcase': testcase, 'parastr':parastr,'tclevellist': tclevellist,'reqmethod': reqmethod})
     else:
          paradict = eval(testcase.modify_param)

          return render(request, 'testcase_new.html',
                   {'interface': interface, 'testcase': testcase, 'paradict':paradict,'tclevellist': tclevellist,'reqmethod':reqmethod})


def get_tclist_byifid(request,id):
     try:
          case_name = request.GET.get('case_name').strip()
          case_id = request.GET.get('case_id').strip()
     except:
          case_name = ''
          case_id = ''
          reqmethod = ''

     object_list = Testcase.objects.all()

     if id:
          interface = Interface.objects.get(id=id)
          reqmethod = interface.reqmethod
          object_list = object_list.filter(Q(interface_id=id))
     if case_name:
          object_list = object_list.filter(Q(case_name__icontains=case_name))
     elif case_id:
          object_list = object_list.filter(Q(id__icontains=case_id))

     page_dic = getpagelist(request, object_list)

     return render(request, 'testcase_list.html', {'pages': page_dic['pages'],'perpage':page_dic['perpage'], 'interfaceid': id,'reqmethod':reqmethod})

def getModules(request):
     module_list=[]
     try :
          productid = request.GET.get('productid').strip()
     except:
          error = '参数错误'
     modules = Modules.objects.filter(product_id=productid)
     if len(modules)>0:
          for module in modules:
               module_list.append({'id':module.id, 'name':module.module_name})
     return HttpResponse(json.dumps({'module_list':module_list}),content_type="application/json")
