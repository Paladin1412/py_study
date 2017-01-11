# coding=utf-8
from django.conf.urls import url
from core.caseset import views
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from core.adminlte.views import CommonListPageView, \
    CommonCreatePageView, CommonUpdatePageView, CommonDeletePageView, \
    CommonDetailPageView

# # Page URL
urlpatterns = [
     url(r'^casesetlist', views.getCasesetList),
     url(r'^create/', views.createCaseset),
     url(r'^edit', views.editCaseset),
     url(r'^delete', views.deleteCaseset),
     url(r'^querytc', views.gettcBySearch),
     url(r'^save', views.savecaseset),
     url(r'^tclist', views.gettclistBycaseset),
     url(r'^tc2csDelete', views.deletetc2cs),
     url(r'^gettcresult', views.gettcresult),

 ]
#
# # API URL
# urlpatterns += [
#     url(r'/companies$', CompanyListView.as_view(), name="companies"),
#     url(r'/departments$', DepartmentListView.as_view(), name="departments"),
#     url(r'/staffs$', StaffListView.as_view(), name="staffs")
# ]