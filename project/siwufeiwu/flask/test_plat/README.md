test
# django-adminlte

    注意: 以下内容基于Mac OSX

## 依赖

* python 2.7
* django 1.8

## 技术栈

* 前端：
    * jquery, vue.js, underscore
    * adminlte 开源前端模板
    
* 后端
    * django
    * django-rest-framework
    * django-mptt
    * django-registration
    

## 准备工作：


## 跑起来

1. git clone git@github.com:lyhapple/django-adminlte.git
2. cd django-adminlte
3. pip install -r requirement.txt
4. python manage_dev.py migrate
5. python manage_dev.py loaddata conf/fixture_data.json
6. python manage_dev.py runserver


### 使用

1. 超管用户名及密码都是: admin

2. django自带后台地址为: /admin/

3. 写好Model 与 serializer 类之后，可以通过菜单管理页面，增加管理入口，
比如，创建了名为demo的app, 然后新增了一个Product Model,
再新增一个ProductSerializer类, 最后即可在菜单管理页面增加对Product数据的管理入口