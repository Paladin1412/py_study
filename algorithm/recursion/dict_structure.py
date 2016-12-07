#!/usr/bin/env python
# -*- coding: GB18030 -*-

def changeUnicodeDict2StrDict(confDict):
    '''
    @note: 将unicode dict变换为多行字符串
    @return: str  dict
    '''
    confDictStr = {}
    for key in confDict.keys():
        keyStr = key.encode('utf-8')
        dictUnicode = confDict[key]
        if type(dictUnicode) == dict:
            dictEncode = changeUnicodeDict2StrDict(dictUnicode)
            confDictStr[keyStr] = dictEncode
        elif type(dictUnicode) == list:
            confDictStr[keyStr] = []
            for dictUnicodeOne in dictUnicode:
                if type(dictUnicodeOne) == dict:
                    dictEncode = changeUnicodeDict2StrDict(dictUnicodeOne)
                    # print dictEncode
                else:
                    if type(dictUnicodeOne) == unicode:
                        dictEncode = dictUnicodeOne.encode('utf-8')
                    else:
                        dictEncode = dictUnicodeOne
                confDictStr[keyStr].append(dictEncode)
        else:
            if type(dictUnicode) == unicode:
                confDictStr[keyStr] = dictUnicode.encode('utf-8')
            else:
                confDictStr[keyStr] = dictUnicode
    return confDictStr

def get_dict_structure(t_dict):
    '''
    @note: 将dict 转换格式化处理，用于做结构校验，统一转化为key:type(key)输出, list只取第一组数
           eg: {'key': 1, 'list':[{'key':"1"},{'key':"2"}]} -> {'key': int, 'list':[{'key':str}]}
    @return: 格式后dict
    '''
    t_dict_tmp = {}
    for item in t_dict:
        if type(t_dict[item]) == dict:
            t_dict_tmp[item] = get_dict_structure(t_dict[item])
        elif type(t_dict[item]) == list:
            #若数据中元素为str,int等普通类型，则直接返回[];暂时不考虑[[]]结构处理，一般不存在
            if len(t_dict[item])==0 or type(t_dict[item][0]) != dict:
                t_dict_tmp[item] = []
            else:
                #list只取第一个元素处理返回
                t_dict_tmp[item] = [get_dict_structure(t_dict[item][0])]
        else:
            t_dict_tmp[item] = type(t_dict[item])
    return t_dict_tmp

if __name__ == "__main__":
    a={"errno": 0, "request_id": "12102010328436", "data": {"sold_houses": {"has_more_data": 1, "list": [{"blueprint_bedroom_num": 1, "house_code": "BJSJ90753256"}]}, "error": ""}}
    b={"errno": int, "request_id": str, "data": {"sold_houses": {"has_more_data": int, "list": [{"blueprint_bedroom_num": int, "house_code": str}]}, "error": str}}
    print get_dict_structure(a)
