from flask import Flask, request, render_template,flash,session,redirect ,send_from_directory,send_file,abort
from flask.helpers import url_for
import pandas as pd
import os
import datetime
import time
import re
import json
from werkzeug.datastructures import ContentSecurityPolicy
from werkzeug.exceptions import MethodNotAllowed
# import codecs, markdown
import codecs 
from urllib.parse import unquote
import sqlite3
# import win32gui ,win32com, win32com.client
from py_excel import excelFormat
import platform
import app_api

app = Flask(__name__)

con = sqlite3.connect('flask_site.db', check_same_thread=False)
cur = con.cursor()

app.config['SECRET_KEY'] = 'dev'
app.config['DEBUG'] = True
# app.config['ISSUE_LIST'] = r'D:\\Issues\\LBY_Issue_List_LiHanmin_2021.xlsx'
# app.config['ISSUE_PATH'] = r'D:\\Issues\\'
# app.config['PROJECTS_PATH'] = r'D:\\Issues\\

def init_config():
    app.config['ISSUE_LIST'] = cur.execute('SELECT value FROM sysconfig where id=2').fetchall()[0][0]
    app.config['ISSUE_PATH'] = cur.execute('SELECT value FROM sysconfig where id=1').fetchall()[0][0]
    app.config['KNOWLEDGE_PATH'] = r'D:\Lihanmin\Knowledge' 
    app.config['PROJECTS_PATH'] = cur.execute('SELECT value FROM sysconfig where id=1').fetchall()[0][0]
    # app.config.from_object("setting.dev")

init_config()
# functions 

        
# --------------------------------------ROUTE--------------------------


@app.route('/tools/import',methods=['POST','GET'])
def improt_excel_to_table():
    if request.method == "POST":
        f = request.files['file']
        tbname = request.form.get('tablename')
        try:
            df = pd.read_excel(f)
            df = df.fillna("")
            if create_table_by_df(cur,df,tbname):
                insert_df_to_table(cur,df,tbname)
                flash('import to table '+ tbname +' successful')
            else:
                flash('import to table '+ tbname +' failed')

        except Exception as a:
            print(a)
            flash('import to table '+ tbname +' failed')
    return render_template('tools/import_excel_to_table.html')
        

@app.route('/project', methods =['POST'])
def fast_create_project():
    return "create proeject"

@app.route('/issue', methods=['POST','GET'])
def f_issue_init():
    lb_open_file=""
    if request.method == "POST":
        title =request.form.get('title') 
        itype = request.form.get('issue_type')  
        cdate = datetime.datetime.now().strftime("%Y%m%d")
        issue = MyIssue(title,cdate,itype)
        try:
            issue.create_path()
            issue.create_readme()
            if issue.add_to_list():
                lb_open_file = "<a href='%s' target='_self' >Open issue file</a>" % issue.file_path
                excelFormat()
                flash("issue create success")
            else:
                 flash("issue create failed")
            
        except Exception as e:
            print(e)
            flash ("issue create failed")

    return render_template('issue.html', lb_open_file = lb_open_file )
    

@app.route('/sysConfig', methods=['POST','GET'])
def sysConfig():
    if request.method == "POST":
        # change the DB data 
        is_path = request.form.get('issuepath')
        is_list = request.form.get('issuelist')
        os_type = request.form.get('ostype')
        cur.execute('update sysconfig set value=\'' + is_path +'\' where id=1')
        cur.execute('update sysconfig set value=\'' + is_list +'\' where id=2')
        cur.execute('update sysconfig set value=\'' + os_type +'\' where id=3')
        cur.execute('commit')

    else:
        #  get from db 
        is_path = cur.execute('SELECT value FROM sysconfig where id=1').fetchall()[0][0]
        is_list = cur.execute('SELECT value FROM sysconfig where id=2').fetchall()[0][0]
        os_type = cur.execute('SELECT value FROM sysconfig where id=3').fetchall()[0][0]
    return render_template('sysConfig.html', is_path=is_path , is_list=is_list, os_type=os_type)
    

