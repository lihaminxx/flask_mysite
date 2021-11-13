function convert_cdr()
{
    alert('convert cdr')
}



function s_toggle(fatherTag,classname)
{
    // classname='\'' +classname +'\''
    var toggle_divs =  document.getElementsByClassName(classname)
    function tg(tgname){
        var flag = document.defaultView.getComputedStyle(tgname,null)['display']
        var addicon = '.cdr .'+ fatherTag +'::before{content:"+ "}'
        var minusicon = '.cdr .'+ fatherTag +'::before{content:"- "}'
        if (flag == "none")
        {
            tgname.style="display:block"
            document.styleSheets[0].deleteRule(addicon,0);
        }else{
            console.log(minusicon)
            document.styleSheets[0].insertRule(minusicon,0);
            tgname.style="display:none"
        }
    }

    if (toggle_divs.length == 1){
        toggle_div = toggle_divs[0]
        tg(toggle_div)
    }else {
        for (i=0;i<toggle_divs.length;i++){
            tg(toggle_divs[i])
        }
    }
   
}
function s_toggle_1(){
    console.log('tg1')
    s_toggle('charge_detail','charge_detail_child')
} 

function s_toggle_2(){
    s_toggle('network_detail','network_detail_child')
}   


function convert_cdr()
{
    // let cdr_dic = { 'name':'','servicetype':'',
    // 'createtime':'','starttime':'','endtime':'',
    // 'chargin_detail':'','network_deital':''
    // }
    let dic_cdr = {}
    let arr_dic_col = ['name','servicetype',
    'createtime','starttime','endtime',
    'charging_detail','network_deital'
    ] 
    let dic_charge_detail = {'calling number':'','called number':'','duration':'','mainoffer':''}
    let dic_network_detail = {'cellid':'','networktype':''}
    let cdr = '8702808393|10001|20210903001122|20210903001124|\{18922288822,0023183773,6F9018xG12wws,1\}|80|\{700932099,2002,18922288822,800\}'
    cdrcol = cdr.split('|')
    if (cdrcol.length != arr_dic_col.length){
        alert ('colmun different with cdr cfg')
    }else {
        for (i=0;i<cdrcol.length;i++){
            dic_cdr[arr_dic_col[i]] = cdrcol[i]
        }
    }
    console.log(dic_cdr)
    

    let json_data = document.getElementById('dataid').getAttribute('d')
    let newDiv = document.getElementById("div1")
    let newContent = document.createTextNode(json_data);
    newDiv.appendChild(newContent)

    var text = '{"1": "8702808393", "2": "10001", "3": "20210903001122", "4": "20210903001124", "5": {"5.1": "18922288822", "5.2": "0023183773", "5.3": "6F9018xG12wws", "5.4": "1"}, "6": "80", "7": {"7.1": "700932099", "7.2": "2002", "7.3": "18922288822", "7.4": "800"}}'
    let obj =  JSON.parse(text)
    
}

