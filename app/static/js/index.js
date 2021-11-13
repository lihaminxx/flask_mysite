window.onload = function(){
    time_cal()
  
}


function time_cal(){
    let e_days = document.getElementById('codays')
    cdate = new Date(Date.parse(document.getElementById('edate').value)).valueOf()
    nowdate = new Date().getTime()
    time_diff = cdate - nowdate
    c_days = Math.round(time_diff/(24*3600*1000))
    e_days.innerText = c_days
}