# @app.route('/issues/status/<statustype>',methods=['GET'])
# def show_status_issue(i_status):
#     print(i_status)

@app.route('/tools', methods=['POST','GET'])
def tools():
    return render_template('tools.html' )



@app.route('/tools/cdr', methods=['POST','GET'])
def cdr():
    cdr_json=""
    if request.method == "POST":
        cdr_content = '8702808393|10001|20210903001122|20210903001124|\{18922288822,0023183773,6F9018xG12wws,1\}|80|\{700932099,2002,18922288822,800\}'
        acdr = MyCdr(cdr_content)
        cdr_json = acdr.cdr_to_json()
    return render_template('cdr.html',cdr_json=cdr_json )


@app.route('/tools/cdrCfg', methods=['POST','GET'])
def cdrCfg():
    if request.method == "POST":
        flash("cdr config")
    return render_template('cdrCfg.html' )


@app.route('/<path:re_path>')
def openfile(re_path):
    BASE_DIR = '/'
    abs_path = os.path.join(BASE_DIR, re_path)
    if not os.path.exists(abs_path):
        return abort(404)
    if os.path.isdir(abs_path):
        os.system("open %s" % abs_path ) 
    elif os.path.isfile(abs_path):
        if os_file_type(abs_path) == "EXCEL":
            os.system("open -a /Applications/wpsoffice.app %s" % abs_path )
        elif os_file_type(abs_path) == "TEXT" :
            if len(re.findall("\.md$",abs_path)) == 1:
                os.system("open -a /Applications/Typora.app %s" % abs_path)
            else:
                os.system("code %s" % abs_path)
        else:
            flash ('unkow file type')
    return  redirect('/index')
 
# routers 
@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':
        # print(request.form.get('username'))
        uname = request.form.get('username')
        upass = request.form.get('password')
        if valid_login(uname,upass):
            session['user_info'] = uname
            session['ISSUE_LIST'] = app.config['ISSUE_LIST']
            session['ISSUE_PATH'] = app.config['ISSUE_PATH']
            session['PROJECTS_PATH'] = app.config['PROJECTS_PATH']
            return redirect('/index')
        else:
            flash ('Invalid username or password.')
    return render_template('login.html')


@app.route('/')
@app.route('/index')
def index():
    if not session.get('user_info'):
        return redirect('/login')
    
    return render_template('index.html')

 
# @app.route('/issue/<int:id>', methods=['GET', 'POST'])
# def issue(id):
#     if request.method == 'POST':
#         return add_new_issue()
#     else:
#         return show_issue_info(id)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        f = request.files['filename']
        if check_file_type(f) == "EXCEL":
            flash ("upload success")
            pd.read_excel('')
        else:
            flash("Not a excel file uploaded") 
    return redirect('/index')

@app.route('/logout')
def logout():
    del session['user_info']
    return redirect('/login')


@app.route('/cmd', methods=['POST', 'GET'])
def cmd():
    return render_template('cmd.html')

@app.route('/knowledge')
def knowledge():
    # get the path from sysconfig
    kpath = app.config['KNOWLEDGE_PATH']
    k = MyKnowledge(kpath)
    pathList =  k.getPathList()
    return render_template('knowledge.html',pathList = pathList)

@app.route('/site')
def site():
    return render_template('site.html')



# ------------------------------Functions
def valid_login(uname,passwd):
    user_list = { 'admin':'123','lihanmin':'123','guest':'123'}
    print('username:%s, password:%s' % (uname,passwd))
    if uname in user_list and user_list[uname] == passwd:
        return True
    else:
        return False

def check_file_type(filename):
    if filename.content_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "EXCEL"
    elif filename.content_type == "image/jpeg":
        return "IMG"
    else:
        return filename.content_type

def os_file_type(filename):
    if os.popen("file %s" % filename).read().find('Excel') != -1 :
        return "EXCEL"
    elif os.popen("file %s" % filename).read().find('text') != -1 :
        return "TEXT"
    else:
        print('unknow file type %s ' % os.popen("file %s" % filename).read())
        return "UNKNOW"


