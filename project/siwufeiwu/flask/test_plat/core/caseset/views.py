# coding=utf-8

from django.shortcuts import render
from django.http import HttpResponse
from core.caseset.models import Caseset,CasesetToTestcase
from core.product.models import Product,Modules
from core.interface.models import Testcase,Interface
from core.result.models import Res
from core.adminlte.constants import EndSheduleTime
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import Http404
from core.interface.result_view import getpagelist
import json,datetime

def getcslistByName(object_list,name):
    relist = []
    for item in object_list:
        if item.set_name.find(name) > -1:
            relist.append(item)
    return relist

def getcslistByProduct(object_list,id):
    relist = []
    for item in object_list:
        if item.product_id == id:
            relist.append(item)
    return relist

def getCasesetList(request):
    product_filter_status = True

    productlist = Product.objects.filter(Q(status=product_filter_status))
    try:
        name = request.GET.get('name').strip()
        producid = request.GET.get('producid').strip()
    except:
        name = ''
        producid = ''

    object_list = Caseset.objects.with_case_count()

    if name:
        object_list = getcslistByName(object_list,name)
    if producid:
        object_list = getcslistByProduct(object_list, int(producid))

    page_dic = getpagelist(request, object_list)

    return render(request, 'caseset_list.html',{'pages': page_dic['pages'], 'perpage': page_dic['perpage'], 'productlist': productlist})

def createCaseset(request):
    product_filter_status = True
    module_filter_status = True
    modulelist = Modules.objects.filter(Q(status=module_filter_status))
    productlist = Product.objects.filter(Q(status=product_filter_status))
    return render(request,'caseset_new.html',{'productlist':productlist,'modulelist':modulelist})

def deleteCaseset(request):
    try:
        delete_csid_list = request.POST.get('casesetid')
        for item in delete_csid_list.split(','):
            if item:
                caseset = Caseset.objects.get(id=int(item))
                cs2tclist = CasesetToTestcase.objects.filter(caseset_id=caseset.id)
                for cs2tc in cs2tclist:
                    cs2tc.delete()
                caseset.delete()
        delete_error = '操作成功'
    except:
        delete_error = '操作失败'
    return HttpResponse(json.dumps({'error': delete_error}), content_type="application/json")

def querytcByCaseSid(request,id):
    tcidlist = []
    ctclist = CasesetToTestcase.objects.filter(Q(caseset_id=id))

    for item in ctclist:
        tcidlist.append(item.testcase_id)
    object_list = Testcase.objects.filter((Q(id__in=tcidlist)))
    page_dic = getpagelist(request, object_list)

    return page_dic

def editCaseset(request):
    product_filter_status = True
    module_filter_status = True
    try:
        id = request.GET.get('casesetid')
        caseset = get_object_or_404(Caseset, pk=id)
        page_dic = querytcByCaseSid(request,caseset.id)

        tcidlistbycaseset = []
        for item in CasesetToTestcase.objects.filter(Q(caseset_id=id)):
            tcidlistbycaseset.append(item.testcase_id)

    except caseset.DoesNotExist:
        raise Http404

    productlist = Product.objects.filter(Q(status=product_filter_status))
    modulelist = Modules.objects.filter(Q(status=module_filter_status))

    return render(request,'caseset_new.html',{'productlist':productlist,'modulelist':modulelist,'caseset':caseset,'pages': page_dic['pages'], 'perpage': page_dic['perpage'],'tcidlist_caseset':tcidlistbycaseset})

def gettcBySearch(request):

    try:
        case_name = request.POST.get('name')
        zento_case_id = request.POST.get('zentoid')
        product_id = request.POST.get('producid')
        module_id = request.POST.get('moduleid')
        smoke= str(request.POST.get('smoke'))
        casesetid = request.POST.get('casesetid').strip()
    except:
        case_name = ''
        zento_case_id = ''
        product_id = ''
        module_id = ''
        is_smoke = ''

    if smoke.find('True') > -1:
        is_smoke = True
    elif smoke.find('False') > -1:
        is_smoke = False
    else:
        is_smoke = ''

    object_list = Testcase.objects.all()

    if product_id:
        interfacelist = []
        interface_list = Interface.objects.filter(Q(product_id=int(product_id)))
        for interface in interface_list:
            interfacelist.append(interface.id)
        object_list = object_list.filter(Q(interface_id__in=interfacelist))
    if case_name:
        object_list = object_list.filter(Q(case_name__icontains=case_name))
    if zento_case_id:
        object_list = object_list.filter(Q(zento_case_id__icontains=zento_case_id))
    if module_id:
        interfacelist = []
        interface_list = Interface.objects.filter(Q(module_id=int(module_id)))
        for interface in interface_list:
            interfacelist.append(interface.id)
        object_list = object_list.filter(Q(interface_id__in=interfacelist))

    if type(is_smoke) == type(True):
        object_list = object_list.filter(Q(is_smoke=is_smoke))

    page_dic = getpagelist(request, object_list)

    if casesetid !='0':
        tclistbycaseset = []
        for item in CasesetToTestcase.objects.filter(Q(caseset_id=casesetid)):
            tclistbycaseset.append(item.testcase_id)
        caseset = Caseset.objects.get(id=casesetid)
        return render(request, 'tclist.html', {'pages': page_dic['pages'], 'perpage': page_dic['perpage'],'caseset':caseset,'tcidlist_caseset':tclistbycaseset})
    else:
        return render(request, 'tclist.html', {'pages': page_dic['pages'], 'perpage': page_dic['perpage']})

