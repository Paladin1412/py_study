# coding=utf-8
from django.conf.urls import url
from core.interface import views,result_view

# # Page URL
urlpatterns = [
     url(r'^list/', views.getInterfacelist),
     url(r'^create/', views.createInterface),
     url(r'^tclist/interface(?P<id>\d+)',views.get_tclist_byifid),
     url(r'^testcase/create', views.createTestCase),
     # url(r'^testcase/run', views.RunCase),
      url(r'^testcase/run', result_view.runCases),
     url(r'^delete', views.deleteInterface),
     url(r'^edit', views.editInterface),
     url(r'^testcase/edit', views.editTestcase),
     url(r'^testcase/delete', views.deleteTestcase),
     url(r'^getmodules', views.getModules),
     url(r'^testcase/result', result_view.getresultBytc),
     url(r'^testcase/detailresult', result_view.getDetailRes),
     url(r'^testcase/getallresult', result_view.getAllRes),
     url(r'^result/delete', result_view.deleteTcResult),

 ]
#
# # API URL
# urlpatterns += [
#     url(r'/companies$', CompanyListView.as_view(), name="companies"),
#     url(r'/departments$', DepartmentListView.as_view(), name="departments"),
#     url(r'/staffs$', StaffListView.as_view(), name="staffs")
# ]