class MyCdr:
    def __init__(self,cdr_info) -> None:
        self.cdr_info = cdr_info

    def cdr_to_json(self):
        c = '8702808393|10001|20210903001122|20210903001124|\{18922288822,0023183773,6F9018xG12wws,1\}|80|\{700932099,2002,18922288822,800\}'
        l = c.split("|")
        cdr_json_str = "{"
        for i in range(0,len(l)):
            if l[i].find(",") != -1:
                long_str_list = l[i].strip("\{").strip("\\").strip("\}").split(",")
                cdr_json_str = cdr_json_str + "\"" + str(i+1) + "\":{"
                for j in range(0,len(long_str_list)):
                    # 如果是最后一个字段则后面不能加逗号
                    if j+1 == len(long_str_list):
                        cdr_json_str = cdr_json_str + '\'' + str((i+1)+(j+1)/10) + '\':\'' + long_str_list[j]+'\''
                    else:
                        cdr_json_str = cdr_json_str + '\'' + str((i+1)+(j+1)/10) + '\':\'' + long_str_list[j]+'\','
                # 如果是最后一个字段则后面不能加逗号
                if i+1 == len(l):
                    cdr_json_str = cdr_json_str + '}'
                else:
                    cdr_json_str = cdr_json_str + '},'
            else:
                # 如果是最后一个字段则后面不能加逗号
                if i+1 == len(l):
                    cdr_json_str = cdr_json_str  + '\' +str(i+1)+ \':' +'\' +  l[i] + \''
                else:
                    cdr_json_str = cdr_json_str  + '\' +str(i+1)+ \':' +'\' +  l[i] +\','
        cdr_json_str = cdr_json_str +"}"
        cdr_json_str = json.loads(cdr_json_str)
        return cdr_json_str

    def cdr_to_dic(self):
        c = '8702808393|10001|20210903001122|20210903001124|\{18922288822,0023183773,6F9018xG12wws,1\}|80|\{700932099,2002,18922288822,800\}'
        l = c.split("|")
        print("{\n")
        for i in range(0,len(l)):
            if l[i].find(",") != -1:
                long_str_list = l[i].strip("\{").strip("\\").strip("\}").split(",")
                print("    \'%s\' : {" % str(i+1))
                for j in range(0,len(long_str_list)):
                    print("        \'%s\' : \'%s\' " % (str((i+1)+(j+1)/10) , long_str_list[j]))
                print("    }")
            else:
                print("    \'%s\' : \'%s\' " % (str(i+1) ,l[i]) )
        print("}\n")

    def cdr_analyse(self):
        pass

