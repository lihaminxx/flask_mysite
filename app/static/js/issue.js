window.onload =  function(){
    show_status_issue('Open')
    // show_status_issue_v1('Open')
    issue_list_add_link()
    tableHeadToSelect('Status')
}

// 页面加载好了之后现执行
window.readyState =  function(){
    // show_status_issue('Open')
    // show_status_issue_v1('Open')
    // issue_list_add_link()
    // tableHeadToSelect('Status')
}


function issue_list_add_link()
{
    let issue_list = document.getElementById('issue_list')
    // 通过隐藏的标签获取session变量
    let issue_path = document.getElementById('issuepath').getAttribute('d');
    console.log(issue_list)
    if (issue_list)
    {
        for(var i=1;i<issue_list.rows.length;i++)
        {
            col_content = issue_list.rows[i].cells[0].innerText
            title_content = issue_list.rows[i].cells[3].innerText
            // console.log(col_content)
            // url_content = issue_path  + issue_list.rows[i].cells[1].innerText + "_" +  issue_list.rows[i].cells[3].innerText
            // console.log(issue_list.rows[i].cells[1].innerText.replace(/\-/g,''))
            url_content = issue_path  + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText
            
            title_url = issue_path  + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText +"/" + title_content +".md"
            issue_list.rows[i].cells[0].innerHTML = '<a onclick="openlocal_path(\'' +url_content  + '\')">' + col_content + '</a> '
            issue_list.rows[i].cells[3].innerHTML = '<a onclick="read_md(\'' +title_url  + '\')">' + title_content + '</a> '
            
            // change \n to return
            title_progress =  issue_list.rows[i].cells[6].innerText
            title_progress = title_progress.replace('\\n',String.fromCharCode(10));

            issue_list.rows[i].cells[6].innerHTML ='<textarea name="aaa"  id="" cols="46">' + title_progress + '</textarea>'
            // issue_list.rows[i].cells[0].innerHTML = 'url_content'
        } 
    }
}

// 将指定表头（按列的名字）替换成选择框，这里是用来替换STATUS表头，增加过滤OPEN/CLOSE/PENDING的
function tableHeadToSelect(colName){
    let e_table = document.getElementById('issue_list')
    if (e_table)
    {   
        let th = e_table.rows[0]
        let e_select = '<select name="Status" id="issue_status">' + 
        '<option value="open">Open</option> '+
        '<option value="closed">Closed</option> '+ 
        '<option value="pending">Pending</option> '+ 
    '</select>'
        for (j=0;j<th.cells.length;j++){
            if (th.cells[j].innerText == colName){
                th.cells[j].innerHTML = e_select
            }
        }
    }
}





function time_format()
{
    // change time from yyyymmdd to yyyy/mm/dd
    let issue_list = document.getElementById('issue_list')
    // 通过隐藏的标签获取session变量
    let issue_path = document.getElementById('issuepath').getAttribute('d');
    if (issue_list)
    {
        for(var i=1;i<issue_list.rows.length;i++)
        {
            col_content = issue_list.rows[i].cells[1].innerText
            new_content =  col_content.substr(0,4) + "/" + col_content.substr(4,2) + "/" + col_content.substr(6,2) 
            issue_list.rows[i].cells[1].innerText =  new_content
            // issue_list.rows[i].cells[1].innerHTML = 'url_content'
        } 
    }
}

function show_issue_list(){
    // ajax
    document.getElementById('issues').innerHTML = ""
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET","/api/issues",true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            document.getElementById("issues").innerHTML=xmlhttp.responseText;
            issue_list_add_link()
            // time_format()
        }
    }
}

// 后端读取EXCEL的数据后以to_html形式返回,前端用filter展示
function show_status_issue(i_status){
    document.getElementById('issues').innerHTML = ""
    xmlhttp=new XMLHttpRequest();
    r_url = '/api/issues/status/' + i_status 
    xmlhttp.open("GET",r_url,true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            document.getElementById("issues").innerHTML=xmlhttp.responseText;
            issue_list_add_link()
            // time_format()
        }
    }
}

