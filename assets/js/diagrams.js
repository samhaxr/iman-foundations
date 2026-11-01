/* Interactive diagrams (inline SVG + vanilla JS, no libraries) */
(function(){
  'use strict';
  var NS='http://www.w3.org/2000/svg';
  var EN=window.App&&App.lang==='en';
  var S=EN?{see:'See in lesson',negaria:'What is negated',aff:'<p style="margin:.2em 0;color:var(--navy)"><b>Negation + affirmation = <span lang="ar" dir="rtl" class="arq">«فَمَن يَكْفُرْ بِٱلطَّٰغُوتِ وَيُؤْمِنۢ بِٱللَّهِ»</span></b> (al-Baqarah <bdi class="ref">2:256</bdi>)</p>',chips:'Requirements of the kalimah in the light of the texts',ayah:'Verse',hadith:'Hadith',foot:': the three levels together are "the religion"',dealings:'Ihsan in dealings',err:'The diagram could not be loaded; all the evidence is given below.',sep:'. ',comma:', '}
    :{see:'سبق میں دیکھیں',negaria:'جن کی نفی ہوتی ہے',aff:'<p style="margin:.2em 0;color:var(--navy)"><b>نفی + اثبات = «فَمَن يَكْفُرْ بِٱلطَّٰغُوتِ وَيُؤْمِنۢ بِٱللَّهِ»</b> (البقرہ <bdi class="ref">2:256</bdi>)</p>',chips:'کلمے کے تقاضے: نصوص کی روشنی میں',ayah:'آیت',hadith:'حدیث',foot:': تینوں درجے مل کر «دین»',dealings:'معاملات میں احسان',err:'خاکہ لوڈ نہیں ہو سکا؛ تمام دلائل نیچے موجود ہیں۔',sep:'۔ ',comma:'، '};
  function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
  function txt(parent,x,y,s,size,fill,weight,maxW){var t=el('text',{x:x,y:y,'text-anchor':'middle','dominant-baseline':'middle','font-size':size,fill:fill||'#fff','font-weight':weight||400},parent);t.textContent=s;if(maxW){try{var w=t.getComputedTextLength();if(w>maxW)t.setAttribute('font-size',Math.max(9,Math.floor(size*maxW/w)));}catch(e){}}return t;}
  function esc(s){return window.App?App.esc(s):s;}
  var ARRUN=/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF]+(?:[ \u00A0]+[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDF9\uFDFB-\uFDFF\uFE70-\uFEFF]+)*/g;
  function escw(s){s=esc(s);return EN?s.replace(ARRUN,function(m){return '<span lang="ar" dir="rtl" class="arq">'+m+'</span>';}):s;}
  function refHTML(r){
    var tok=r[0],key=r[1],R=window.REF[tok];if(!R)return '';
    var here=R.a?' · <a href="'+R.a+'">'+S.see+'</a>':'';
    var link='<span class="refline"><a href="'+R.u+'" target="_blank" rel="noopener">'+esc(R.l)+'</a>'+here+'</span>';
    if(tok.charAt(0)==='Q') return '<div class="dref"><p class="ar qr" lang="ar">'+esc(R.ar)+'</p><p class="ur">'+esc(R.tr)+'</p>'+link+'</div>';
    return '<div class="dref"><b>'+escw(R.t)+'</b>'+((key||R.k)?'<p class="ar" lang="ar">«'+esc(key||R.k)+'»</p>':'')+link+'</div>';
  }
  function show(panel,node,extra){
    panel.innerHTML='<h3>'+escw(node.label)+'</h3><p style="margin:.2em 0">'+escw(node.desc)+'</p>'+(extra||'')+'<div class="refs">'+node.refs.map(refHTML).join('')+'</div>';
    panel.style.animation='none';void panel.offsetWidth;panel.style.animation='';
  }
  function makeNode(svg,g,onAct,label){
    g.setAttribute('class','node');g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',label);
    g.addEventListener('click',onAct);
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();onAct();}});
  }
  function setActive(svg,g){svg.querySelectorAll('.node').forEach(function(n){n.classList.remove('active');n.setAttribute('aria-pressed','false');});if(g){g.classList.add('active');g.setAttribute('aria-pressed','true');}}
  function chipsRow(host,chips,panel,title){
    if(!chips)return;
    var wrap=document.createElement('div');
    wrap.innerHTML='<h3 style="margin:14px 0 0;color:var(--navy)">'+esc(title)+'</h3>';
    var row=document.createElement('div');row.className='chips';
    chips.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='chipbtn';b.textContent=c.label;b.setAttribute('aria-pressed','false');
      b.addEventListener('click',function(){row.querySelectorAll('.chipbtn').forEach(function(x){x.setAttribute('aria-pressed','false');});host.querySelectorAll('[aria-pressed=true]').forEach(function(x){x.setAttribute('aria-pressed','false');if(x.classList)x.classList.remove('active');});b.setAttribute('aria-pressed','true');show(panel,c);});
      row.appendChild(b);});
    wrap.appendChild(row);host.insertBefore(wrap,panel);
  }
  var R={};
  R.flow=function(host,D){
    var panel=document.createElement('div');panel.className='dpanel';panel.setAttribute('aria-live','polite');
    var holder=document.createElement('div');host.appendChild(holder);host.appendChild(panel);
    var cur=0;
    function draw(){
      holder.innerHTML='';var wide=host.clientWidth>=700,n=D.nodes.length;
      var W=wide?1000:420,Hh=wide?250:n*128+10;
      var svg=el('svg',{viewBox:'0 0 '+W+' '+Hh,role:'group','aria-label':D.title},holder);
      var defs=el('defs',{},svg);var m=el('marker',{id:'arr',viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'},defs);el('path',{d:'M0 0L10 5L0 10z',fill:'#c8962e'},m);
      D.nodes.forEach(function(nd,i){
        var w,h,x,y;
        if(wide){w=172;h=150;x=EN?14+i*(w+30):W-14-i*(w+30)-w;y=50;}else{w=360;h=96;x=30;y=10+i*128;}
        if(i<n-1){ if(wide) el('line',{x1:EN?x+w+2:x-2,y1:y+h/2,x2:EN?x+w+26:x-26,y2:y+h/2,stroke:'#c8962e','stroke-width':4,'marker-end':'url(#arr)'},svg); else el('line',{x1:W/2,y1:y+h+2,x2:W/2,y2:y+h+28,stroke:'#c8962e','stroke-width':4,'marker-end':'url(#arr)'},svg); }
        var g=el('g',{},svg);
        el('rect',{class:'shape',x:x,y:y,width:w,height:h,rx:22,fill:i%2?'#1b2a4a':'#14213d',stroke:'#e3b955','stroke-width':2},g);
        el('circle',{cx:EN?x+6:x+w-6,cy:y+6,r:20,fill:'#c8962e'},g);
        txt(g,EN?x+6:x+w-6,y+8,App.ud(i+1),20,'#1d1600',700);
        txt(g,x+w/2,y+(wide?h*0.40:h*0.36),nd.label,wide?25:26,'#f6e7c1',700,w-24);
        txt(g,x+w/2,y+(wide?h*0.74:h*0.74),nd.sub,wide?16:18,'#e6eaf3',400,w-20);
        makeNode(svg,g,function(){cur=i;setActive(svg,g);show(panel,nd);},nd.label+S.comma+nd.sub);
        if(i===cur)setActive(svg,g);
      });
    }
    draw();show(panel,D.nodes[0]);
    var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(draw,150);});
  };
  R.kalima=function(host,D){
    var split=document.createElement('div');split.className='kalima-split';
    var panel=document.createElement('div');panel.className='dpanel';panel.setAttribute('aria-live','polite');
    function mk(side,cls){var b=document.createElement('button');b.type='button';b.className='kbtn '+cls;b.lang='ar';b.innerHTML=esc(side.label)+'<small>'+esc(side.sub)+'</small>';b.setAttribute('aria-pressed','false');split.appendChild(b);return b;}
    var bn=mk(D.neg,'neg'),ba=mk(D.aff,'aff');
    function sel(b,side,extra){[bn,ba].forEach(function(x){x.setAttribute('aria-pressed',x===b);});host.querySelectorAll('.chipbtn').forEach(function(x){x.setAttribute('aria-pressed','false');});show(panel,side,extra);}
    var negx='<div class="neg-list" aria-label="'+S.negaria+'">'+D.neg.items.map(function(s){return '<span>'+esc(s)+'</span>';}).join('')+'</div>';
    bn.addEventListener('click',function(){sel(bn,D.neg,negx);});
    ba.addEventListener('click',function(){sel(ba,D.aff,S.aff);});
    host.appendChild(split);host.appendChild(panel);
    chipsRow(host,D.chips,panel,S.chips);
    sel(bn,D.neg,negx);
  };
  R.tree=function(host,D){
    var holder=document.createElement('div');var panel=document.createElement('div');panel.className='dpanel';panel.setAttribute('aria-live','polite');
    host.appendChild(holder);host.appendChild(panel);var cur=-1;
    function draw(){
      holder.innerHTML='';var wide=host.clientWidth>=640;var W=wide?1000:500,Hh=wide?420:640;
      var svg=el('svg',{viewBox:'0 0 '+W+' '+Hh,role:'group','aria-label':D.title},holder);
      var rx=W/2,ry=wide?70:70;
      var pos=D.nodes.map(function(n,i){ if(wide) return [EN?125+i*250:W-125-i*250,300]; return EN?[i%2?370:130, i<2?290:520]:[i%2? 130:370, i<2?290:520]; });
      // trunk + branches
      el('path',{d:'M'+rx+' '+(ry+40)+' L'+rx+' '+(wide?190:180),stroke:'#8a6d1e','stroke-width':10,'stroke-linecap':'round',fill:'none'},svg);
      pos.forEach(function(p){el('path',{d:'M'+rx+' '+(wide?190:180)+' C '+rx+' '+(wide?240:230)+', '+p[0]+' '+(p[1]-110)+', '+p[0]+' '+(p[1]-52),stroke:'#8a6d1e','stroke-width':6,fill:'none','stroke-linecap':'round'},svg);});
      D.nodes.forEach(function(nd,i){
        var p=pos[i],g=el('g',{},svg);
        el('rect',{class:'shape',x:p[0]-105,y:p[1]-52,width:210,height:104,rx:52,fill:'#1b2a4a',stroke:'#e3b955','stroke-width':2},g);
        txt(g,p[0],p[1]-14,nd.label,26,'#f6e7c1',700,186);txt(g,p[0],p[1]+24,nd.sub,16,'#e6eaf3',400,190);
        nd.refs.forEach(function(r,k){el('circle',{cx:p[0]-((nd.refs.length-1)*14)/2+k*14,cy:p[1]+68,r:5,fill:r[0][0]==='Q'?'#c8962e':'#2c3e6b'},g);});
        makeNode(svg,g,function(){cur=i;setActive(svg,g);show(panel,nd);},nd.label+S.comma+nd.sub);
        if(cur===i)setActive(svg,g);
      });
      var g=el('g',{},svg);
      el('circle',{class:'shape',cx:rx,cy:ry,r:58,fill:'#c8962e',stroke:'#14213d','stroke-width':3},g);
      txt(g,rx,ry+4,D.root.label,24,'#1d1600',700,108);
      makeNode(svg,g,function(){cur=-1;setActive(svg,g);show(panel,D.root);},D.root.label);
      if(cur===-1)setActive(svg,g);
      var lg=el('g',{'font-size':14},svg);
      el('circle',{cx:W-20,cy:Hh-18,r:6,fill:'#c8962e'},lg);txt(lg,W-62,Hh-16,S.ayah,14,'#5a6275');
      el('circle',{cx:W-110,cy:Hh-18,r:6,fill:'#2c3e6b'},lg);txt(lg,W-150,Hh-16,S.hadith,14,'#5a6275');
    }
    draw();show(panel,D.root);
    var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(draw,150);});
  };
  R.wheel=function(host,D){
    var panel=document.createElement('div');panel.className='dpanel';panel.setAttribute('aria-live','polite');
    var holder=document.createElement('div');holder.style.maxWidth='520px';holder.style.margin='0 auto';host.appendChild(holder);host.appendChild(panel);
    var svg=el('svg',{viewBox:'0 0 500 500',role:'group','aria-label':D.title},holder);
    var cx=250,cy=250,r1=95,r2=235,cols=['#14213d','#1b2a4a','#2c3e6b','#22335a'];
    function pt(r,a){return [cx+r*Math.sin(a),cy-r*Math.cos(a)];}
    D.nodes.forEach(function(nd,i){
      var a0=(i*90-45+2)*Math.PI/180,a1=((i+1)*90-45-2)*Math.PI/180;
      var p1=pt(r2,a0),p2=pt(r2,a1),p3=pt(r1,a1),p4=pt(r1,a0);
      var g=el('g',{},svg);
      el('path',{class:'shape',d:'M'+p1+' A'+r2+' '+r2+' 0 0 1 '+p2+' L'+p3+' A'+r1+' '+r1+' 0 0 0 '+p4+' Z',fill:cols[i],stroke:'#e3b955','stroke-width':2},g);
      var am=(i*90)*Math.PI/180,c=pt((r1+r2)/2,am);
      txt(g,c[0],c[1]-30,App.ud(i+1),20,'#c8962e',700);
      txt(g,c[0],c[1]+4,nd.label,30,'#f6e7c1',700,140);
      txt(g,c[0],c[1]+40,nd.sub,15,'#e6eaf3',400,140);
      makeNode(svg,g,function(){setActive(svg,g);show(panel,nd);},App.ud(i+1)+S.sep+nd.label+S.comma+nd.sub);
    });
    var g=el('g',{},svg);el('circle',{class:'shape',cx:cx,cy:cy,r:r1-8,fill:'#c8962e',stroke:'#14213d','stroke-width':3},g);
    txt(g,cx,cy-8,D.center.label,30,'#1d1600',700,150);txt(g,cx,cy+30,D.center.sub||'',16,'#3b2f00',400,150);
    makeNode(svg,g,function(){setActive(svg,g);show(panel,D.center);},D.center.label);
    setActive(svg,svg.querySelector('.node'));show(panel,D.nodes[0]);
  };
  R.pyramid=function(host,D){
    var panel=document.createElement('div');panel.className='dpanel';panel.setAttribute('aria-live','polite');
    var holder=document.createElement('div');holder.style.maxWidth='620px';holder.style.margin='0 auto';host.appendChild(holder);
    var svg=el('svg',{viewBox:'0 0 600 470',role:'group','aria-label':D.title},holder);
    var top=20,base=440,cx=300,half=280,lv=[[300,440],[160,300],[20,160]];
    function xAt(y){return half*(y-top)/(base-top);}
    var cols=['#14213d','#1b2a4a','#c8962e'];
    D.nodes.forEach(function(nd,i){
      var y0=lv[i][1],y1=lv[i][0];var g=el('g',{},svg);
      var a=xAt(y0),b=xAt(y1);
      el('path',{class:'shape',d:'M'+(cx-a)+' '+y0+' L'+(cx+a)+' '+y0+' L'+(cx+b)+' '+(y1+4)+' L'+(cx-b)+' '+(y1+4)+' Z',fill:cols[i],stroke:'#e3b955','stroke-width':2},g);
      var my=(y0+y1)/2;
      txt(g,cx,my-(i===2?-18:12),nd.label,i===2?28:32,i===2?'#1d1600':'#f6e7c1',700,i===2?150:2*xAt(y1)+60);
      txt(g,cx,my+(i===2?50:28),nd.sub,i===2?13:16,i===2?'#3b2f00':'#e6eaf3',400,i===2?2*xAt(my+50)-16:2*xAt(y1)+40);
      makeNode(svg,g,function(){setActive(svg,g);show(panel,nd);},nd.label+S.comma+nd.sub);
    });
    var fb=document.createElement('button');fb.type='button';fb.className='chipbtn';fb.style.display='block';fb.style.margin='8px auto';fb.textContent=D.foot.label+S.foot;
    fb.addEventListener('click',function(){setActive(svg,null);show(panel,D.foot);});
    host.appendChild(fb);host.appendChild(panel);
    chipsRow(host,D.chips,panel,S.dealings);
    var first=svg.querySelectorAll('.node')[2];setActive(svg,first);show(panel,D.nodes[2]);
  };
  document.addEventListener('DOMContentLoaded',function(){
    document.querySelectorAll('[data-diagram]').forEach(function(host){
      var D=(window.DIAGRAMS||{})[host.dataset.diagram];if(!D||!R[D.type])return;
      try{R[D.type](host,D);}catch(e){console.error(e);host.insertAdjacentHTML('beforeend','<p>'+S.err+'</p>');}
    });
  });
})();
