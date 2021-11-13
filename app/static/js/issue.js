window.onload =  function(){
    show_issue_list()
    issue_list_add_link()
    tableHeadToSelect('Status')
}

function issue_list_add_link()
{
    let issue_list = document.getElementById('issue_list')
    // 通过隐藏的标签获取session变量
    let issue_path = document.getElementById('issuepath').getAttribute('d');
    if (issue_list)
    {
        for(var i=1;i<issue_list.rows.length;i++)
        {
            col_content = issue_list.rows[i].cells[0].innerText
            title_content = issue_list.rows[i].cells[3].innerText
            // console.log(col_content)
            url_content = issue_path  + issue_list.rows[i].cells[1].innerText + "_" +  issue_list.rows[i].cells[3].innerText
            title_url = issue_path  + issue_list.rows[i].cells[1].innerText + "_" +  issue_list.rows[i].cells[3].innerText +"/" + title_content +".md"
            issue_list.rows[i].cells[0].innerHTML = '<a onclick="openfile(\'' +url_content  + '\')">' + col_content + '</a> '
            issue_list.rows[i].cells[3].innerHTML = '<a onclick="read_md(\'' +title_url  + '\')">' + title_content + '</a> '

            // issue_list.rows[i].cells[0].innerHTML = 'url_content'
        } 
    }
}

function tableHeadToSelect(colName){
    let e_table = document.getElementById('issue_list')
    if (e_table)
    {   
        let th = e_table.rows[0]
        let e_select = '<select name="" id="issue_status">' + 
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
            time_format()
        }
    }
}

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
            time_format()
        }
    }
}

function openfile(fpath)
{  
    let xhttp = new XMLHttpRequest()
    xhttp.open("GET", fpath, true);
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
    url = '/api/readMD/' + fpath
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("html_show_box").innerHTML=xhttp.responseText;
            document.getElementById("html_show_box").style.display = "block"
            document.getElementById("html_show_box").onfocus()
        }
    }
}


document.onkeydown=function(e){    //对整个页面监听  
    var keyNum=window.event ? e.keyCode :e.which;       //获取被按下的键值  
    //判断如果用户按下了回车键（keycody=13）  
    if(keyNum==13){  
        alert('您按下了回车');  
    }  
    //判断如果用户按下了空格键(keycode=32)，  
    if(keyNum==32){  
        alert('您按下了空格');  
    }  
    //判断如果用户按下了Shift键(keycode=32)和回车键（keycody=13）  
    if (13 == e.keyCode && e.shiftKey){
        alert('您按下了Shift和回车');  
    }
}

function box_onblur(){
    document.getElementById("html_show_box").style.display = "none"
}

function box_onfocus(){
    document.getElementById("html_show_box").style.backgroundColor = "#eff"
}