class MyIssue:
    """
        use for create issue related file and path, also add the record in the issue list (excel file)
        please set below 2 parameter before use:
        # issue record list file (excel format)
        app.config['ISSUE_LIST'] = r'/Users/lihanmin/Documents/issue_list.xlsx'
        # the path for save issue relate file, will create folder for issue under this path
        app.config['ISSUE_PATH'] = r'/Users/lihanmin/Documents/issue/'
        20211118: change the data source from excel to sqlite db
    """
    def __init__(self,title,cdate,issue_type,status="",priority="",progress="",id="",verid=0):
        self.title = title.rstrip().replace(' ','_')
        self.cdate = cdate
        self.issue_type = issue_type
        self.status = status
        self.priority = priority
        self.progress = progress
        self.id = id
        self.verid = verid
        # self.cdate_7days = datetime.datetime.strptime(cdate,'YYYYMMDD')
        self.issue_path = app.config['ISSUE_PATH'] + self.cdate + '_' + self.title
        self.list_file_path = app.config['ISSUE_LIST']
        self.file_path = self.issue_path + '/' + self.title +'.md'

    # check_exist()
    def create_path(self):
        if not os.path.exists(self.issue_path):
            try:
                os.makedirs(self.issue_path)
                return True
            except Exception as a:
                print(a)
                return False
        else:
            return True
    
    def create_readme(self):
        if not os.path.exists(self.file_path):
            try:
                f = open(self.file_path, 'w+')
                f.write('# ' + self.title + '\n')
                f.write('- Date : ' + self.cdate + '\n')
                f.write('- Owner: ' +  session['user_info'] +'\n')
                f.write('- Path : ' +  self.issue_path +'\n\n')
                f.write('# Description\n\n\n')
                f.write('\n\n\n')
                f.write('# Progress\n\n\n')
                f.write('\n\n\n')
                f.write('# Analyse record \n\n\n')
                f.write('\n\n\n')
                f.write('# Root cause\n\n\n')      
                f.write('\n\n\n')
                f.write('# Solution\n\n\n')   
                f.write('\n\n\n')
                f.flush()
                f.close()
                return True
            except Exception as a:
                return False
        else:
            return True

    def saveedit(self):
        if self.verid == 0:
            try:
                df = pd.read_excel(app.config['ISSUE_LIST'])
                # check the record if exist
                df_title = df[df['ID'] == int(self.id)]
                if df_title['ID'].shape[0] == 1 and df_title['ID'].values[0] > 0 :
                    new_issue_dict = {
                    'ID'        : int(self.id) ,
                    'CreateTime' : self.cdate,
                    'Type'       : self.issue_type ,
                    'Title'      : self.title,
                    'Priority'   : self.priority,
                    'Status'     : self.status,
                    'Progress'   : self.progress,
                    'Owner'      : session['user_info']
                    }
                    df.loc[df[df['ID']==int(self.id)].index.to_list()[0]] = new_issue_dict
                    df.to_excel(app.config['ISSUE_LIST'],sheet_name='Issues',index=False)
                    return True
                else:
                    return False
            except Exception as a:
                print(a)
                return False
        elif self.verid == 1:
            try:
                sql = "update issues set type='" +  self.issue_type + \
                          "' ,priority='" + self.priority + \
                          "' ,Status='" + self.status + \
                          "' ,Progress='" + self.progress + \
                          "'  where ID=" +self.id +";"
                print(sql)
                cur.execute(sql)
                cur.execute('commit')
                return "success"
                
            except Exception as a:
                print(a)
                return "failed"


    def add_to_list_v1(self):
        print('add new issue')
        try:
            sql = 'select max(id) from issues;'
            newid = cur.execute(sql).fetchall()[0][0]
            newid = int(newid) + 1
            # 把YYYYMMDD转成 YYYY-MM-DD
            cdate1 = self.cdate[0:4]+ "-" + self.cdate[4:6]+ "-" + self.cdate[6:8]
            sql = "insert into issues values(" + str(newid) + \
                ",'" + cdate1 +"'" \
                ",'" + self.issue_type +"'" \
                ",'" + self.title +"'" \
                ",'" + self.priority +"'" \
                ",'Open'" \
                ",'" + self.progress +"'" \
                ",'" + session['user_info'] +"'" \
                 + ")"
            print(sql)
            cur.execute(sql)
            cur.execute('commit;')
            return True
        except Exception as a:
            print('Get error when create issue:')
            print(a)
            return False

    def add_to_list(self):
        """
        the format of the issue list 
        """
        try:
            df = pd.read_excel(app.config['ISSUE_LIST'])
            df_title = df[df['Title'] == self.title]
            df_cdate = df_title[df['CreateTime']== self.cdate]
            if df_cdate.shape[0] == 0 :
                df = df[df['Title'].notnull()]
                new_issue_dict = {
                    'ID'        : max(df['ID']) +1  if df['ID'].size != 0 else 1 ,
                    'CreateTime' : self.cdate,
                    'Type'       : self.issue_type ,
                    'Title'      : self.title,
                    'Priority'   : 'Minor',
                    'DueDate'    : '',
                    'Status'     : 'Open',
                    'Progress'   : '',
                    'Owner'      : session['user_info']
                }
                print ('df.shape' + str(df.shape[0]))
                df.loc[df.shape[0]] = new_issue_dict
                df.to_excel(app.config['ISSUE_LIST'],sheet_name='Issues',index=False)
                return True
            else:
                print ('Error: record already exist')
                return False
        except Exception as a:
            print('Get error when create issue:')
            print(a)
            return a

