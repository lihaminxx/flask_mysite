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


function issue_list_add_link_v1()
{
    let issue_list = document.getElementById('issue_list_v1')
    // 通过隐藏的标签获取session变量
    let issue_path = document.getElementById('issuepath').getAttribute('d');
    // console.log(issue_list.rows.length)
    if (issue_list && issue_list.rows.length>1)
    {
        
        for(var i=1;i<issue_list.rows.length;i++)
        {
            col_content = issue_list.rows[i].cells[0].innerText
            title_content = issue_list.rows[i].cells[3].innerText
            // console.log(col_content)
            // url_content = issue_path  + issue_list.rows[i].cells[1].innerText + "_" +  issue_list.rows[i].cells[3].innerText
            // console.log(issue_list.rows[i].cells[1].innerText.replace(/\-/g,''))
            // alert(issue_list.rows[i].cells[1].innerText.replace(/\-/g,''))
            url_content = issue_path  + "\\"  + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText
            title_url = issue_path  + "\\" + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText +"/" + title_content +".md"
            issue_list.rows[i].cells[0].innerHTML = '<a onclick="openlocal_path(\'' +url_content  + '\')">' + col_content + '</a> '
            issue_list.rows[i].cells[3].innerHTML = '<a onclick="read_md(\'' +title_url  + '\')">' + title_content + '</a> '
            
            // change \n to return
            title_Desription =  issue_list.rows[i].cells[6].innerText
            title_Desription = title_Desription.replace('\\n',String.fromCharCode(10));

            issue_list.rows[i].cells[6].innerHTML ='<textarea name="aaa"  id="" cols="46" >' + title_Desription + '</textarea>'
            // issue_list.rows[i].cells[0].innerHTML = 'url_content'
        } 
    }
}

function issue_list_add_link()
{
    let issue_list = document.getElementById('issue_list')
    // 通过隐藏的标签获取session变量
    let issue_path = document.getElementById('issuepath').getAttribute('d');
    // console.log(issue_list.rows.length)
    if (issue_list && issue_list.rows.length>1)
    {
        
        for(var i=1;i<issue_list.rows.length;i++)
        {
            col_content = issue_list.rows[i].cells[0].innerText
            title_content = issue_list.rows[i].cells[3].innerText
            // console.log(col_content)
            // url_content = issue_path  + issue_list.rows[i].cells[1].innerText + "_" +  issue_list.rows[i].cells[3].innerText
            // console.log(issue_list.rows[i].cells[1].innerText.replace(/\-/g,''))
            // alert(issue_list.rows[i].cells[1].innerText.replace(/\-/g,''))
            url_content = issue_path  + "\\"  + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText
            title_url = issue_path  + "\\" + issue_list.rows[i].cells[1].innerText.replace(/\-/g,'') + "_" +  issue_list.rows[i].cells[3].innerText +"/" + title_content +".md"
            issue_list.rows[i].cells[0].innerHTML = '<a onclick="openlocal_path(\'' +url_content  + '\')">' + col_content + '</a> '
            issue_list.rows[i].cells[3].innerHTML = '<a onclick="read_md(\'' +title_url  + '\')">' + title_content + '</a> '
            
            // change \n to return
            title_Desription =  issue_list.rows[i].cells[6].innerText
            title_Desription = title_Desription.replace('\\n',String.fromCharCode(10));

            issue_list.rows[i].cells[6].innerHTML ='<textarea name="aaa"  id="" cols="46" >' + title_Desription + '</textarea>'
            // issue_list.rows[i].cells[0].innerHTML = 'url_content'
        } 
    }
}

// 给表添加一列，用于存放编辑选项 Edit/Delete
function issue_list_add_option(){
    let issue_list = document.getElementById('issue_list')
    let newTH = issue_list.rows[0].insertCell(8)
    newTH.innerHTML='Option'
    for(let i=1;i<issue_list.rows.length;i++)
    {
        let newNameTD = issue_list.rows[i].insertCell(8)
        // onclick事件里传this是为了获取当前行
        newNameTD.innerHTML='<a class="edit_btn" onclick="edit_issue(this)">Edit </a>|<a class="delete_btn" > Deleted</a>'
    }
}

function issue_list_add_option_v1(){
    let issue_list = document.getElementById('issue_list')
    let newTH = issue_list.rows[0].insertCell(8)
    newTH.innerHTML='Option'
    for(let i=1;i<issue_list.rows.length;i++)
    {
        let newNameTD = issue_list.rows[i].insertCell(8)
        // onclick事件里传this是为了获取当前行
        newNameTD.innerHTML='<a class="edit_btn" onclick="edit_issue_v1(this)">Edit </a>|<a class="delete_btn" onclick="delete_issue(this)"> Deleted</a>'
    }
}


