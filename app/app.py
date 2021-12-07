from flask import Flask, request, render_template,flash,session,redirect ,send_from_directory,send_file,abort
from flask.helpers import url_for
import pandas as pd
import os
import datetime
import re
import json
from werkzeug.datastructures import ContentSecurityPolicy
from werkzeug.exceptions import MethodNotAllowed
import codecs, markdown
from urllib.parse import unquote
import sqlite3
import win32gui ,win32com, win32com.client
from py_excel import excelFormat

app = Flask(__name__)

con = sqlite3.connect('flask_site.db', check_same_thread=False)
cur = con.cursor()

app.config['SECRET_KEY'] = 'dev'
app.config['DEBUG'] = True
app.config['ISSUE_LIST'] = r'D:\\Issues\\LBY_Issue_List_LiHanmin_2021.xlsx'
app.config['ISSUE_PATH'] = r'D:\\Issues\\'
app.config['PROJECTS_PATH'] = r'D:\\Issues\\'
# app.config.from_object("setting.dev")

# functions 

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
    def __init__(self,title,cdate,issue_type):
        self.title = title.rstrip().replace(' ','_')
        self.cdate = cdate
        self.issue_type = issue_type
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
                f.write('# Progress\n\n\n')
                f.flush()
                f.close()
                return True
            except Exception as a:
                return False
        else:
            return True

    def fun(series):
        fname = series['ID']
        return '=HYPERLINK(D:\\Issues\\LBY_Issue_List_LiHanmin_2021.xlsx)'.format(fname,fname)
    
    def show_sp_stauts_issue(i_status):
        print(i_status)


    def add_to_list(self):
        """
        the format of the issue list 
        ID	CreateTime	Type	Title	Description	Priority	Status	Progress	Owner	SR	CR	RFC
        """
        try:
            df = pd.read_excel(app.config['ISSUE_LIST'])
            df = df[df['Title'].notnull()]
            new_issue_dict = {
                'ID'        : max(df['ID']) +1  if df['ID'].size != 0 else 1 ,
                'CreateTime' : self.cdate,
                'Type'       : self.issue_type ,
                'Title'      : self.title,
                # 'Description': '',
                'Priority'   : 'Minor',
                'DueDate'    : '',
                'Status'     : 'Open',
                'Progress'   : '',
                'Owner'      : session['user_info']
            }
            df.loc[df.shape[0]] = new_issue_dict
            # add hyperlink
            # df['ID'] = df.apply(func=self.fun, axis=1)
            # print(df)
            df.to_excel(app.config['ISSUE_LIST'],sheet_name='Issues',index=False)
            return True
        except Exception as a:
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
    def __init__(self,know_id):
        self.know_id = know_id

    def new_knowledge(self):
        pass

    def remove_knowledge(self,know_id):
        pass

    def get_knowledge(self,know_id):
        pass


'''
安装 pywin32使用 import win32gui 时报错，ImportError: DLL load failed: 找不到指定的模块。
在Scripts目录下执行如下脚本即可（管理员）
python pywin32_postinstall.py -install
'''
def _window_enum_callback(hwnd, wildcard):
    '''
    Pass to win32gui.EnumWindows() to check all the opened windows
    把想要置顶的窗口放到最前面，并最大化
    '''
    if re.match(wildcard, str(win32gui.GetWindowText(hwnd))) is not None:
        win32gui.BringWindowToTop(hwnd)
        # 先发送一个alt事件，否则会报错导致后面的设置无效：pywintypes.error: (0, 'SetForegroundWindow', 'No error message is available')
        shell = win32com.client.Dispatch("WScript.Shell")
        shell.SendKeys('%')
        # 设置为当前活动窗口
        win32gui.SetForegroundWindow(hwnd)
        # 最大化窗口
        win32gui.ShowWindow(hwnd, win32com.SW_MAXIMIZE)

# --------------------------------------ROUTE--------------------------

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
            issue.add_to_list()
            flash("issue init success")
            lb_open_file = "<a href='%s' target='_self' >Open issue file</a>" % issue.file_path
            excelFormat()
        except Exception as e:
            print(e)
            flash ("issue init failed")
            flash (e)

    return render_template('issue.html', lb_open_file = lb_open_file )
    

@app.route('/sysConfig', methods=['POST','GET'])
def sysConfig():
    return render_template('sysConfig.html')
    

@app.route('/issues/status/<statustype>',methods=['GET'])
def show_status_issue(i_status):
    print(i_status)

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

@app.route('/knowledge', methods=['POST', 'GET'])
def knowledge():
    return render_template('knowledge.html')


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
def api_issues_sp_status(i_status):
    '''     
    show specified status issue list on the page 
    '''
    df = pd.read_excel(app.config['ISSUE_LIST'])
    df = df.fillna("")
    # df = df.drop(['Description'],axis=1)
    df = df[df['Status'] == i_status]
    ihtml = df.to_html(index=False,table_id="issue_list")
    return ihtml

@app.route('/api/issues_db/status/<i_status>', methods=['GET'])
def api_issues_sp_status_db(i_status):
    '''     
    show specified status issue list on the page from database(sqlite3)
    '''
    issues_list = cur.execute('SELECT * FROM issues where status="' + i_status +'" order by ID').fetchall()
    issues_list = str(issues_list)
    return issues_list

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
        print ('wintitile+='+ wintitle)
        win32gui.EnumWindows(_window_enum_callback, ".*%s.*" % wintitle)
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
    win32gui.EnumWindows(_window_enum_callback, ".*%s.*" % 'VSCode-huawei')
    return "sucess"

@app.route('/api/md_to_html')
def md_to_html():

    extensions = [ #根据不同教程加上的扩展
    'markdown.extensions.extra',
    'markdown.extensions.codehilite', #代码高亮扩展
    'markdown.extensions.toc',
    'markdown.extensions.tables',
    'markdown.extensions.fenced_code',
    ]
    input_file = codecs.open()
    text = input_file.read()
    html = markdown.markdown(text,extensions=extensions)
    return html



# @app.route('/uploadFile', methods=['POST', 'GET'])
# def upload_file_to_server():
#     if request.method == 'POST':
#         f = request.files['file']
#         basepath = os.path.dirname(__file__)  # 当前文件所在路径
#         upload_path = os.path.join(basepath, 'static\uploads',secure_filename(f.filename))  #注意：没有的文件夹一定要先创建，不然会提示没有该路径
#         f.save(upload_path)
#         return redirect(url_for('upload'))
#     return render_template('upload.html')


# @app.route('/impExcelToDB', methods=['POST', 'GET'])
# def imp_excel_to_db():
#     if request.method == 'POST':
#         f = request.files['file']
#         return redirect(url_for('upload'))
#     return render_template('upload.html')


# @app.route('/<path:re_path>')
# def api_openfile(re_path):
#     BASE_DIR = '/'
#     abs_path = os.path.join(BASE_DIR, re_path)
#     if not os.path.exists(abs_path):
#         return abort(404)
#     if os.path.isdir(abs_path):
#         os.system("open %s" % abs_path ) 
#     elif os.path.isfile(abs_path):
#         if os_file_type(abs_path) == "EXCEL":
#             os.system("open -a /Applications/wpsoffice.app %s" % abs_path )
#         elif os_file_type(abs_path) == "TEXT" :
#             if len(re.findall("\.md$",abs_path)) == 1:
#                 os.system("open -a /Applications/Typora.app %s" % abs_path)
#             else:
#                 os.system("code %s" % abs_path)
#         else:
#             flash ('unkow file type')
#     return  "xxx"

if __name__ == '__main__':
    app.run(host='127.0.0.1',port=8484)
    

