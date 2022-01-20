

window.onload =  function(){
    show_knowledge('host')
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



function add_seachiput(tableid){
    let el_search = '<input type="text" id="myInput" onkeyup="tableContentSearch(\'myInput\',\'' + tableid +
    '\')" placeholder="Search..." />'
    el = document.getElementById('search')
    el.innerHTML = el_search

   
}
function show_knowledge(obj){
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET","/api/site/"+obj,true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            if (xmlhttp.responseText ==  "Failed"){
                alert('get site '+ obj +' failed')
                return;
            }
            let res_str=xmlhttp.responseText.replace('\[\(','').replace('\)\]','')
            let res_list = res_str.split('\),\ \(')
            // show as table 
            var el = document.getElementsByClassName('showtable')[0]
            // el.setAttribute('id',"'"+obj +"'" )
            el.setAttribute('id',obj )
            el.innerHTML=""
            // init table  后端是带表头返回的，这里要把[0]拿出来专门生成表头
            var table_head = res_list[0].split(',');
            //创建table
            var table = document.createElement("table");

            table.setAttribute('class','showtable_table')
            //创建设置table的标题
            // var caption=table.createCaption();
            // caption.innerHTML="js operator table";

            // 添加表头
            var head=table.createTHead();
            let thead1 = head.insertRow()
            table_inst_list_to_row_th(thead1,table_head)

            // 把内容加进去
            if (res_list.length>1){
                table_inst_list_to_rows(table,res_list);
            }

            // 把建好的表加到指定元素下
            el.appendChild(table);

            // 将双层列表[[],[]]数据插入到表里
            function table_inst_list_to_rows(base , t_list){
                // index 0是表头，所以要从1开始
                for(let i=1;i<t_list.length;i++){
                    var row=base.insertRow();
                    // 不能使用,分组，要用 ', '
                    // let row_list=t_list[i].split(',')
                    let row_list=t_list[i].split('\', \'')
                    
                    // 把单个LIST的数据插入行
                    table_inst_list_to_row_cell(row,row_list)
                }
            }
            // 单个列表数据插入到行元素
            function table_inst_list_to_row_cell(irow,ilist){
                for(let j=0;j<ilist.length;j++){
                    var cell=irow.insertCell();
                    // 去掉首尾的单引号
                    // ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'')
                    // index 0 前面没有空格，其他有空格，change \n to return
                    ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/gm,String.fromCharCode(10));
                    cell.innerHTML=ilist[j];
                }
            }

            // 将内容插入到表头里
            function table_inst_list_to_row_th(irow,ilist){
                for(let j=0;j<ilist.length;j++){
                    let cell = document.createElement('th') 
                    ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'')
                    cell.innerHTML=ilist[j];                    
                    irow.appendChild(cell)
                    // 去掉首尾的单引号
                }
            }

            add_seachiput(obj)
        }
    }
}

