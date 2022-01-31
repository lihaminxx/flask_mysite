window.onload =  function(){
    show_status_issue('Open')
}



//导出excel 
function exportExcel(id){
    tb = document.getElementById(id)
    let str=''
    for (let i=0;i<tb.rows.length;i++){
        row = tb.rows[i]
        if ( row.style.display == ''){
            // console.log(row.cells)
            for (let j=0;j<row.cells.length-1;j++){
                // console.log(row.cells[j].innerHTML)
                // 表头里的筛选按钮，取值 
                if (i==0 && row.cells[j].childElementCount>0){
                    // console.log( row.cells[4].childNodes[0].selectedOptions[0].innerText)
                    // console.log(row.cells[j].childNodes[0])
                    str += '"' + row.cells[j].childNodes[0].selectedOptions[0].innerText  + '",'  ;
                }else if (i!=0 && row.cells[j].childElementCount>0){
                    // console.log(row.cells[j])
                    // 表格里如果有插入链接时获取值 a标签的值 ，如果是textarea获取value
                    // console.log(row.cells[j].childNodes[0].nodeName)
                    if ( row.cells[j].childNodes[0].nodeName == 'A'){
                        str += '"' +  row.cells[j].childNodes[0].innerText + '",'  ;
                    }
                    if ( row.cells[j].childNodes[0].nodeName == 'TEXTAREA'){
                        // 将 yyyymmdd前面加个换行
                        // str += '"' +  row.cells[j].childNodes[0].value.replace(/ (\d{8})/g,'\r\n'+"$1")  + '",'  ;
                        str += '"' +  row.cells[j].childNodes[0].value  + '",'  ;
                    }                    
                    // str += row.cells[j].childNodes[0].selectedOptions[0].innerText  + '\t' ;
                }else{
                    str += '"' + row.cells[j].innerText + '",' ;
                }
            }
            str += '\n';
        } 
       
    }
    // console.log(str)
    let uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);
    //通过创建a标签
    let link = document.createElement("a");
    link.href = uri;
    link.download = "table_export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// V1:更新后端从表查询数据,直接返回,在前端创建表展示
function show_status_issue(i_status){
    let xhttp = new XMLHttpRequest()
    r_url = '/api/issues_v1/status/' + i_status
    xhttp.open("GET", r_url , true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            if (xhttp.responseText == "get data failed, maybe table not exist"){
                alert("get data failed, maybe table not exist")
                return 
            }
            // console.log(xhttp.responseText)
            let res_str=xhttp.responseText.replace('\[','').replace('\]','').replace(/^\(/,'').replace(/\'\)$/,'')
            let res_list = res_str.split('\),\ \(')
            // console.log(res_list[7])

            // show as table 
            var el = document.getElementById('issues')
            el.style.display = "block"
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
                'Owner',
                'Option'
            ];
            //创建table
            var table = document.createElement("table");
   
            table.setAttribute('id','issues_table')
            //创建设置table的标题
            // var caption=table.createCaption();
            // caption.innerHTML="js operator table";
         
            // 添加表头
            var head=table.createTHead();
            let thead1 = head.insertRow()
            table_inst_list_to_row_th(thead1,table_head)

            var tb1 = table.createTBody();
            // 把内容加进去
            if (res_list.length>0){
                table_inst_list_to_rows(tb1,res_list);
            }
            // 把建好的表加到指定元素下
            el.appendChild(table);
            // 将双层列表[[],[]]数据插入到表里
            function table_inst_list_to_rows(base , t_list){
                for(let i=0;i<t_list.length;i++){
                    var row=base.insertRow();
                    let row_list=t_list[i].split(', \'')
                    // 把单个LIST的数据插入行
                    table_inst_list_to_row_cell(row,row_list)
                }
            }
            // 单个列表数据插入到行元素
            function table_inst_list_to_row_cell(irow,ilist){
                for(let j=0;j<ilist.length;j++){
                    var cell=irow.insertCell();
                    // 去掉首尾的单引号 将\n 替换成HTML能读懂的换行 ,另外每次保存到后台时会多出\r，需要在显示时再删除
                    // ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/gm,String.fromCharCode(10));
                    // ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/g,"<br/>").replace(/\\r/g,'')
                    ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/g,"<br/>").replace(/\\r/g,'')
                    if (j==1){
                        ilist[j] = ilist[j].substring(0,11)
                    }
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
            // 给Status字段添加筛选下拉
            tableHeadToSelect('Status')
            tableHeadToSelect_priority('Priority')
            issue_list_add_option()
            change_color_td('issues_table',5,'Open','rgb(255, 203, 203)')
            change_color_td('issues_table',5,'Closed','rgb(180, 245, 183)')
            change_color_td('issues_table',5,'Pending','#f8f7b6')
            change_color_td('issues_table',4,'Critical','rgb(255, 203, 203)')
            change_color_td('issues_table',4,'Minor','rgb(180, 245, 183)')
            change_color_td('issues_table',4,'Major','#f8f7b6')
        }
    }
}

function issue_list_add_link()
{
    let issue_list = document.getElementById('issues_table')
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
            title_Progress =  issue_list.rows[i].cells[6].innerText
            title_Progress = title_Progress.replace('\\n',String.fromCharCode(10));

            issue_list.rows[i].cells[6].innerHTML ='<textarea name="aaa"  id="" cols="46" >' + title_Progress + '</textarea>'
            // issue_list.rows[i].cells[0].innerHTML = 'url_content'
        } 
    }
}


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

