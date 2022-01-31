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



function add_seachiput(tableid){
    let el_search = '<input type="text" id="myInput" onkeyup="tableContentSearch(\'myInput\',\'' + tableid +
    '\')" placeholder="Search..." />'
    el = document.getElementById('search')
    el.innerHTML = el_search

   
}
function show_knowledge(obj){
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET","/api/knowledge/"+obj,true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            if (xmlhttp.responseText ==  "ERROR"){
                alert('get knowledge '+ obj +' failed')
                return;
            }
            
            let res_str=xmlhttp.responseText.replace(/\[/gm,'').replace(/\]/gm,'').replace(/\'/gm,'')
            // console.log(res_str)
            let res_list = res_str.split('\, ')
            
            // show as table 
            el = document.getElementById('knowledgelist')
            // el.innerHTML = res_list.sort()
            e_li = ''
            for (i=0 ; i < res_list.length; i++){
                filename = res_list[i]
                show_filename = res_list[i].replace(/\.md$/gm,'')
                console.log(filename)
                e_li = e_li + '<li><a onclick="openknowledge(\''  + filename + '\')" >' +  show_filename + '</a></li>' 
            }
            el.innerHTML = e_li
        }
    }
}


function openknowledge(fpath)
{  
    let xhttp = new XMLHttpRequest()
    let r_url = '/api/knowledge/openmdfile/' + fpath 
    // console.log(fpath)
    xhttp.open("GET", r_url, true);
    xhttp.send();
    xhttp.onreadystatechange =  function(){
        if(this.readyState == 4 && this.status == 200){
            console.log(fpath+' open success')
        }
    }
}