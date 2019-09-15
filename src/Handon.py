#coding:utf-8
import math
import re
import urllib
import requests
import xlrd

from flask import Flask, session, redirect, url_for, escape, request, render_template, jsonify, make_response, json

app = Flask(__name__, static_folder='static')

def get_file(file_url):
    try:
        data = xlrd.open_workbook(file_url)
        return data
    except:
        return redirect(url_for("error", msg='服务不可达'))

def get_sheet(data):
    table = data.sheet_by_name('Sheet0')
    total_rows = table.nrows
    colums = table.row_values(5)
    excel_list = {}
    for one_row in range(6, total_rows):
        row = table.row_values(one_row)
        if row:
            row_object = {}
            id = row[1]
            id = abs(hash(id))
            for i in range(2, len(colums)):
                key = colums[i]
                row_object[key] = row[i]

            excel_list[id] = row_object

    return colums, excel_list

'''open excel'''
data = get_file('src/data/2019秋 011151.01成绩考核登记表_2019-9-5.xlsx')
colums, excel_list = get_sheet(data)

@app.route('/score/<id>')
def score(id):
    id = int(id)
    try:
        ret = excel_list[id]
        ret['status'] = True
        return jsonify(ret)
    except:
        ret = {}
        ret['status'] = False
        ret['msg'] ='您尚未登录或者不是张老师课程修读者'
        return jsonify(ret)




@app.route('/')
def hello():
    #return "中科大模拟与数字电路平时分查询系统（张老师班)"
    return make_response(render_template('index.html', page='index.html'))

@app.route('/error/<msg>')
def error(msg):
    return msg

@app.route('/login')
def login():
    """redirect to login page"""
    return redirect("http://home.ustc.edu.cn/~gpzlx1/cas")


@app.route('/login/cas/<ticket>', methods=['GET', 'POST'])
def login_cas(ticket):
    """Check user"""
    if len(ticket) != 35:
        return redirect(url_for('login'))

    pattern = re.compile(r'^ST-\w{32}$')
    if pattern.match(ticket) is None:
        return redirect(url_for('login'))
    # use ticket
    info = None
    API_URL = "https://passport.ustc.edu.cn/serviceValidate?ticket={ticket}&service={service}"
    service_url = urllib.parse.quote_plus(
        "home.ustc.edu.cn/~gpzlx1/cas/index.html")
    api_url = API_URL.format(ticket=ticket, service=service_url)
    try:
        r = requests.get(api_url)
        info = r.text
    except:
        return redirect(url_for('login'))

    # format return info
    if info:
        id = re.search(r'[a-zA-Z]{2}\d{8}', info, flags=0)
        if id:
            id = id.group(0)
            return redirect(url_for('hello',id = abs(hash(id))))
        else:
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(port='80', debug=False)