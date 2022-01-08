
 function getOsInfo (){  
    var userAgent = navigator.userAgent.toLowerCase();  
    var name = 'Unknown';    
    if (userAgent.indexOf('win') > -1) {  
      name = 'Windows';  
    } else if (userAgent.indexOf('iphone') > -1) {  
      name = 'iPhone';  
    } else if (userAgent.indexOf('mac') > -1) {  
      name = 'Mac';  
    } else if (userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {  
      name = 'Unix';  
    } else if (userAgent.indexOf('linux') > -1) {  
      if (userAgent.indexOf('android') > -1) {  
        name = 'Android';  
    } else {  
        name = 'Linux';  
    }  
    } else {  
      name = 'Unknown';  
    }  
    return  name;  
}

window.onload = function(){
    
    let ot = document.getElementById('ostype').value
    let isp = document.getElementById('issuepath').value
    let isl = document.getElementById('issuelist').value
    if (ot){
        console.log(ot)
    }else{
        alert('use are the fisrt time use system, please input the configuration!')
        let o_type = getOsInfo()
        document.getElementById('ostype').value = o_type
    }

}

function updateSysConfig(){
    // ajax
    // let ispath = document.getElementById('issuepath').value
    // let islist = document.getElementById('issuelist').value
    // let ostype = document.getElementById('ostype').value
    let url = "/sysConfig"
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST",url,true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            alert('update success!')            // time_format()
        }
    }
}

