/* Book a Free Evaluation */
(function(){
  /* theme: always open in light; toggle still switches */
  var root=document.documentElement;
  root.setAttribute('data-theme','light');
  document.getElementById('themeBtn').addEventListener('click',function(){
    root.setAttribute('data-theme', root.getAttribute('data-theme')==='dark'?'light':'dark');
  });

  var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var today=new Date(); today.setHours(0,0,0,0);
  var view=new Date(today.getFullYear(), today.getMonth(), 1);
  var selected=null, selTime='';

  var grid=document.getElementById('grid'), lbl=document.getElementById('monthLbl');
  var prev=document.getElementById('prev'), next=document.getElementById('next');
  var slot=document.getElementById('slot'), cont=document.getElementById('toStep2');

  function sameDay(a,b){return a.getFullYear()==b.getFullYear()&&a.getMonth()==b.getMonth()&&a.getDate()==b.getDate();}
  function isWeekend(d){var g=d.getDay(); return g===0||g===6;}
  function fmt(d){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}

  function render(){
    lbl.textContent=MONTHS[view.getMonth()]+' '+view.getFullYear();
    prev.disabled=(view.getFullYear()==today.getFullYear()&&view.getMonth()==today.getMonth());
    grid.innerHTML='';
    var first=new Date(view.getFullYear(),view.getMonth(),1);
    var offset=(first.getDay()+6)%7; // Monday-first
    var dim=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
    for(var i=0;i<offset;i++){var b=document.createElement('span');b.className='day blank';grid.appendChild(b);}
    for(var d=1;d<=dim;d++){
      var cell=document.createElement('button'); cell.type='button'; cell.className='day'; cell.textContent=d;
      var date=new Date(view.getFullYear(),view.getMonth(),d);
      if(date<today||isWeekend(date)){cell.disabled=true;}       // past + weekends unavailable
      if(sameDay(date,today)) cell.classList.add('today');
      if(selected&&sameDay(date,selected)) cell.classList.add('sel');
      (function(date){cell.addEventListener('click',function(){selected=date;render();sync();});})(date);
      grid.appendChild(cell);
    }
  }
  function sync(){ cont.disabled=!(selected&&selTime); }

  prev.addEventListener('click',function(){ if(prev.disabled)return; view.setMonth(view.getMonth()-1); render(); });
  next.addEventListener('click',function(){ view.setMonth(view.getMonth()+1); render(); });
  slot.addEventListener('change',function(){ selTime=slot.value; sync(); });

  /* step nav */
  var s1=document.getElementById('s1'), s2=document.getElementById('s2');
  var p1=document.getElementById('pane1'), p2=document.getElementById('pane2'), p3=document.getElementById('pane3');
  function show(p){ [p1,p2,p3].forEach(function(x){x.classList.toggle('show',x===p);}); }

  document.getElementById('toStep2').addEventListener('click',function(){
    if(!(selected&&selTime))return;
    document.getElementById('sumDate').textContent=fmt(selected);
    document.getElementById('sumTime').textContent=selTime+' · 60 min';
    s1.classList.remove('on'); s1.classList.add('done'); s2.classList.add('on');
    show(p2);
  });
  document.getElementById('back').addEventListener('click',function(){
    s2.classList.remove('on'); s1.classList.remove('done'); s1.classList.add('on'); show(p1);
  });
  document.getElementById('form').addEventListener('submit',function(e){
    e.preventDefault();
    var nm=document.getElementById('nm'), em=document.getElementById('em'), sv=document.getElementById('service');
    if(!nm.value.trim()){nm.focus();return;}
    if(!em.checkValidity()){em.focus();return;}
    if(!sv.value){sv.focus();return;}
    document.getElementById('dDate').textContent=fmt(selected);
    document.getElementById('dTime').textContent=selTime+' · 60 min';
    s2.classList.remove('on'); s2.classList.add('done'); show(p3);
  });

  render();
})();
