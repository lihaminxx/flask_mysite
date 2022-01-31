window.onload = function(){
    time_cal()
    collect_issue_report()
  
}


function time_cal(){
    let e_days = document.getElementById('codays')
    cdate = new Date(Date.parse(document.getElementById('edate').value)).valueOf()
    nowdate = new Date().getTime()
    time_diff = cdate - nowdate
    c_days = Math.round(time_diff/(24*3600*1000))
    e_days.innerText = c_days
}

function dbtable_to_htmltable(requestres,obj){
    let res_str=requestres.replace('\[\(','').replace('\)\]','')
    let res_list = res_str.split('\),\ \(')
    // show as table 
    var el = document.getElementById(obj)
    el.innerHTML=""
    // init table  后端是带表头返回的，这里要把[0]拿出来专门生成表头
    var table_head = res_list[0].split(',');
    //创建table
    var table = document.createElement("table");

    table.setAttribute('class','issue_report')
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
            // 不能使用,分组，要用 ', '，如果字段不是字符串还得变为 , 
            let row_list=t_list[i].split('\', ')
            
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
            // ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/gm,String.fromCharCode(10));
            console.log(ilist[j])
            ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/g,"<br/>").replace(/\\r/g,'')
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
}


function collect_issue_report(){
        let xhttp = new XMLHttpRequest()
        r_url = '/api/index/issueReport'
        xhttp.open("get", r_url , true);
        xhttp.send();
        xhttp.onreadystatechange =  function(){
            if(this.readyState == 4 && this.status == 200){
                if (xhttp.responseText == "Failed")
                {
                    alert('collect issue report failed, please check backend')
                    return
                }
                let res_str=xhttp.responseText
                dbtable_to_htmltable (res_str,'issue_report')
            }
        }
}