class MyProject:
    """
    use for the project inital, create the related path
        
    """
    def __init__(self,p_name) -> None:
        self.p_name = p_name
        self.p_path = app.config['PROJECTS_PATH'] + p_name

    def create_new_project(self):
        print("create new project %s" % self.p_name)

class MyKnowledge:
    def __init__(self,kpath="",filename=""):
        self.kpath = kpath
        self.filename = filename

    def getPathList(self):
        kpath = self.kpath
        filelist_dic = {}
        if os.path.exists(kpath):
            try:
                os.chdir(kpath)
                pathList = os.listdir()
                k_left_list = []
                for i in pathList:
                    if os.path.isdir(i) and not re.search('\.git',i):
                        k_left_list.append(i)
                        # filelist = searchMDfile(i)
                        # filelist_dic[i] = filelist
                return k_left_list
            except Exception as a:
                print(a)
                return "ERROR"
        else:
            return "ERROR"

    # 获取目录下的所有md文件
    def searchMDfile(self):
        kpath = self.kpath
        mdFileList = []
        if os.path.exists(kpath):
            for i in os.walk(kpath):
                # a = re.search('\.md',i[2])
                if (not re.search('\.git',i[0])):
                    for j in i[2]:
                        if re.search('\.md$',j):
                            mdFileList.append(j)
        return mdFileList

    def knowledge_openmdfile(self):
        try:
            kpath = self.kpath;
            kfilename = self.filename
            print('open local knowlege ' + kfilename)
            if os.path.exists(kpath):
                for i in os.walk(kpath):
                    if (not re.search('\.git',i[0])):
                        for j in i[2]:
                            if re.search('\.md$',j) and j == kfilename:
                                file_full_path = str(i[0]) + '\\' +j
                                print(file_full_path)
                                os.system('"' + file_full_path + '"')

        except Exception as a :
            print(a)                        

    def remove_knowledge(self,know_id):
        pass

    def get_knowledge(self,know_id):
        pass


class Site:
    def __init__(self,tname="",know_id=0):
        self.tablename = tname
        self.know_id = know_id

    def show_table(self):
        tablerows = None
        try:
            print("get table head for table "+ self.tablename)
            sql = 'select sql from sqlite_master where type="table" and upper(name)=upper("' + self.tablename +'")'
            print(sql)
            tablehead = cur.execute(sql).fetchall()[0][0]
            
            p1 = re.compile(r'[(](.*?)[)]',re.S)
            tablehead = re.findall(p1,tablehead)[0].split(',')
            tableheadres = []
            for i in range(0,len(tablehead)):
                tableheadres.append(tablehead[i].split()[0])
            tableheadres = tuple(tableheadres)
            print("get table conntent for table "+ self.tablename)
            tablerows = cur.execute('SELECT * FROM ' +  self.tablename ).fetchall()
            tablerows.insert(0,tableheadres)
            tablerows = str(tablerows)    
            return tablerows
        except Exception as a :
            print (a)
            return "Falied"

  
'''
安装 pywin32使用 import win32gui 时报错，ImportError: DLL load failed: 找不到指定的模块。
在Scripts目录下执行如下脚本即可（管理员）
python pywin32_postinstall.py -install
'''
# def _window_enum_callback(hwnd, wildcard):
#     '''
#     Pass to win32gui.EnumWindows() to check all the opened windows
#     把想要置顶的窗口放到最前面，并最大化
#     '''
#     if re.match(wildcard, str(win32gui.GetWindowText(hwnd))) is not None:
#         win32gui.BringWindowToTop(hwnd)
#         # 先发送一个alt事件，否则会报错导致后面的设置无效：pywintypes.error: (0, 'SetForegroundWindow', 'No error message is available')
#         shell = win32com.client.Dispatch("WScript.Shell")
#         shell.SendKeys('%')
#         # 设置为当前活动窗口
#         win32gui.SetForegroundWindow(hwnd)
#         # 最大化窗口
#         win32gui.ShowWindow(hwnd, win32com.SW_MAXIMIZE)