function delete_issue(obj){
    row = obj.parentNode.parentNode
    var index=obj.parentNode.parentNode.rowIndex;
    id = row.cells[0].innerText
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET","/api/issues/saveedit_v1/delete/"+id,true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
           console.log(xmlhttp.responseText)
           var table = row.parentNode.parentNode
           console.log(table)
           console.log(index)
           var len = table.rows.length; 
           for(var i = 0;i < len;i++){
               table.deleteRow(index);
           }
        }

    }
}

// 修改表格里的行
function edit_issue(edd){
    // console.log(edd.parentNode.parentNode)
    // 事件里传入的是a标签，需要获通过父节点获取整个行
    row = edd.parentNode.parentNode
    id = row.cells[0].innerText
    createtime = row.cells[1].innerText
    type = row.cells[2].innerText
    title = row.cells[3].innerText
    priority = row.cells[4].innerText
    status = row.cells[5].innerText
    progress = row.cells[6].firstChild.value
    owner =  row.cells[7].innerText
    
    ed_form = document.forms["edit_form"]
    ed_form.elements["id"].value = id
    ed_form.elements["title"].value = title
    ed_form.elements["createtime"].value = createtime
    ed_form.elements["status"].value = status
    ed_form.elements["priority"].value = priority
    ed_form.elements["type"].value = type
    ed_form.elements["progress"].value = progress

    el_edit_issue = document.getElementById('issue_edit')
    el_edit_issue.style.display = "block"

}

// function edit_issue_v1(edd){
//     // console.log(edd.parentNode.parentNode)
//     // 事件里传入的是a标签，需要获通过父节点获取整个行
//     row = edd.parentNode.parentNode
//     id = row.cells[0].innerText
//     createtime = row.cells[1].innerText
//     type = row.cells[2].innerText
//     title = row.cells[3].innerText
//     priority = row.cells[4].innerText
//     status = row.cells[5].innerText
//     progress = row.cells[6].firstChild.value
//     owner =  row.cells[7].innerText
    
//     ed_form = document.forms["edit_form_v1"]
//     ed_form.elements["id"].value = id
//     ed_form.elements["title"].value = title
//     ed_form.elements["createtime"].value = createtime
//     ed_form.elements["status"].value = status
//     ed_form.elements["priority"].value = priority
//     ed_form.elements["type"].value = type
//     ed_form.elements["progress"].value = progress

//     let el_edit_issue = document.getElementById('issue_edit_v1')
//     el_edit_issue.style.display = "block"
// }



// function save_edit(this){
//     console.log(this)
//     let r_url = '/api/issues/saveedit' 
//     xhttp.open("POST", r_url, true);
//     xhttp.send();
//     xhttp.onreadystatechange =  function(){
//         if(this.readyState == 4 && this.status == 200){
//             console.log(fpath+' open success')
//         }
//     }
// }

function cancel_edit(){
    el_edit_issue = document.getElementById('issue_edit')
    el_edit_issue.style.display = "none"
}
function cancel_edit_v1(){
    el_edit_issue = document.getElementById('issue_edit_v1')
    el_edit_issue.style.display = "none"
}


