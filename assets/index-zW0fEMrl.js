(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const t of r)if(t.type==="childList")for(const i of t.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(r){const t={};return r.integrity&&(t.integrity=r.integrity),r.referrerPolicy&&(t.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?t.credentials="include":r.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(r){if(r.ep)return;r.ep=!0;const t=n(r);fetch(r.href,t)}})();const y="modulepreload",_=function(e){return"/vue3-source-learn/"+e},m={},u=function(o,n,s){let r=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const t=document.querySelector("meta[property=csp-nonce]"),i=(t==null?void 0:t.nonce)||(t==null?void 0:t.getAttribute("nonce"));r=Promise.all(n.map(c=>{if(c=_(c),c in m)return;m[c]=!0;const l=c.endsWith(".css"),p=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${p}`))return;const d=document.createElement("link");if(d.rel=l?"stylesheet":y,l||(d.as="script",d.crossOrigin=""),d.href=c,i&&d.setAttribute("nonce",i),document.head.appendChild(d),l)return new Promise((f,h)=>{d.addEventListener("load",f),d.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${c}`)))})}))}return r.then(()=>o()).catch(t=>{const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=t,window.dispatchEvent(i),!i.defaultPrevented)throw t})};function b(){let e=document.querySelector("#app");if(e!=null){for(e.innerHTML="";e.attributes.length>0;)e.removeAttribute(e.attributes[0].name);return e._vnode=void 0,e.id="app",e}return e=document.createElement("div"),e.setAttribute("id","app"),document.body.appendChild(e),e}function a(e){return async o=>{const n=b(),{render:s}=(await e)();s(o,n)}}function v(e){e.renderFunc(e.node)}const E=[{name:"7.3_custom-renderer",node:{type:"h1",children:"7.3_custom-renderer hello"},renderFunc:a(u(()=>import("./7.3_custom-renderer-D9VeXRzo.js"),[]).then(e=>e.createRenderer))},{name:"8.1_mount-and-attribute",node:{type:"div",props:{id:"foo"},children:[{type:"p",children:"hello"}]},renderFunc:a(u(()=>import("./8.1_mount-and-attribute-CWvRWIK2.js"),[]).then(e=>e.createRenderer))},{name:"8.3_set-attribute",node:{type:"div",children:[{type:"button",props:{disabled:"",id:"btn1"},children:"a button"},{type:"button",props:{disabled:!1,id:"btn2"},children:"a button"}]},renderFunc:a(u(()=>import("./8.3_set-attribute-DIBgGQ8D.js"),[]).then(e=>e.createRenderer))},{name:"8.7_handle-event",node:{type:"button",props:{id:"foo",$onClick:()=>{alert("you clickedm me")},class:"item"},children:"click button"},renderFunc:a(u(()=>import("./8.7_handle-event-jg9TjEqz.js"),[]).then(e=>e.createRenderer))}];function g(){let e=document.querySelector("#home");e||(e=document.createElement("div"),e.id="home");for(const o of E){const n=document.createElement("button");n.textContent=o.name,n.className="item",n.addEventListener("click",()=>v(o)),e.appendChild(n)}}g();