def get_os_type():
    try:
        if platform.platform().index('Windows') == 0:
            return "Windows"
        elif platform.platform().index('Darwin') == 0:
            return "Mac"
    except Exception as a:
        return "Others"


# for API ===============================================


@app.route('/api/issues', methods=['GET'])
def api_issues():
    '''     
    show all the list (Excel file) on the page 
    '''
    df = pd.read_excel(app.config['ISSUE_LIST'])
    df = df.fillna("")
    # 时间格式转换 yyyymmdd to yyyy/mm/dd
    # df['CreateTime'] = df['CreateTime'].map(lambda code: str(code)[0:4]+"/" +str(code)[4:6] + "/" + str(code)[6:8] )
    # df = df.drop(['Description'],axis=1)
    ihtml = df.to_html(index=False,table_id="issue_list")
    return ihtml

@app.route('/api/issues/v1', methods=['GET'])
def api_issues_v1():
    return render_template('issue_v1.html')

@app.route('/api/excel/format/', methods=['GET'])
def api_excel_format():
    '''     
    change the excel style, like with height , hight light. add filter etc. 
    '''
    df = pd.read_excel(app.config['ISSUE_LIST'])
    df = df.fillna("")
    # df = df.drop(['Description'],axis=1)
    df = df[df['Status'] == i_status]
    ihtml = df.to_html(index=False,table_id="issue_list")
    return ihtml



@app.route('/api/issues/status/<i_status>', methods=['GET'])
def api_issues_sp_status(i_status="all"):
    '''     
    show specified status issue list on the page 
    '''
    print('open the issue list from ' + app.config['ISSUE_LIST'])
    df = pd.read_excel(app.config['ISSUE_LIST'])
    df = df.fillna("")
    # df = df.drop(['Description'],axis=1)
    if i_status != "all":
        df = df[df['Status'] == i_status]
        
    ihtml = df.to_html(index=False,table_id="issue_list")
    return ihtml


@app.route('/api/fastcreateissue', methods=['POST'])
def api_fastcreateissue():
    '''     
    show specified status issue list on the page from database(sqlite3)
    '''
    return issues_list

@app.route('/api/issues_v1/status/<i_status>', methods=['GET'])
def api_issues_sp_status_db(i_status):
    '''     
    show specified status issue list on the page from database(sqlite3)
    '''
    try:
        if i_status == "all":
            sql = 'SELECT * FROM issues order by ID'
        else:
            sql = 'SELECT * FROM issues where status="' + i_status +'" order by ID'
            
        # print(sql)
        issues_list = cur.execute(sql).fetchall()
        issues_list = str(issues_list)
        # print(issues_list)
        return issues_list
    except Exception as a:
        print (a)
        return "get data failed, maybe table not exist"
    

@app.route('/api/readMD/<path:fpath>')
def readMD(fpath):
    '''
     API for open the file. if we want open the file from web, will use this api
    '''
    # fpath = "/" + fpath  # for linux need add / before path, windows no need 
    try:
        fpath = unquote(fpath,"utf-8")
        input_file = open(fpath, mode="r", encoding="utf-8")
        text = input_file.read()
        return text
    except Exception as a:
        return "[ERROR] the markdown file "+ fpath  + " load failed \n" + str(a) 

@app.route('/api/openlocal/Path/<path:fpath>')
def openlocal_path(fpath):
    # fpath = "/" + fpath  # for linux need add / before path, windows no need 
    fpath = unquote(fpath, 'utf-8')
    try:
        os.startfile(fpath,'explore')
        if re.match(".+/$",fpath):
            wintitle = re.match(".+/(.+)/$",fpath).group(1)
        else:
            wintitle=fpath
        
        # win32gui.EnumWindows(_window_enum_callback, ".*%s.*" % wintitle)
        return "success"
    except Exception as a:
        print(a)
        if a.errno == 2:
            return "Cannot found the file or path"
        return str(a)

