document.addEventListener('DOMContentLoaded',()=>{
  const slider=document.querySelector('.hero-slider');
  const slides=[...slider.querySelectorAll('[data-slide]')];
  const dots=[...slider.querySelectorAll('[data-go-slide]')];
  let active=0,timer=null,playing=false;
  function selectSlide(n){active=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==active);dots.forEach((d,i)=>d.setAttribute('aria-pressed',i===active));document.querySelector('#slide-count').textContent=`${active+1} / ${slides.length}`}
  function stopTimer(){clearInterval(timer);timer=null}
  function startTimer(){stopTimer();if(playing&&!document.hidden)timer=setInterval(()=>selectSlide(active+1),6500)}
  function setPlaying(value){playing=value;const b=document.querySelector('#slide-play');b.setAttribute('aria-pressed',value);b.setAttribute('aria-label',value?'Pause slideshow':'Play slideshow');b.innerHTML=value?'Ⅱ <span>Pause</span>':'▷ <span>Play</span>';value?startTimer():stopTimer()}
  document.querySelector('#slide-prev').onclick=()=>{setPlaying(false);selectSlide(active-1)};
  document.querySelector('#slide-next').onclick=()=>{setPlaying(false);selectSlide(active+1)};
  dots.forEach(d=>d.onclick=()=>{setPlaying(false);selectSlide(Number(d.dataset.goSlide))});
  document.querySelector('#slide-play').onclick=()=>setPlaying(!playing);
  slider.addEventListener('mouseenter',stopTimer);slider.addEventListener('mouseleave',startTimer);
  slider.addEventListener('focusin',e=>{if(e.target.id!=='slide-play')setPlaying(false)});
  document.addEventListener('visibilitychange',()=>document.hidden?stopTimer():startTimer());
  slider.addEventListener('keydown',e=>{if(e.target.tagName==='A'||e.target.tagName==='BUTTON')return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setPlaying(false);selectSlide(active+(e.key==='ArrowRight'?1:-1))}});
  function fitBanner(){const top=document.querySelector('.announcement').getBoundingClientRect().height+document.querySelector('.header-main').getBoundingClientRect().height+(matchMedia('(min-width:761px)').matches?document.querySelector('nav').getBoundingClientRect().height:0);slider.style.setProperty('--header-height',`${Math.ceil(top)}px`)}
  const resizeObserver=new ResizeObserver(fitBanner);resizeObserver.observe(document.querySelector('.header-main'));resizeObserver.observe(document.querySelector('.announcement'));window.addEventListener('resize',fitBanner);fitBanner();

  const cart=[];
  const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
  const shortName=p=>p.name.split(' - ')[0].replace(' (S, M, L)','');
  function renderBag(){const count=cart.reduce((a,l)=>a+l.quantity,0);document.querySelector('#bag-count').textContent=count;document.querySelector('#bag-title').textContent=`Your bag (${count})`;
    document.querySelector('#bag-items').innerHTML=cart.length?cart.map(l=>{const p=products[l.product];return `<article class="bag-line"><img src="${p.images[0]}" alt="${escapeHTML(shortName(p))}"><div><h3>${escapeHTML(shortName(p))}</h3><p>${l.title==='Default Title'?'':escapeHTML(l.title)}</p><strong>${money(l.price)}</strong><div class="quantity-controls"><button data-quantity="${l.id}" data-change="-1" aria-label="Decrease ${escapeHTML(shortName(p))} quantity">−</button><span aria-label="Quantity">${l.quantity}</span><button data-quantity="${l.id}" data-change="1" aria-label="Increase ${escapeHTML(shortName(p))} quantity">+</button><button class="remove-item" data-remove="${l.id}">Remove</button></div></div></article>`}).join(''):'<p class="empty-bag">Your bag is empty. Find a look you love and tap Quick add.</p>';
    const total=cart.reduce((a,l)=>a+l.price*l.quantity,0);document.querySelector('#bag-footer').innerHTML=cart.length?`<div class="bag-subtotal"><span>Subtotal</span><strong>${money(total)}</strong></div><p>Shipping and taxes calculated at checkout.</p><a class="button" href="https://nelswigs.com/cart/${cart.map(l=>l.id+':'+l.quantity).join(',')}">Continue to store →</a><p class="cart-demo-note">The store will confirm current prices and availability.</p>`:'';
  }
  function showBag(){renderBag();openDialog('bag-dialog')}
  function addToBag(i,id){const variant=(window.PRODUCT_VARIANTS[i]||[]).find(v=>v.id===id);if(!variant?.available)return;const existing=cart.find(l=>l.id===id);if(existing)existing.quantity++;else cart.push({...variant,product:i,quantity:1});const d=document.querySelector('dialog[open]');if(d)d.close();showBag();document.querySelector('#cart-status').textContent=`${shortName(products[i])} added to your preview bag`}
  function quickAdd(i){const options=window.PRODUCT_VARIANTS[i]||[];if(options.length===1){addToBag(i,options[0].id);return}const p=products[i];const d=document.querySelector('dialog[open]');if(d)d.close();document.querySelector('#add-content').innerHTML=`<div class="add-product-summary"><img src="${p.images[0]}" alt=""><div><h3>${escapeHTML(shortName(p))}</h3><strong>${p.price}</strong></div></div><form id="variant-form"><fieldset><legend>Choose your cap size</legend><div class="size-options">${options.map(v=>`<label class="size-choice ${v.available?'':'unavailable'}"><input type="radio" name="variant" value="${v.id}" required ${v.available?'':'disabled'}><span>${escapeHTML(v.title)}${v.available?'':'<small>Sold out</small>'}</span></label>`).join('')}</div></fieldset><button class="button" type="submit">Add to bag +</button></form><p class="cart-demo-note">Preview availability from the store’s product data. Confirmed again on the live store.</p>`;document.querySelector('#variant-form').onsubmit=e=>{e.preventDefault();const checked=e.target.querySelector('input:checked');if(checked)addToBag(i,Number(checked.value))};openDialog('add-dialog')}
  document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add)quickAdd(Number(add.dataset.add));const quantity=e.target.closest('[data-quantity]');if(quantity){const l=cart.find(l=>l.id===Number(quantity.dataset.quantity));if(l){l.quantity+=Number(quantity.dataset.change);if(l.quantity<=0)cart.splice(cart.indexOf(l),1);renderBag()}}const remove=e.target.closest('[data-remove]');if(remove){const index=cart.findIndex(l=>l.id===Number(remove.dataset.remove));if(index>=0)cart.splice(index,1);renderBag()}});
  document.querySelector('#bag-toggle').onclick=e=>{e.preventDefault();showBag()};document.querySelector('.continue-shopping').onclick=()=>document.querySelector('#bag-dialog').close();renderBag();
});