// 将指定表头（按列的名字）替换成选择框，这里是用来替换STATUS表头，增加过滤OPEN/CLOSE/PENDING的
function tableHeadToSelect(colName){
    let e_table = document.getElementById('issues_table')
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

function tableHeadToSelect_priority(colName){
    let e_table = document.getElementById('issues_table')
    if (e_table)
    {   
        let th = e_table.rows[0]
        let e_select = '<select name="Status" id="issue_status" class="select_issue_status" onchange="priorityFilter()">' + 
        '<option value="critical">Critical</option> '+
        '<option value="major">Major</option> '+
        '<option value="Mine">Mine</option> '+ 
    '</select>'
        for (j=0;j<th.cells.length;j++){
            if (th.cells[j].innerText == colName){
                th.cells[j].innerHTML = e_select
            }
        }
    }
}

function priorityFilter(){
    console.log('filter')
}
function issue_list_add_option(){
    let issue_list = document.getElementById('issues_table')
    // let newTH = issue_list.rows[0].insertCell(8)
    // newTH.innerHTML='Option'
    for(let i=1;i<issue_list.rows.length;i++)
    {
        // console.log(issue_list.rows[1])
        let newNameTD = issue_list.rows[i].insertCell(8)
        // onclick事件里传this是为了获取当前行
        newNameTD.innerHTML='<a class="edit_btn" onclick="edit_issue(this)">Edit </a>|<a class="delete_btn" onclick="delete_issue(this)"> Deleted</a>'
    }
}


function delete_issue(obj){
    var a=confirm('Sure delete this Issue?');
    if(a){
        row = obj.parentNode.parentNode
        var index=obj.parentNode.parentNode.rowIndex;
        id = row.cells[0].innerText
        xmlhttp=new XMLHttpRequest();
        xmlhttp.open("GET","/api/issues_v1/delete/"+id,true);
        xmlhttp.send();
        xmlhttp.onreadystatechange=function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
            console.log(xmlhttp.responseText)
            if (xmlhttp.responseText ==  "Failed"){
                    alert('delete issue '+ String(id) + ' failed, please check from backend')
                    return;
            }
            var table = row.parentNode.parentNode
            var len = table.rows.length; 
            table.deleteRow(index);
            alert('issue '+ String(id) + ' success')
            //    for(var i = 0;i < len;i++){
            //        table.deleteRow(index);
            //    }
            }
        }
    }else{
        return false;
    }
    
}


// select 标签选中方法，直接使用value赋值不可行，偶尔不能用
function select_option_true(select,option_value){
    for (var i = 0; i < select.options.length; i++){  
        if (select.options[i].value == option_value){  
            select.options[i].selected = true;  
            break;  
        }  
    }
}
function edit_issue(obj){
    // console.log(obj.parentNode.parentNode)
    // 事件里传入的是a标签，需要获通过父节点获取整个行
    row = obj.parentNode.parentNode
    id = row.cells[0].innerText
    createtime = row.cells[1].innerText
    type = row.cells[2].innerText
    title = row.cells[3].innerText
    priority = row.cells[4].innerText
    console.log(priority)
    status = row.cells[5].innerText
    progress = row.cells[6].firstChild.value
    owner =  row.cells[7].innerText
    
    ed_form = document.forms["edit_form"]
    ed_form.elements["id"].value = id
    ed_form.elements["title"].value = title
    ed_form.elements["createtime"].value = createtime
    // ed_form.elements["status"].value = status
    select_option_true( ed_form.elements["status"],status)
    // ed_form.elements["priority"].value = priority
    select_option_true(ed_form.elements["priority"],priority)
    // ed_form.elements["itype"].value = type
    select_option_true(ed_form.elements["itype"],type)
    ed_form.elements["progress"].value = progress
    let el_edit_issue = document.getElementById('issue_edit')
    el_edit_issue.style.display = "block"
}


function cancel_edit(){
    el_edit_issue = document.getElementById('issue_edit')
    el_edit_issue.style.display = "none"
}


function statusFilter(){
    let el = document.getElementById('issue_status')
    if (el){
        let statusText =  el.options[el.selectedIndex].text
        show_status_issue(statusText)
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