@app.route('/api/openlocal/file/<path:fpath>')
def openlocal_file(fpath):
    fpath = unquote(fpath, 'utf-8')
    os.startfile(fpath)
    return "sucess"

@app.route('/api/openlocal/file/md/<path:fpath>')
def openlocal_md(fpath):
    fpath = unquote(fpath, 'utf-8')
    os.system(fpath)
    # win32gui.EnumWindows(_window_enum_callback, ".*%s.*" % 'VSCode-huawei')
    return "sucess"

# @app.route('/api/md_to_html')
# def md_to_html():

#     extensions = [ #根据不同教程加上的扩展
#     'markdown.extensions.extra',
#     'markdown.extensions.codehilite', #代码高亮扩展
#     'markdown.extensions.toc',
#     'markdown.extensions.tables',
#     'markdown.extensions.fenced_code',
#     ]
#     input_file = codecs.open()
#     text = input_file.read()
#     html = markdown.markdown(text,extensions=extensions)
#     return html


@app.route('/api/issues/saveedit' ,methods=['POST'])
def issue_saveedit():
    if request.method == "POST":
        title = request.form.get('title') 
        cdate = request.form.get('createtime') 
        status = request.form.get('status') 
        priority = request.form.get('priority') 
        progress = request.form.get('progress') 
        iid = request.form.get('id') 
        itype = request.form.get('type') 
        issue = MyIssue(title,cdate,itype,status,priority,progress,iid)
        issue.saveedit()
        excelFormat()
    return render_template('issue.html' )

@app.route('/api/issues_v1/saveedit' ,methods=['POST'])
def issue_saveedit_v1():
    if request.method == "POST":
        print(request.form)
        title = request.form.get('title') 
        cdate = request.form.get('createtime') 
        status = request.form.get('status') 
        priority = request.form.get('priority') 
        progress = request.form.get('progress') 
        iid = request.form.get('id') 
        itype = request.form.get('itype') 
        issue = MyIssue(title,cdate,itype,status,priority,progress,iid,1)
        issue.saveedit()
    return render_template('issue_v1.html' )

@app.route('/api/issues_v1/delete/<issue_id>')
def issue_saveedit_v1_delete(issue_id):
    # print('delete issue ' + str(issue_id))
    try:
        sql="delete from issues where id=" + issue_id +"; "
        cur.execute(sql);
        cur.execute('commit;');
        return "Success"
    except Exception as a:
        print(a)
        return "Failed"
    

@app.route('/api/tools/table' ,methods=['POST','GET'])
def showtable():
    if request.method == "POST":
        print("post")
    return render_template('tools/showtable.html' )

def table_exists(con,table_name):  
    # sqlite3
    sql = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '" +  table_name +"' ;"
    sql_res = con.execute(sql).fetchall()[0][0]
    print(sql_res)
    
    if sql_res > 0:
        return 1        #存在返回1
    else:
        return 0        #不存在返回0

def create_table_by_df(cur,df,tbname):
    if  table_exists(cur,tbname):
        print('table ' + tbname +' already exist in db')
    else:
        print('start create table ' + tbname)
        cols = df.columns.values
        sql = "create table " + tbname +" ("
        for i in range(0,len(cols)):
            if i == len(cols)-1:
                sql = sql + cols[i] + " varchar"
            else:
                sql = sql + cols[i] + " varchar,"
        sql = sql + " )"
        print(sql)
        try:
            cur.execute(sql)
            return True
        except Exception as a:
            print('table create success')
            return False

def insert_df_to_table(cur,df,tbname):
    for rownum in range(0,len(df.values)):
        row = df.values[rownum]
        sql = "insert into "+ tbname +" values( "
        for colnum in range(0,len(row)):
            if colnum == len(row)-1:
                sql = sql + "'" + str(row[colnum]) + "'"
            else:
                sql = sql + "'"  + str(row[colnum])  + "'" +","
        sql = sql + ")"
        try:
            cur.execute(sql)
            cur.execute('commit;')
        except Exception as a:
            print(a)


