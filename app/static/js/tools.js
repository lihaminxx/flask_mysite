function imp_excel_to_table(){
    let importForm = document.getElementById('importForm')
    // 获取表单里的input控件里上传的文件信息
    uploadfile = document.forms['importForm'].elements['importfile'].files[0]
    tablename = document.forms['importForm'].elements['inputtablename'].value
    if (uploadfile && tablename){
        console.log('file name='+ uploadfile.name)
        console.log('file type='+ uploadfile.type)
        console.log('file size='+ uploadfile.size)
        console.log('table name='+ tablename)
    }else{
        alert('put choose the file and tablename')
    }
    
}

function showtable(){
    tablename = document.getElementById('tablename').value
    if (! tablename){
        alert('tablename can not be null')
    }else{
        let xhttp = new XMLHttpRequest()
        r_url = '/api/tools/showtable/' + tablename
        xhttp.open("get", r_url , true);
        xhttp.send();
        xhttp.onreadystatechange =  function(){
            if(this.readyState == 4 && this.status == 200){
                let res_str=xhttp.responseText.replace('\[\(','').replace('\)\]','')
                if (res_str == "table not exist")
                {
                    alert(res_str)
                    return
                }
                let res_list = res_str.split('\),\ \(')
        
                // show as table 
                var el = document.getElementById('showtable')
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
                        // ilist[j] = ilist[j].replace(/^ \'|\'$/gm,'').replace(/^\'/gm,'').replace(/\\n/gm,String.fromCharCode(10));
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
        }
    }
}

function exp_table_to_excel(){
    alert('import')
}