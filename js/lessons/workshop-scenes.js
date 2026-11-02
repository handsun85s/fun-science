/* 五十个观察课的场景。只使用 Canvas 基础绘图，照顾旧平板。 */
(function () {
  'use strict';
  const D = Sci.draw;
  Sci.workshopScene = function (c, id, i, p) {
    const T = (s,x,y,size,color) => D.text(c,s,x,y,{size:size||22,color:color||'#293850',maxW:720});
    const R = (x,y,w,h,color) => {c.fillStyle=color;c.fillRect(x,y,w,h);};
    const C = (x,y,r,color) => D.circle(c,x,y,r,color);
    const L = (x,y,a,b,color,w) => {c.strokeStyle=color||'#516f92';c.lineWidth=w||4;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
    const arrow = (x,y,a,b,color) => D.arrow(c,x,y,a,b,color||'#397fc2',4);
    const box = (x,y,w,h,color) => {R(x,y,w,h,color||'#dceafb');c.strokeStyle='#506b83';c.lineWidth=2;c.strokeRect(x,y,w,h);};
    const dots = (n,x,y,color,step) => {for(let k=0;k<n;k++)C(x+k%10*(step||18),y+Math.floor(k/10)*(step||18),5,color);};
    const progress = (n) => Math.floor(n*p);
    switch(id){
      case 'heatpath': {
        const reach=p*(i?110:460);R(140,220,480,30,i?'#bd9366':'#aab9c7');R(140,220,reach,30,'#f48756');
        box(80,240,100,120,'#ffbaa2');T('受热端',130,385);T('远端',620,290);T('热传到的位置',390,150);arrow(170,200,170+reach,200,'#df713c');break;
      }
      case 'aircup': {
        R(100,250,600,140,'#a9dcff');c.save();c.translate(400,235);c.rotate(i?-0.3:0);box(-85,-90,170,180,'#fff');R(-80,80-(i?p*150:10),160,i?p*150:10,'#a9dcff');T('空气',0,-45);c.restore();
        if(i)for(let k=0;k<7;k++)C(500+k*12,280-(p*180+k*20)%170,7,'#e9f8ff');T(i?'气泡离开，水进入':'空气被困住，占据空间',400,125);break;
      }
      case 'suction': {
        R(170,110,20,275,'#8fa4b1');const gap=i?p*90:0;c.fillStyle='#e6a678';c.beginPath();c.ellipse(205+gap,240,35,85,0,0,Math.PI*2);c.fill();R(235+gap,225,95,30,'#d48348');
        for(let y=170;y<330;y+=50)arrow(490,y,300+gap,y,'#347fb7');T(i?'空气进入，压差减小':'外侧气压较大',490,125);if(i)arrow(150,135,240,185,'#ef8d39');break;
      }
      case 'springlaw': {
        const ext=(i?85:42)*p,top=125,end=235+ext;L(300,100,500,100);c.beginPath();c.moveTo(400,top);for(let k=0;k<=16;k++)c.lineTo(400+(k%2?26:-26),top+(end-top)*k/16);c.strokeStyle='#557389';c.lineWidth=4;c.stroke();R(365,end,70,i?65:35,'#e99c42');
        L(540,235,540,end,'#e65c49',3);T('原长位置',640,235,18);T('增加 '+(i?2:1)+' 格',630,320);break;
      }
      case 'projectile': {
        L(100,350,690,350);const a=(i?60:30)*Math.PI/180,v=10,g=10,time=2*v*Math.sin(a)/g;
        for(let k=0;k<=35*p;k++){const t=time*k/35;C(145+v*Math.cos(a)*t*52,350-(v*Math.sin(a)*t-g*t*t/2)*52,3,'#91bce3');}
        const t=time*p;C(145+v*Math.cos(a)*t*52,350-(v*Math.sin(a)*t-g*t*t/2)*52,10,'#e28b3c');T('起点同高，初速度相同',400,125);T('落点相同，高度和时间不同',400,390,20);break;
      }
      case 'pairing': {
        const n=i?8:7;for(let k=0;k<n;k++)C(190+Math.floor(k/2)*135,190+(k%2)*70,24,'#609bdd');for(let k=0;k<3+(i?1:0);k++)if(p>=(k+1)/4)box(153+k*135,153,74,145,'rgba(80,180,120,.12)');T(i?'4 对，剩余 0 个':'3 对，剩余 1 个',400,355,28);break;
      }
      case 'tenbundle': {
        for(let k=0;k<10;k++){const x=160+k*(i?32:48);R(x,180,10,125,'#ce9b58');}if(i){R(150,220,325,12,'#e36c58');R(150,260,325,12,'#e36c58');}T(i?'一捆代表十，不是一个一':'十根散棒：10 个一',400,345,27);break;
      }
      case 'decimalzero': {
        L(100,280,700,280);for(let k=0;k<=10;k++){L(100+k*60,270,100+k*60,290);T((k/10).toFixed(1),100+k*60,320,16);}C(100+180*p,280,13,'#e86c42');T(i?'0.30 = 30/100':'0.3 = 3/10',400,150,32);T('同一点',280,235);break;
      }
      case 'triangleheight': {
        const h=i?200:100;c.fillStyle='#7cb2e8';c.beginPath();c.moveTo(160,350);c.lineTo(640,350);c.lineTo(355,350-h*p);c.closePath();c.fill();L(355,350,355,350-h*p,'#e16e48');T('底 8 格',400,385);T(i?'高 8 格，面积 32':'高 4 格，面积 16',400,125,26);break;
      }
      case 'median': {
        const arr=[2,3,4,5,i?26:6];arr.forEach((v,k)=>{R(155+k*100,350-v*7*p,55,v*7*p,'#69a4dc');T(v,183+k*100,375);});T('平均数 '+(i?8:4)+'   中位数 4',400,130,28);C(383,375,24,'rgba(255,170,0,.18)');break;
      }
      case 'clearwater': {
        box(260,140,260,220,'#fff');R(264,350-160*(1-p),252,160*(1-p),'#a6d9ff');if(i)dots(Math.floor(22*p),305,325,'#c8a253');T(i?'水离开后留下盐':'没有盐晶体残留',400,390);break;
      }
      case 'emulsion': {
        box(250,115,300,270,'#afd8f5');if(i){for(let k=0;k<40;k++)C(270+k*47%260,145+k*61%210,5,'#e5ae45');}else{const h=80*p;R(253,120,294,h,'#e5ae45');for(let k=0;k<20*(1-p);k++)C(280+k*47%240,210+k*37%130,7,'#e5ae45');}T(i?'小油滴分散较久':'油滴重新聚成一层',400,400,20);break;
      }
      case 'evaparea': {
        const w=i?330:140,left=400-w/2,water=120-(i?80:35)*p;box(left,200,w,170,'#fff');R(left+3,365-water,w-6,water,'#a8d8f5');for(let k=0;k<12;k++)C(left+12+(k%6)*(w-24)/6,345+Math.floor(k/6)*12,4,'#bca67b');for(let k=0;k<(i?15:5)*p;k++)arrow(left+15+k*(w-30)/(i?15:5),180,left+15+k*(w-30)/(i?15:5),125,'#91c6dd');T('盐的量相同',400,395,19);break;
      }
      case 'limewater': {
        box(260,120,280,260,'#fff');R(264,210,272,166,i?'rgba(180,194,205,'+(0.25+0.7*p)+')':'#d1e9f9');for(let k=0;k<12;k++)C(400+Math.sin(k)*40,345-(p*190+k*13)%130,5,'#f5fbff');T(i?'生成白色沉淀':'短时间变化不明显',400,395,21);break;
      }
      case 'massfraction': {
        box(250,115,300,270,'#fff');R(254,i?160:255,292,i?220:125,'#9fd2f3');dots(30,310,290,'#b47bd3');T('盐都是 10 克',400,140);T(i?'10 ÷ 200 = 5%':'10 ÷ 100 = 10%',400,395,26);break;
      }
      case 'phototropism': {
        R(270,330,260,55,'#bd9569');const dx=(i?1:-1)*110*p;c.strokeStyle='#4a9e56';c.lineWidth=12;c.beginPath();c.moveTo(400,340);c.quadraticCurveTo(400,230,400+dx,155);c.stroke();D.emoji(c,'☀️',i?660:140,150,70);D.emoji(c,'🌱',400+dx,152,45);T('多天的生长变化 · 已加速',400,398,19);break;
      }
      case 'seedwings': {
        const x=190+p*(i?440:170),y=130+240*p*p;arrow(130,110,650,110);C(x,y,10,'#98693b');if(i){L(x-55,y-15,x+55,y-15,'#b9a68c',15);L(x,y-15,x,y);}L(100,380,720,380);T(i?'留空较久，随风移动较远':'较快落地，横移较近',400,400,20);break;
      }
      case 'transpire': {
        box(235,120,330,265,'#edf6fb');R(393,180,14,180,'#46995e');for(let k=0;k<(i?10:2);k++){const y=185+k*15;D.circle(c,400+(k%2?35:-35),y,17,'#58ae65');}for(let k=0;k<(i?30:6)*p;k++)C(250+k*43%300,130+k*19%210,4,'#65b5e6');T('起初干燥的袋壁出现水滴',400,400,19);break;
      }
      case 'yeastgas': {
        box(300,230,200,150,'#bfdded');const r=15+p*(i?50:12);c.fillStyle='#e396b3';c.beginPath();c.ellipse(400,190-r/2,r,r,0,0,Math.PI*2);c.fill();for(let k=0;k<16*p;k++)C(350+k*17%100,340-(p*100+k*11)%80,4,'#fff');T(i?'气体更多，气球较大':'观察期内气体较少',400,125,21);break;
      }
      case 'decomposers': {
        R(100,320,600,65,'#b58d61');for(let k=0;k<28;k++){const fade=i?1-p*0.85:1-p*0.1;c.globalAlpha=fade;D.emoji(c,'🍂',140+k*29%520,160+k*31%150,30);c.globalAlpha=1;}if(i)for(let k=0;k<20*p;k++)arrow(140+k*25,295,140+k*25,350,'#7f9b41');T(i?'物质进入环境，参与循环':'落叶分解很慢',400,398,20);break;
      }
      case 'shineReflect': {
        R(90,110,620,280,'#192640');C(250,230,55,'#ffdc71');C(555,230,55,i?'#303d59':'#c2d7ef');if(!i)for(let k=0;k<3;k++)arrow(320,180+k*40,480,180+k*40,'#ffe7a3');T('发光球',250,350,22,'#fff');T('反光球',555,350,22,'#fff');break;
      }
      case 'twinkle': {
        R(90,110,620,280,'#18253b');for(let k=0;k<7;k++){L(360+k*12,120,380+k*12+(i?Math.sin(p*19+k)*25:0),290,'#8bb7d1',2);}const glow=i?0.3+0.7*Math.abs(Math.cos(p*23)):0.9;C(400,315,14,'rgba(255,237,142,'+glow+')');T('星光穿过空气层',400,365,21,'#fff');break;
      }
      case 'spinOrbit': {
        C(400,245,45,'#ffcd55');c.strokeStyle='#b9cce0';c.lineWidth=2;c.beginPath();c.ellipse(400,245,230,110,0,0,Math.PI*2);c.stroke();const a=i?p*2*Math.PI:0,x=400+230*Math.cos(a),y=245+110*Math.sin(a);C(x,y,25,'#4b9acf');L(x,y,x+20*Math.cos((i?365:1)*p*2*Math.PI),y+20*Math.sin((i?365:1)*p*2*Math.PI),'#fff',3);T(i?'一圈公转，对应一年':'一圈自转，对应一天',400,125,25);break;
      }
      case 'parallax': {
        const y=i?120:245;C(280,370,13,'#4088cc');C(520,370,13,'#4088cc');L(280,370,520,370);D.emoji(c,'⭐',400,y,35);L(280,370,400,y,'#eb8f44');L(520,370,400,y,'#eb8f44');T('固定观察基线',400,398,20);T(i?'远目标，视差小':'近目标，视差大',620,240,21);break;
      }
      case 'spaceExpand': {
        const scale=1+p;for(let k=0;k<5;k++)L(100+k*65*scale,130,100+k*65*scale,360,'#d4e1eb',1);for(let y=130;y<=360;y+=55)L(100,y,720,y,'#d4e1eb',1);C(130,245,10,'#ee8342');const d=(i?210:70)*scale;C(130+d,245,15,'#5e8fbf');arrow(130,280,130+d,280);T(i?'3 格 → 6 格，增加 3 格':'1 格 → 2 格，增加 1 格',400,390,24);break;
      }
      case 'riverSlope': {
        const a=i?[650,180,150,340]:[150,180,650,340];L(a[0],a[1],a[2],a[3],'#ac977e',25);for(let k=0;k<8;k++){const u=(p+k/8)%1;C(a[0]+(a[2]-a[0])*u,a[1]+(a[3]-a[1])*u-10,6,'#429dd5');}T('高处',a[0],a[1]-45);T('低处',a[2],a[3]+35);break;
      }
      case 'wellwater': {
        R(150,120,500,265,'#d8c49e');box(320,120,160,265,'#fff');const water=130+(i?-70:70)*p;R(325,380-water,150,water,'#8fc8ec');arrow(180,240,310,240,'#4e9fd0');arrow(405,220,405,135,'#e88b46');T('补水 2 份',210,285,19);T(i?'抽水 3 份':'抽水 1 份',575,180,21);break;
      }
      case 'rainshadow': {
        if(i){c.fillStyle='#ac9a7e';c.beginPath();c.moveTo(160,365);c.lineTo(400,150);c.lineTo(640,365);c.fill();arrow(150,250,350,150);arrow(450,180,630,300);D.emoji(c,'☁️',280,170,55);for(let k=0;k<16*p;k++)L(220+k*11,210,215+k*11,240,'#4f9fd3',2);}else{L(100,365,700,365,'#ac9a7e',8);arrow(150,240,650,240);}T('湿气流从左侧吹来',400,125);T(i?'迎风抬升有雨，背风较干':'没有这次山地抬升',400,395,21);break;
      }
      case 'heatIsland': {
        R(120,260,390,110,i?'#555b60':'#75b76e');if(!i)for(let k=0;k<12;k++)L(135+k*30,275,140+k*30,250,'#37814b',3);D.emoji(c,'☀️',320,160,70);const t=20+p*(i?15:6);box(600,160,45,210,'#fff');R(610,350-(t-15)*6,25,(t-15)*6,'#ee7753');T('相对升温示意',600,125,18);T(i?'干燥深色硬地':'湿润草地',320,395);break;
      }
      case 'saltevap': {
        box(250,125,300,255,'#fff');const level=200-(i?100*p:0);R(254,375-level,292,level,'#9dd3f1');dots(35,310,305,'#ab78c4');T('盐一直是 3.5 份',400,155);T(i?'3.5 ÷ 50 = 7%':'3.5 ÷ 100 = 3.5%',400,399,25);break;
      }
      case 'widebase': {
        const half=i?115:45,angle=(i?0.05:0.5)*p;c.save();c.translate(400,330);c.rotate(angle);R(-80,-160,160,135,'#83ace0');L(-half,0,half,0,'#4f5963',9);C(-half,0,22,'#374d60');C(half,0,22,'#374d60');C(0,-100,8,'#e46a43');c.restore();L(130,357,680,357);T(i?'支撑范围宽':'支撑范围窄',400,125);break;
      }
      case 'braceFrame': {
        const dx=i?p*7:p*90;const a=[235,350],b=[565,350],d=[235+dx,150],e=[565+dx,150];L(...a,...b);L(...a,...d);L(...b,...e);L(...d,...e);if(i)L(...a,...e,'#df8950',7);arrow(140,170,230+dx,170,'#dc6752');T(i?'斜撑限制角度变化':'可转动关节使方框歪斜',400,395,22);break;
      }
      case 'parachuteArea': {
        const y=145+p*(i?55:110),w=i?150:75;c.fillStyle='#e9a66c';c.beginPath();c.ellipse(400,y,w,45,0,Math.PI,2*Math.PI);c.fill();L(400-w,y,400,y+90);L(400+w,y,400,y+90);R(380,y+85,40,35,'#568bd0');T(i?'4 份面积，稳定速度 1 份':'1 份面积，稳定速度 2 份',400,395,21);break;
      }
      case 'parallelPipes': {
        box(90,150,120,190,'#acd9f2');L(210,240,680,240,'#8bafc7',18);if(i){L(210,240,270,330,'#8bafc7',18);L(270,330,680,330,'#8bafc7',18);}for(let k=0;k<6;k++){C(230+(p+k/6)%1*420,240,5,'#267fc1');if(i)C(290+(p+k/6)%1*360,330,5,'#267fc1');}T('两端压差保持相同',400,125);T(i?'总流量相对为 2':'总流量相对为 1',400,390);break;
      }
      case 'thermostat': {
        L(130,350,700,350);L(130,350,130,115);const yOf=t=>350-(t-15)*9;L(130,yOf(25),700,yOf(25),'#83b68c',2);for(let k=1;k<=55*p;k++){const a=(k-1)/55,b=k/55;const t=x=>i?20+5*Math.min(1,x*2):20+20*x;L(130+a*550,yOf(t(a)),130+b*550,yOf(t(b)),'#dc7848',4);}T('目标温度',620,yOf(25)-22,18);T(i?'测量 → 比较 → 停热':'一直加热，超过目标',400,390,23);break;
      }
      case 'stampOrder': {
        L(150,285,650,285);const x=180+p*380,stamp=i?180:560;R(140,270,80,30,'#dce4ee');R(520,270,80,30,'#dce4ee');if(p>0.5)C(stamp,285,20,'#d86e4f');D.emoji(c,'🤖',x,210,60);T(i?'印章留在起点':'印章留在终点',400,365,25);break;
      }
      case 'loopBoundary': {
        const n=i?4:3;for(let k=0;k<4;k++){box(145+k*140,190,100,90,'#e8f0fa');T('i='+k,195+k*140,235,25);if(k<Math.ceil(n*p))L(155+k*140,290,225+k*140,290,'#43a268',7);}T('已执行 '+Math.floor(n*p)+' 次',400,355,28);break;
      }
      case 'accumulator': {
        const rows=i?[1,2,3,4]:[1,3,6,10],step=Math.min(3,Math.floor(p*4));for(let k=0;k<4;k++){T('加 '+(k+1),170+k*150,170,22);box(120+k*150,215,100,80,k<=step?'#dcefdc':'#eef1f5');if(k<=step)T(rows[k],170+k*150,255,30);}T(i?'每次清零，之前的结果丢失':'保留总数，逐步累加',400,355,23);break;
      }
      case 'binaryPrerequisite': {
        const a=i?[9,1,7,3,5]:[1,3,5,7,9];a.forEach((v,k)=>{box(105+k*125,190,105,90,'#e0edfc');T(v,157+k*125,235,32);});if(p>0.3)arrow(400,145,400,190,'#db8248');if(p>0.7&&i)L(355,180,710,300,'#d87566',4);T(i?'错误排除目标所在区域':'中间正好找到目标 5',400,355,25);break;
      }
      case 'greedycoins': {
        const a=i?[3,3]:[4,1,1];a.forEach((v,k)=>{if(p>=(k+1)/a.length){C(250+k*140,235,43,'#efc760');T(v,250+k*140,235,30);}});T(i?'3 + 3：2 枚':'4 + 1 + 1：3 枚',400,345,29);break;
      }
      case 'rgbLight': {
        R(100,115,600,270,'#182335');C(290,245,75,'#d43739');C(510,245,75,'#309f54');if(i)C(400,170,65,'#3b66ce');C(400,280,52,i?'#fff':'#ffdf3f');T(i?'红 + 绿 + 蓝 → 接近白':'红光 + 绿光 → 黄光',400,395,23);break;
      }
      case 'imagebits': {
        for(let k=0;k<16;k++){const x=190+k%4*72,y=125+Math.floor(k/4)*62;R(x,y,60,50,i?'rgb('+(40+k*12)+','+(40+k*12)+','+(40+k*12)+')':k%2?'#fff':'#23364e');}T(i?'每格 8 位':'每格 1 位',640,200,25);T(i?'共 16 字节':'共 2 字节',640,255,25);break;
      }
      case 'passwordSpace': {
        const n=i?4:2;for(let k=0;k<n;k++){box(210+k*90,170,75,80,'#e4eef9');T(Math.floor(p*30+k)%10,247+k*90,210,35);T('10 种',247+k*90,285,18);}T(i?'10 × 10 × 10 × 10 = 10000':'10 × 10 = 100',400,355,25);break;
      }
      case 'cache': {
        box(100,180,170,130,'#dceafb');T('远端图片',185,245);box(520,180,180,130,'#e2f1df');T('本地缓存',610,245);for(let k=0;k<(i?1:3);k++)arrow(285,200+k*45,500,200+k*45,'#3a86c5');T(i?'首次下载；两次就地复用':'每次都通过网络下载',400,365,23);break;
      }
      case 'testsplit': {
        const flags=i?[1,0,1,0,1,0]:[1,1,1,1,1,1];flags.forEach((v,k)=>{box(170+k%3*175,145+Math.floor(k/3)*120,120,85,'#e8eff6');if(p>=(k+1)/6)T(v?'正确':'未答对',230+k%3*175,188+Math.floor(k/3)*120,23,v?'#26814b':'#a65446');});T(i?'未见新题：3 / 6':'背过旧题：6 / 6',400,395,25);break;
      }
      case 'reusecup': {
        const n=i?1:5;for(let k=0;k<n;k++){box(170+k*100,210,70,100,'#b9dcf1');R(174+k*100,255,62,50,'#81bbe0');}T('五次喝水',400,145,28);T(i?'复用 1 只杯':'取用 5 只新杯',400,365,25);break;
      }
      case 'packageSpace': {
        const w=i?560:360,x=400-w/2;box(x,140,w,230,'#dfc5a0');for(let k=0;k<6;k++)box(270+k%3*90,185+Math.floor(k/3)*85,70,65,'#79a6ce');T(i?'相同物品，更多空位':'满足保护要求的合适空间',400,395,23);break;
      }
      case 'dripleak': {
        L(170,145,390,145,'#8095a6',25);L(390,145,390,195,'#8095a6',25);box(300,270,200,115,'#fff');if(!i){R(304,380-80*p,192,80*p,'#96d1f4');for(let k=0;k<5;k++)C(390,195+(p*95+k*18)%75,5,'#4eace2');}T(i?'滴漏损失 0 升':'假设下每天 4.32 升',400,395,24);break;
      }
      case 'pollinatorDiversity': {
        [220,400,580].forEach(x=>{R(x-3,260,6,100,'#5da36d');D.emoji(c,'🌸',x,250,55);});D.emoji(c,'🐝',240,140,55);if(p>0.2)L(210,110,275,170,'#b76558',4);if(i)D.emoji(c,'🦋',220+360*p,190,55);T(i?'仍有适合的传粉者提供部分服务':'唯一传粉者离开，服务中断',400,395,22);break;
      }
      case 'lifecycle': {
        const n=i?30:5,a=2*n,b=50+0.2*n;L(170,350,660,350);R(230,350-a*2.6*p,120,a*2.6*p,'#e0a068');R(455,350-b*2.6*p,120,b*2.6*p,'#68a497');T('一次用品 '+a+' 点',290,385,21);T('耐用品 '+b+' 点',515,385,21);T('使用 '+n+' 次的模型积分',400,135,26);break;
      }
      default: throw new Error('未实现的观察场景：'+id);
    }
  };
})();