@app.route('/api/tools/showtable/<tablename>')
def api_showtable(tablename):
    tablerows = None
    try:
        tablehead = cur.execute('select sql from sqlite_master where type="table" and name="' + tablename +'"').fetchall()[0][0]
        p1 = re.compile(r'[(](.*?)[)]',re.S)
        tablehead = re.findall(p1,tablehead)[0].split(',')
        print(tablehead)
        tableheadres = []
        for i in range(0,len(tablehead)):
            tableheadres.append(tablehead[i].split()[0])
        tableheadres = tuple(tableheadres)
        tablerows = cur.execute('SELECT * FROM ' +  tablename ).fetchall()
        tablerows.insert(0,tableheadres)
        print(tablerows[0])
        tablerows = str(tablerows)
    except Exception as a:
        print('show table table not exist.')
        print(a)
    if tablerows:
        # print(tablerows)
        return tablerows
    else:
        return "table not exist"


@app.route('/api/issues/v1/fastcreate',methods = ['POST', 'GET'])
def api_issues_v1_fastcreate():
    if request.method == "POST":
        title =request.form.get('title') 
        itype = request.form.get('issue_type')  
        priority = request.form.get('severity')  
        cdate = datetime.datetime.now().strftime("%Y%m%d")
        # cdate = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        issue = MyIssue(title=title,cdate=cdate,issue_type=itype,priority=priority,verid=1)
        try:
            issue.create_path()
            issue.create_readme()
            if issue.add_to_list_v1():
                flash("issue init success")
            else:
                flash("issue init failed")
        except Exception as e:
            print(e)
            flash ("issue init failed")
            flash (e)
    return render_template('issue_v1.html')


@app.route('/api/site/<table_name>' ,methods=['GET'])
def siteinfo_show(table_name):
    try:
        mysite = Site(tname=table_name)
        res = mysite.show_table()
        return str(res)
    except Exception as a:
        return "Failed"

@app.route('/api/knowledge/<kpath>' ,methods=['GET'])
def knowledge_show(kpath):
    try:
        myknow = MyKnowledge(kpath)
        res = myknow.searchMDfile()
        return str(res)
    except Exception as a:
        return "Failed"

@app.route('/api/knowledge/openmdfile/<filename>' ,methods=['GET'])
def k_openmdfile(filename):
    try:
        filename = unquote(filename, 'utf-8')
        print ('opepmdfile: ' + filename)
        kpath = app.config['KNOWLEDGE_PATH']
        k = MyKnowledge(kpath=kpath,filename=filename)
        k.knowledge_openmdfile()
        # os.system(fpath)
        return "Success"
    except Exception as a:
        print(a)
        return "Failed"  

def table_exists(con,table_name):  
    # sqlite3
    sql = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '" +  table_name +"' ;"
    sql_res = con.execute(sql).fetchall()[0][0]
    print(sql_res)
    
    if sql_res > 0:
        return 1        #存在返回1
    else:
        return 0        #不存在返回0


@app.route('/api/index/issueReport' ,methods=['GET'])
def collect_issue_report():
    try:
        if table_exists(cur,"issue_report"):
            cur.execute("drop table issue_report;")
        
        sql = "create table issue_report as select STATUS,COUNT(*) Count  from issues GROUP BY STATUS;"
        cur.execute(sql)
        C_showtable = Site('issue_report')
        res = C_showtable.show_table()
        return str(res)
    except Exception as a:
        print(a)
        return "Failed"


# @app.route('/uploadFile', methods=['POST', 'GET'])
# def upload_file_to_server():
#     if request.method == 'POST':
#         f = request.files['file']
#         basepath = os.path.dirname(__file__)  # 当前文件所在路径
#         upload_path = os.path.join(basepath, 'static\uploads',secure_filename(f.filename))  #注意：没有的文件夹一定要先创建，不然会提示没有该路径
#         f.save(upload_path)
#         return redirect(url_for('upload'))
#     return render_template('upload.html')




if __name__ == '__main__':
    app.run(host='127.0.0.1',port=8484)
    

