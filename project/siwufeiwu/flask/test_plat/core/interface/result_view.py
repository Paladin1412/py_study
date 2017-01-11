# coding=utf-8
from core.result.models import Res
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.http import HttpResponse
from core.interface.src import runtestcase
import json,datetime
from core.adminlte.constants import ITEMS_PER_PAGE

__author__ = 'wangxiaoni'

def getpagelist(request,object_list):
    perpage =  ITEMS_PER_PAGE
    try:
        if request.method == "GET":
            page = request.GET.get('page')
        else:
            page = request.POST.get('page')
    except:
        page = 1
    try:
        perpage = int(request.GET.get('perpage').strip())
    except:
        perpage = perpage

    paginator = Paginator(object_list, perpage)
    try:
        pages = paginator.page(page)
    except PageNotAnInteger:
        pages = paginator.page(1)

    except EmptyPage:
        pages = paginator.page(paginator.num_pages)
    return  {'pages':pages,'perpage':perpage}

def getresultBytc(request):
    import ast
    count = ast.literal_eval(request.POST.get('runidlist'))
    rate = "{0:.0f}".format(float(count['pass'] / count['total']) * 100)
    return render(request, 'testcase_result.html', {'count': count, 'passrate': rate, 'failrate': 100 - int(rate)})

def getDetailRes(request):
    try:
        passid = request.POST.get('passidlist').encode("utf-8").rstrip(',').split(",")
        failid = request.POST.get('failidlist').encode("utf-8").rstrip(',').split(",")
        detailres = request.POST.get('detailres').encode("utf-8")
    except:
        passid = []
        failid = []
        detailres = []


    if len(passid) < 1 or passid == ['']:
        passid = []
    if len(failid) < 1 or failid == ['']:
        failid = []

    print "pass is %s,fail is %s"%(passid,failid)

    if detailres.find("total") > -1 and (passid or failid):
        reslist = Res.objects.filter(Q(id__in=passid)|Q(id__in=failid))
    elif detailres.find("pass") > -1 and passid:
        reslist = Res.objects.filter(Q(id__in=passid))
    elif detailres.find("fail") > -1 and failid:
        reslist = Res.objects.filter(Q(id__in=failid))
    else:
        reslist = []
    page_dic = getpagelist(request,reslist)
    return render(request, 'resultlist.html', {'pages': page_dic['pages'],'perpage':page_dic['perpage']})

def getAllRes(request):
    try:
        tcid = request.GET.get('testcaseid')
    except:
        tcid = ''
    if tcid:
        reslist = Res.objects.filter(Q(case_id=int(tcid)))

    page_dic = getpagelist(request, reslist)

    return render(request, 'testcase_result_all.html', {'pages': page_dic['pages'],'perpage':page_dic['perpage'],'testcaseid':tcid})

def deleteTcResult(request):
    try:
        delete_tcrsid_list = request.POST.get('resultid')
        for item in delete_tcrsid_list.split(','):
            if item:
                res = Res.objects.get(id=int(item))
                res.delete()
        delete_error = '操作成功'
    except:
        delete_error = '操作失败'

    return HttpResponse(json.dumps({'error': delete_error}), content_type="application/json")


def runCases(request):
    count = {'total': 0, 'sql_err': 0, 'pass': 0, 'fail': 0, 'interface': '', 'passresid': '', 'failresid': ''}
    tcid_list = request.POST.get('jsonObj')
    try:
        casesetid = request.POST.get('casesetid').strip()
    except:
        casesetid = ''

    start_time = datetime.datetime.now()
    for case_id in tcid_list.split(','):
        if case_id:
            result = runtestcase.runtestcase(case_id, casesetid)
            print "testcase result  is %s" % result
            count['interface'] = result['interfacename']
            count['total'] += 1
            count['passresid'] += result['passresid']
            count['failresid'] += result['failresid']
    end_time = datetime.datetime.now()
    time_elapsed = str(end_time - start_time).split('.', 2)[0]
    count['time_elapsed'] = time_elapsed

    if count['passresid']:
        count['pass'] = len(count['passresid'].rstrip(",").split(","))
    if count['failresid']:
        count['fail'] = len(count['failresid'].rstrip(",").split(","))

    print "passreid is %s, failreis is %s, pass is %s,fail is %s " % (
        count['passresid'], count['failresid'], count['pass'], count['fail'])

    return HttpResponse(json.dumps(count, ensure_ascii=False), content_type="application/json")


