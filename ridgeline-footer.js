(() => {
  const root = document.querySelector(".rdf-root");
  if (!root) return;
  const scene = root.querySelector(".rdf-scene");
  const canvas = root.querySelector(".rdf-canvas");
  const ctx = canvas && canvas.getContext("2d", { alpha: false });
  if (!scene || !canvas || !ctx) return;

  const year = root.querySelector("#rdf-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BAYER = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v => (v + .5) / 64);
  const palettes = {
    dark: ["#08100c","#0c1c14","#123224","#1a4b33","#256a48","#3a8c63","#62b388"],
    light: ["#f3f8f5","#d4ecdf","#a5d7bb","#69b38a","#2e7c52","#145131","#0a2d1a"]
  };
  const hex = value => {
    const n = parseInt(value.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const hash = (x,y,s) => {
    let h = Math.imul(x|0,374761393) + Math.imul(y|0,668265263) + Math.imul(s|0,1442695041);
    h = Math.imul(h ^ (h >>> 13),1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const noise = (x,y,s) => {
    const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi;
    const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    const a=hash(xi,yi,s), b=hash(xi+1,yi,s), c=hash(xi,yi+1,s), d=hash(xi+1,yi+1,s);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
  };
  const fbm = (x,y,s) => {
    let sum=0, amp=.5, norm=0;
    for(let i=0;i<3;i++){ sum+=noise(x,y,s+i*31)*amp; norm+=amp; x*=2.03; y*=2.03; amp*=.5; }
    return sum/norm;
  };
  const smooth = (a,b,x) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  const pack = rgb => (255<<24 | rgb[2]<<16 | rgb[1]<<8 | rgb[0]) >>> 0;

  let p=2, cols=1, rows=1, margin=3, image=null, buffer=null, ridges=[], palette=[];
  let pointerX=0, pointerY=0, targetX=0, targetY=0, inside=false, clear=0, gust=0, gustX=0;
  let raf=0, visible=true, started=false, startAt=0, last=0, resizeObserver=null, intersectionObserver=null;
  const motion = () => !reduced && !document.hidden;
  function makeRidge(i, layers) {
    const k=i/(layers-1), out=new Float32Array(cols+margin*2), base=rows*(.38+.66*Math.pow(k,1.4));
    const amp=rows*(.2+.24*k), freq=6-3.8*k, seed=7*13+i*101;
    const flankL=rows*.5*k*k*(.55+.6*hash(i,11,7)), flankR=rows*.5*k*k*(.55+.6*hash(i,13,7));
    const tilt=(hash(i,7,7)-.5)*rows*.34*(.4+k), ceil=rows*.17;
    for(let x=0;x<out.length;x++){
      const u=(x-margin)/cols;
      const r1=1-Math.abs(noise(u*freq+i*3.7,.5,seed)*2-1);
      const r2=1-Math.abs(noise(u*freq*2.3,3.5,seed+1)*2-1);
      const f=fbm(u*freq*4.1,9.5,seed+2);
      const h=r1*r1*.62+r2*.24+f*.14, edge=Math.min(1.2,Math.abs(u*2-1));
      let y=base-h*amp+tilt*(u-.5)*2-(u<.5?flankL:flankR)*edge*edge*Math.sqrt(edge);
      if(y<ceil)y=ceil-(ceil-y)*.25;
      out[x]=y;
    }
    return out;
  }
  function layout() {
    const rect=scene.getBoundingClientRect();
    p=Math.max(1,Math.round(window.devicePixelRatio > 1.5 ? 2 : 2));
    cols=Math.max(8,Math.ceil(rect.width/p)); rows=Math.max(8,Math.ceil(rect.height/p));
    canvas.width=cols; canvas.height=rows;
    canvas.style.width=(cols*p)+"px"; canvas.style.height=(rows*p)+"px";
    image=ctx.createImageData(cols,rows); buffer=new Uint32Array(image.data.buffer);
    margin=Math.ceil(cols*.045)+3;
    ridges=Array.from({length:6},(_,i)=>makeRidge(i,6));
    const light=document.documentElement.dataset.theme==="light";
    palette=(light?palettes.light:palettes.dark).map(hex).map(pack);
    draw(performance.now());
  }
  function draw(now) {
    if(!image)return;
    const light=document.documentElement.dataset.theme==="light";
    const tones=(light?palettes.light:palettes.dark).map(hex).map(pack);
    if(tones[0]!==palette[0])palette=tones;
    const age=started?now-startAt:-1, dt=last?Math.min(64,now-last):16; last=now;
    const ease=1-Math.pow(.82,dt/16.7), slow=1-Math.pow(.93,dt/16.7);
    pointerX+=(targetX-pointerX)*ease; pointerY+=(targetY-pointerY)*ease;
    clear+=((inside?1:0)-clear)*slow; gust*=Math.pow(.965,dt/16.7); gustX+=gust*dt/1000;
    const fogT=(reduced?0:now/1000*.045)+gustX, fw=(cols>>1)+2, fh=(rows>>1)+2;
    const fog=new Float32Array(fw*fh);
    for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
      const nx=x*9/cols+fogT, ny=y*4.4/rows;
      const warp=noise(nx*.45-fogT*.6,ny*.8,77)*.6;
      fog[y*fw+x]=smooth(.3,.74,fbm(nx+warp,ny+warp*.4,31));
    }
    const top=new Float32Array(6*cols), reveal=new Float32Array(6);
    for(let i=0;i<6;i++){
      reveal[i]=age<0?0:Math.max(0,Math.min(1,1-Math.pow(1-Math.max(0,Math.min(1,(age-380-i*170)/1300)),3)));
      const rise=(1-reveal[i])*rows*.09, shift=Math.round((inside?(pointerX/cols-.5)*2:0)*(.25+i/5)*1.1*margin);
      for(let x=0;x<cols;x++)top[i*cols+x]=ridges[i][x+margin+shift]+rise;
    }
    const radius=130/p, r2=radius*radius;
    for(let y=0;y<rows;y++){
      const fade=smooth(0,Math.max(rows*.3,128/p),y), fy=(y>>1)*fw, by=(y&7)*8;
      for(let x=0;x<cols;x++){
        let layer=-1;
        for(let i=5;i>=0;i--)if(y>=top[i*cols+x]){layer=i;break;}
        let tone=0, mist=.3;
        if(layer>=0){
          const k=layer/5, d=y-top[layer*cols+x], depth=rows*(.08+.42*k);
          const crest=1-smooth(0,depth,d)*(.88-.45*k);
          tone=(.16+.76*Math.pow(k,1.6))*crest*reveal[layer];
          mist=.95-.5*k;
        } else tone=.05*smooth(rows*.15,rows*.6,y);
        let m=fog[fy+(x>>1)]*.8*mist;
        if(clear>.01&&inside){
          const dx=x-pointerX, dy=(y-pointerY)*1.5, q=(dx*dx+dy*dy)/r2;
          if(q<4){const c=clear*Math.exp(-q);m*=1-c*.92;if(layer>=0)tone+=c*.16*reveal[layer];}
        }
        if(tone>.93)tone=.93;
        m=Math.min(1,m+(age<0?0: (1-Math.max(0,Math.min(1,(age-900)/1800)))*.55));
        tone=(tone*(1-m)+.09*m)*fade;
        const index=Math.min(tones.length-1,Math.floor(Math.max(0,Math.min(1,tone))*(tones.length-1)+BAYER[by+(x&7)]));
        buffer[y*cols+x]=tones[index];
      }
    }
    ctx.putImageData(image,0,0);
  }
  function loop(now) {
    raf=0; if(!visible||!started)return;
    draw(now);
    if(!reduced&&(inside||Math.abs(clear-.0)>.01||Math.abs(gust)>.002||now-startAt<3600||!document.hidden))raf=requestAnimationFrame(loop);
  }
  function wake(){if(!raf&&visible&&started)raf=requestAnimationFrame(loop);}
  function onMove(e){
    const rect=scene.getBoundingClientRect(), x=(e.clientX-rect.left)/p, y=(e.clientY-rect.top)/p;
    targetX=x;targetY=y;inside=x>=0&&y>=0&&x<cols&&y<rows;wake();
  }
  function onLeave(){inside=false;wake();}
  function onDown(e){if(e.target.closest("a,button"))return;gust+=targetX<cols/2?1.4:-1.4;wake();}
  const revealObserver=new IntersectionObserver(entries=>{
    if(entries.some(entry=>entry.isIntersecting)){
      root.classList.add("rdf-in"); started=true; startAt=performance.now(); draw(startAt); wake(); revealObserver.disconnect();
    }
  },{threshold:.12});
  revealObserver.observe(root);
  scene.addEventListener("pointermove",onMove);
  scene.addEventListener("pointerleave",onLeave);
  scene.addEventListener("pointerdown",onDown);
  resizeObserver=new ResizeObserver(layout); resizeObserver.observe(scene);
  intersectionObserver=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)wake();else if(raf){cancelAnimationFrame(raf);raf=0;}});
  intersectionObserver.observe(root);
  const themeObserver=new MutationObserver(()=>{layout();wake();});
  themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
  layout();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)wake();});
  window.addEventListener("pagehide",()=>{if(raf)cancelAnimationFrame(raf);resizeObserver?.disconnect();intersectionObserver?.disconnect();themeObserver.disconnect();revealObserver.disconnect();});
})();