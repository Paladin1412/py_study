from django.conf.urls import url
from core.product.views import *
urlpatterns = [
     url(r'^list/',product),
     url(r'^create/',product_new),
     url(r'^module_list/',getModulelist),
     url(r'^module_new/',create_module),
     url(r'^delete', deleteModules),
     url(r'^edit',editModules),
 ]