// 将指定表头（按列的名字）替换成选择框，这里是用来替换STATUS表头，增加过滤OPEN/CLOSE/PENDING的
function tableHeadToSelect(colName){
    let e_table = document.getElementById('issue_list')
    if (e_table)
    {   
        let th = e_table.rows[0]
        let e_select = '<select name="Status" id="issue_status" class="select_issue_status" onchange="statusFilter()">' + 
        '<option value="all">Status</option> '+
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

// 将指定表头（按列的名字）替换成选择框，这里是用来替换STATUS表头，增加过滤OPEN/CLOSE/PENDING的
function tableHeadToSelect_v1(colName){
    let e_table = document.getElementById('issue_list')
    if (e_table)
    {   
        let th = e_table.rows[0]
        let e_select = '<select name="Status" id="issue_status_v1" class="select_issue_status" onchange="statusFilter_v1()">' + 
        '<option value="all">Status</option> '+
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

function statusFilter(){
    let el = document.getElementById('issue_status')
    if (el){
        let statusText =  el.options[el.selectedIndex].text
        console.log(statusText)
        show_status_issue(statusText)
    }
}

function statusFilter_v1(){
    let el = document.getElementById('issue_status')
    if (el){
        let statusText =  el.options[el.selectedIndex].text
        show_status_issue_v1(statusText)
    }
}


// 表格内容搜索框，搜索指定列的内容，并显示结果 cols(列索引)，如[1,2,3]
function tableContentSearch(searchBoxID,tableID,cols=[]){
    let input, filter, table, tr, td, i;
    table = document.getElementById(tableID)
    tr = table.getElementsByTagName("tr");
    input = document.getElementById(searchBoxID);
    filter = input.value.toUpperCase();
    // 如果没有指定搜索列，则全部搜索 
    // cols=[0,1,2,3,4,5,6,7,8]
    
    for (i = 1; i < tr.length; i++) {
        // td = tr[i].getElementsByTagName("td")[0];
        cols_list = tr[i].getElementsByTagName("td");
        ifmatch = 0
        for (j=0 ;j <= cols_list.length; j++){
            td = cols_list[j]
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    ifmatch = 1
                } 
              } 
        }
        if (ifmatch == 0){
            tr[i].style.display = "none";
        }else{
            tr[i].style.display = "";
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
            issue_list_add_option()
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
            document.getElementById("issues").style.display = "none" ;
            document.getElementById("issues").innerHTML=xmlhttp.responseText;
            document.getElementById("issues").style.display = "block";
            issue_list_add_link()
            // time_format()
            tableHeadToSelect('Status')
            issue_list_add_option()
            change_color_td('issue_list',5,'Open','rgb(255, 203, 203)')
            change_color_td('issue_list',5,'Closed','rgb(180, 245, 183)')
            change_color_td('issue_list',5,'Pending','#f8f7b6')
            change_color_td('issue_list',4,'Critical','rgb(255, 203, 203)')
            change_color_td('issue_list',4,'Minor','rgb(180, 245, 183)')
            change_color_td('issue_list',4,'Major','#f8f7b6')
            // table_pagenation('issue_list')

        }
    }
}

// // V1:更新后端从表查询数据,直接返回,在前端创建表展示
// function show_status_issue_v1(i_status){
//     let xhttp = new XMLHttpRequest()
//     r_url = '/api/issues_db/status/' + i_status
//     xhttp.open("GET", r_url , true);
//     xhttp.send();
//     xhttp.onreadystatechange =  function(){
//         if(this.readyState == 4 && this.status == 200){
//             let res_str=xhttp.responseText.replace('\[\(','').replace('\)\]','')
//             let res_list = res_str.split('\),\ \(')

//             // show as table 
//             // document.getElementById('issues').style.display = "none"
//             var el = document.getElementById('issues')
//             el.style.display = "block"
//             el.innerHTML=""
//             // init table 
//             var table_head =[
//                 'ID',
//                 'CreateTime',
//                 'Type',
//                 'Title',
//                 'Priority',
//                 'Status',
//                 'Desription',
//                 'Owner'
//             ];
//             //创建table
//             var table = document.createElement("table");
   
//             // table.setAttribute('id','issue_list_db')
//             table.setAttribute('class','issue_list')
//             table.setAttribute('id','issues_table')
//             //创建设置table的标题
//             // var caption=table.createCaption();
//             // caption.innerHTML="js operator table";
         
//             // 添加表头
//             var head=table.createTHead();
//             let thead1 = head.insertRow()
//             table_inst_list_to_row_th(thead1,table_head)

//             var tb1 = table.createTBody();
//             // 把内容加进去
//             if (res_list.length>1){
//                 table_inst_list_to_rows(tb1,res_list);
//             }

//             // 把建好的表加到指定元素下
//             el.appendChild(table);
            
//             // 将双层列表[[],[]]数据插入到表里
//             function table_inst_list_to_rows(base , t_list){
//                 for(let i=0;i<t_list.length;i++){
//                     var row=base.insertRow();
//                     let row_list=t_list[i].split('\', \'')
//                     // 把单个LIST的数据插入行
//                     table_inst_list_to_row_cell(row,row_list)
//                 }
//             }
//             // 单个列表数据插入到行元素
//             function table_inst_list_to_row_cell(irow,ilist){
//                 for(let j=0;j<ilist.length;j++){
                  
//                     var cell=irow.insertCell();
//                     // 去掉首尾的单引号
//                     ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/gm,String.fromCharCode(10));
//                     if (j==1){
//                         ilist[j] = ilist[j].substring(0,11)
//                     }
//                     cell.innerHTML=ilist[j];
//                 }
//             }

//             // 将内容插入到表头里
//             function table_inst_list_to_row_th(irow,ilist){
//                 for(let j=0;j<ilist.length;j++){
//                     let cell = document.createElement('th') 
//                     ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'')
//                     cell.innerHTML=ilist[j];                    
//                     irow.appendChild(cell)
//                     // 去掉首尾的单引号
//                 }
//             }
//             issue_list_add_link_v1()

//             // 给Status字段添加筛选下拉
//             tableHeadToSelect_v1('Status')
//             issue_list_add_option_v1()
//             change_color_td('issues_table',5,'Open','rgb(255, 203, 203)')
//             change_color_td('issues_table',5,'Closed','rgb(180, 245, 183)')
//             change_color_td('issues_table',5,'Pending','#f8f7b6')
//             change_color_td('issues_table',4,'Critical','rgb(255, 203, 203)')
//             change_color_td('issues_table',4,'Minor','rgb(180, 245, 183)')
//             change_color_td('issues_table',4,'Major','#f8f7b6')
//         }
//     }
// }

function change_color_td(table_id,colnum,value,scolor){
    let e_table = document.getElementById(table_id)
    if (e_table)
    {   
        for (let i=0;i<e_table.rows.length; i++){
            let th = e_table.rows[i]
            for(let j=0;j<th.cells.length ;j++){
                if (j==colnum && th.cells[j].innerText==value){
                    th.cells[j].style.backgroundColor = scolor
                }
                
                
            }
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
    console.log('aaa' + fpath)
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
    // console.log('aaa' + fpath)
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
            if (xhttp.responseText == "success"){
                alert(xhttp.responseText)
            }else{
                alert(xhttp.responseText)
            }
            // console.log(fpath+' issue create success')
        }
    }
}

// 暂时未使用
// function md_to_html(){
//     let xhttp = new XMLHttpRequest()
//     xhttp.open("GET", '/api/md_to_html', true);
//     xhttp.send();
//     xhttp.onreadystatechange =  function(){
//         if(this.readyState == 4 && this.status == 200){
//             document.getElementById("html_show_box").innerHTML=xhttp.responseText;
//             document.getElementById("html_show_box").style.display = "block"
//         }
//     }
// }


var clickFun  = null 
function read_md(fpath){
    let xhttp = new XMLHttpRequest()
    // console.log('decode='+ unescape(fpath))

    
    function edit_show_box_event(){
        let xhttp = new XMLHttpRequest()
        console.log('aaa' + fpath)
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
    }

    fpath=unescape(fpath)
    // console.log('after decode='+fpath)
    let url = '/api/readMD/' + fpath
    xhttp.open("GET", url, true);
    xhttp.send();

    xhttp.onreadystatechange =  function(){        
        if(this.readyState == 4 && this.status == 200){
            let el_edit = document.getElementById("edit_show_box")
            // document.getElementById("edit_show_box").removeEventListener('click',edit_show_box_event );
            document.getElementById("html_show_box").innerHTML=xhttp.responseText;
            document.getElementById("html_show_box").style.display = "block"
            document.getElementById("html_show_box").onfocus()
            document.getElementById("edit_show_box").style.display = "block"
            // https://blog.csdn.net/amyleeYMY/article/details/83382741 无法正常remove会导致打开多个文件 
            aa = function() {
                clickFun  && el_edit.removeEventListener("click",clickFun)
                clickFun = edit_show_box_event
                el_edit.addEventListener("click",clickFun)
            }
            setInterval(function(){
                aa ()
            },2000)
            // document.getElementById("edit_show_box").addEventListener('click',edit_show_box_event );
        }
    }
}



// 按下 esc时 问题描述 MD文件内容框消失
document.onkeydown=function(e){    //对整个页面监听  
    var keyNum=window.event ? e.keyCode :e.which;       //获取被按下的键值  

    if(keyNum==27){  
        document.getElementById("html_show_box").style.display = "none"
        document.getElementById("edit_show_box").style.display = "none"
        document.getElementById("issue_edit").style.display = "none"
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

function table_pagenation(tableid){
    var nowPage = 0, //当前页
    count = 10, //每页显示多少条消息
    pageAll = 0; //总页数
    var testDataList = []; //创建一个存放数据的数组
    testDataList = document.getElementById(tableid)
    
    if (testDataList){
        pageAll = Math.ceil((testDataList.rows.length) / count); //计算总页数
        var setTable = function () { //数据渲染表格
            var onePageData = []; //用来存放一页的数据
            for (var i = 1;i<=count; i++) { //满足当前数据小于没到当前页的最后一条数据 ，并且当前数据没到最后一条数据
                {
                    onePageData.push(testDataList.rows[i + nowPage * count]);// 这个循环会循环五次  把五条数据放到列表里
                }
            }
            testDataList.querySelector('tbody').innerHTML=''
            for (let tri=0; tri<onePageData.length; tri++){
                isr = testDataList.querySelector('tbody').insertRow(testDataList.rows.length-1)
                isr.innerHTML = onePageData[tri].innerHTML; //渲染当前页数据
            }
        }
        setTable();
    }
    else{
        alert(tableid + ' not exist')
    }
}
    
// function PreTablepage() { //上一页
//     console.log('click')
//     if (nowPage == 0) //当前页数是第一页则返回
//         return
//     nowPage--;
//     // setTable();
// }
// function NextTablepage () {//下一页
//     if (nowPage >= pageAll-1) //当前页数是最后一页则返回  这么写是因为总页数不一定是整数
//         return
//     nowPage++;
//     setTable();
//     debugger
// }