// V1:更新后端从表查询数据,直接返回,在前端创建表展示
function show_status_issue_v1(i_status){
    let xhttp = new XMLHttpRequest()
    r_url = '/api/issues_db/status/' + i_status
    xhttp.open("GET", r_url , true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            let res_str=xhttp.responseText.replace('\[\(','').replace('\)\]','')
            let res_list = res_str.split('\),\ \(')
            // hide the issue_excel list 
            var el_excel = document.getElementById('issues')
            el_excel.style.display = "block"

            // show as table 
            var el = document.getElementById('issues_db')
            el.innerHTML=""
            // init table 
            var table_head =[
                'ID',
                'CreateTime',
                'Type',
                'Title',
                'Priority',
                'Status',
                'Progress',
                'Owner'
            ];
            //创建table
            var table = document.createElement("table");
   
            table.setAttribute('id','issue_list')
            //创建设置table的标题
            // var caption=table.createCaption();
            // caption.innerHTML="js operator table";
         
            // 添加表头
            var head=table.createTHead();
            let thead1 = head.insertRow()
            table_inst_list_to_row_th(thead1,table_head)

            // 把内容加进去
            table_inst_list_to_rows(table,res_list);

            // 把建好的表加到指定元素下
            el.appendChild(table);
            
            // 两重列表插入到表里
            function table_inst_list_to_rows(base , t_list){
                for(let i=0;i<t_list.length;i++){
                    var row=base.insertRow();
                    let row_list=t_list[i].split(',')
                    // 把单个LIST的数据插入行
                    table_inst_list_to_row_cell(row,row_list)
                }
            }
            // 单个列表数据插入到行元素
            function table_inst_list_to_row_cell(irow,ilist){
                for(let j=0;j<ilist.length;j++){
                    var cell=irow.insertCell();
                    // 去掉首尾的单引号
                    ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'')
                    cell.innerHTML=ilist[j];
                }
            }

            // 将内容插入到表头里
            function table_inst_list_to_row_th(irow,ilist){
                for(let j=0;j<ilist.length;j++){
                    let cell = document.createElement('th') 
                    ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'')
                    cell.innerHTML=ilist[j];                    
                    irow.appendChild(cell)
                    // 去掉首尾的单引号
                }
            }
            issue_list_add_link()
            tableHeadToSelect('Status')
        }
    }
}

// 全路径打开文件目录，如果传和的字符串不包含 D:\则给它加上
function openlocal_path(fpath)
{  
    let xhttp = new XMLHttpRequest()
    if (fpath.indexOf('D:\\') == -1){
        fpath = 'D:\\' + fpath
    }
    r_url = '/api/openlocal/Path/'  + fpath
    xhttp.open("GET", r_url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            if (xhttp.responseText == "Cannot found the file or path"){
                alert(xhttp.responseText)
            }else{
                console.log(xhttp.responseText)
            }
        }
    }
}

// markdown转HTML，不好用，当前没使用
function openlocal_file_md(fpath)
{  
    let xhttp = new XMLHttpRequest()
    if (fpath.indexOf('D:\\') == -1){
        fpath = 'D:\\' + fpath
    }
    console.log('openlocal_file_md')
    let r_url = '/api/openlocal/file/md/' + fpath 
    xhttp.open("GET", r_url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(fpath+' open success')
        }
    }
}

// 打开本地的文件或路径 
function openlocal_file(fpath)
{  
    let xhttp = new XMLHttpRequest()
    if (fpath.indexOf('D:\\') == -1){
        fpath = 'D:\\' + fpath
    }
    let r_url = '/api/openlocal/file/' + fpath 
    xhttp.open("GET", r_url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(fpath+' open success')
        }
    }
}


function createIssue()
{  
    let xhttp = new XMLHttpRequest()
    xhttp.open("GET", '/issue', true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(fpath+' issue create success')
        }
    }
}

// 暂时未使用
function md_to_html(){
    let xhttp = new XMLHttpRequest()
    xhttp.open("GET", '/api/md_to_html', true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("html_show_box").innerHTML=xhttp.responseText;
            document.getElementById("html_show_box").style.display = "block"
        }
    }
}

function read_md(fpath){
    let xhttp = new XMLHttpRequest()
    console.log('decode='+ unescape(fpath))

    fpath=unescape(fpath)
    console.log('after decode='+fpath)
    let url = '/api/readMD/' + fpath
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("html_show_box").innerHTML=xhttp.responseText;
            document.getElementById("html_show_box").style.display = "block"
            document.getElementById("html_show_box").onfocus()
            document.getElementById("edit_show_box").style.display = "block"
            document.getElementById("edit_show_box").addEventListener('click', function(){
                let xhttp = new XMLHttpRequest()
                if (fpath.indexOf('D:\\') == -1){
                    fpath = 'D:\\' + fpath
                }
                let r_url = '/api/openlocal/file/md/' + fpath 
                xhttp.open("GET", r_url, true);
                xhttp.send();
                xhttp.onreadystatechange =  function(){
                    if(this.readyState == 4 && this.status == 200){
                        console.log(fpath+' open success')
                    }
                }
            });
            
        }
    }
}



// 按下 esc时 问题描述 MD文件内容框消失
document.onkeydown=function(e){    //对整个页面监听  
    var keyNum=window.event ? e.keyCode :e.which;       //获取被按下的键值  

    if(keyNum==27){  
        document.getElementById("html_show_box").style.display = "none"
        document.getElementById("edit_show_box").style.display = "none"
    }  

}

// 失去焦点时 问题描述 MD文件内容框消失
function box_onblur(){
    document.getElementById("html_show_box").style.display = "none"
    document.getElementById("edit_show_box").style.display = "none"
}

function box_onfocus(){
    document.getElementById("html_show_box").style.backgroundColor = "#eff"
}