def savecaseset(request):
    startcaseset_time = ''
    endcaseset_time = ''
    scheduled_info = ''
    timeformat ="%Y-%m-%d %X"
    is_scheduled = False
    moduleid = None
    productid = None
    scheduled_info = ''
    oldtcidlist=[]
    try:
        tcid = request.POST.get('tclist')
        name = request.POST.get('name')
        detail = request.POST.get('detail')
        scheduled = str(request.POST.get('is_scheduled'))
        casesetid = request.POST.get('casesetid')

        if request.POST.get('moduleid'):
            moduleid = int(request.POST.get('moduleid'))

        if request.POST.get('productid'):
            productid = int(request.POST.get('productid'))

        if scheduled.find("True") > -1:
            is_scheduled = True

            startcaseset_time = datetime.datetime.strptime(request.POST.get('schedule_starttime').strip(),'%Y-%m-%d').strftime('%Y-%m-%d')

            endcaseset_time = request.POST.get('schedule_endtime').encode('utf-8').strip()

            scheduled_radio = request.POST.get('scheduled_radio').encode('utf-8').strip()

            if endcaseset_time.find("unlimited") > -1:
                endcaseset_time = EndSheduleTime

            scheduled_info = startcaseset_time +'||'+scheduled_radio+'||'+endcaseset_time

        tcidlist = tcid.rstrip(",").split(",")
        if casesetid != "0":
            caseset = Caseset.objects.get(id=casesetid)
            caseset.set_name = name
            caseset.set_desc = detail
            caseset.module_id = moduleid
            caseset.product_id = productid
            caseset.scheduled = is_scheduled
            caseset.scheduled_info = scheduled_info
            caseset_testcase_list = CasesetToTestcase.objects.filter(caseset_id=casesetid)
            for caseset_testcase in caseset_testcase_list:
                oldtcidlist.append(str(caseset_testcase.testcase_id))
            for tcid in oldtcidlist:
                if tcid not in tcidlist:
                    cs_tc_list = CasesetToTestcase.objects.filter(Q(caseset_id=casesetid) & Q(testcase_id=tcid))
                    for cs_tc in cs_tc_list:
                        cs_tc.delete()
        else:
            caseset = Caseset.objects.create(
                    set_name=name,
                    set_desc=detail,
                    product_id=productid,
                    module_id=moduleid,
                    scheduled=is_scheduled,
                    scheduled_info=str(scheduled_info))
        caseset.save()
        for tcid in tcidlist:
            if len(CasesetToTestcase.objects.filter(Q(caseset_id=caseset.id)&Q(testcase_id=tcid)))==0:
                caseset_testcase = CasesetToTestcase.objects.create(
                    caseset_id = caseset.id,
                    testcase_id = tcid)
                caseset_testcase.save()
        error = '保存成功'
    except KeyError, e:
        error = '保存失败'

    return HttpResponse(json.dumps({'error': error}), content_type="application/json")

def gettclistBycaseset(request):
    tcidlist = []
    tclist = []
    try:
        csid = request.GET.get('casesetid').encode('utf-8')
    except:
        csid=''
    try:
        csid_post = request.POST.get('casesetid').encode('utf-8')
        csname = request.POST.get('case_name').encode('utf-8')
        zt_bug_id = request.POST.get('zento_case_id').encode('utf-8')
    except:
        csid_post = ''
        csname = ''
        zt_bug_id = ''
    if csid_post:
        csid = csid_post
    if csid:
        cstotc = CasesetToTestcase.objects.filter(caseset_id=int(csid))
        for item in cstotc:
            tcidlist.append(item.testcase_id)
    if tcidlist:
        tclist = Testcase.objects.filter(id__in=tcidlist)
        if tclist and csname:
            tclist = tclist.filter(case_name__icontains=csname)
        if tclist and zt_bug_id:
            tclist = tclist.filter(zento_bug_id__icontains=zt_bug_id)
    page_dic = getpagelist(request, tclist)

    return render(request, 'testcase_list_cs.html', {'pages': page_dic['pages'],'perpage':page_dic['perpage'],'casesetid':csid})

def deletetc2cs(request):
    try:
        delete_id_list = request.POST.get('testcaseid')
        casesetid = request.POST.get('casesetid').encode('utf-8').strip()
        for item in delete_id_list.split(','):
            if item:
                cs2tc = CasesetToTestcase.objects.filter(caseset_id=int(casesetid),testcase=int(item))
                cs2tc.delete()
        delete_error = '操作成功'
    except Exception,e:
        delete_error = '操作失败,%s',e
    return HttpResponse(json.dumps({'error': delete_error}), content_type="application/json")
def gettcresult(request):
    reslist = []
    try:
        casesetid = request.GET.get('casesetid').strip()
        testcaseid = request.GET.get('testcaseid').strip()
    except:
        casesetid = ''
        testcaseid = ''
    if testcaseid and casesetid:
        reslist = Res.objects.filter(case_id=int(testcaseid),caseset_id=int(casesetid))
    page_dic = getpagelist(request, reslist)
    return render(request, 'testcase_result_all.html', {'pages': page_dic['pages'],'perpage':page_dic['perpage'], 'casesetid': casesetid,'testcaseid':testcaseid})







