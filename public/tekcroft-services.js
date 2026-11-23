!function(){
  function mountServicesFilters(){
    var reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
    var root=document.querySelector(".pg-services")||document;
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add("in"); io.unobserve(e.target);}
      });
    },{threshold:.12});
    root.querySelectorAll(".rv").forEach(function(el){io.observe(el);});
    var chips=document.getElementById("chips");
    var cards=[].slice.call(document.querySelectorAll(".scard"));
    if(!chips||!cards.length) return;
    /* Soft-nav remounts page HTML — bind once per chips node */
    if(chips.getAttribute("data-tc-wired")==="1") return;
    chips.setAttribute("data-tc-wired","1");
    chips.addEventListener("click",function(e){
      var chip=e.target.closest(".chip"); if(!chip) return;
      chips.querySelectorAll(".chip").forEach(function(c){c.classList.remove("on");});
      chip.classList.add("on");
      var cat=chip.dataset.cat;
      cards.forEach(function(c){
        var show=(cat==="all"||c.dataset.cat===cat);
        c.classList.toggle("hide",!show);
        c.classList.remove("pop");
        if(show&&!reduce){ void c.offsetWidth; c.classList.add("pop"); }
      });
    });
  }
  mountServicesFilters();
  if(!window.__tekcroftServicesNavBound){
    window.__tekcroftServicesNavBound=true;
    window.addEventListener("tekcroft:nav", mountServicesFilters);
  }
}();
