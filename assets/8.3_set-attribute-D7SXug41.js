import{i as a}from"./util-B7zk4-Xm.js";function l(){return{createElement:function(t){return document.createElement(t)},setElementText:function(t,e){t.textContent=e},insert:function(t,e,o){e.appendChild(t)},patchProps:function(t,e,o,s){const c=t;m(t,e)?typeof c[e]==="boolean"&&s===""?c[e]=!0:c[e]=s:t.setAttribute(e,s)}}}const h=l();function m(t,e,o){return e==="form"&&t.tagName==="INPUT"?!1:e in t}function b(t=h){const{createElement:e,insert:o,setElementText:s,patchProps:c}=t;function f(n,r){const i=e(n.type);if(typeof n.children=="string"?s(i,n.children):Array.isArray(n.children)&&n.children.forEach(p=>u(void 0,p,i)),n.props)for(const p in n.props)c(i,p,void 0,n.props[p]);o(i,r)}function u(n,r,i){n||f(r,i)}function d(n,r){n?u(r._vnode,n,r):r._vnode&&(r.innerHTML=""),r._vnode=n}return{render:d}}const v={name:"8.3_set-attribute",doRender:function(){const t=a(),{render:e}=b();e({type:"div",children:[{type:"button",props:{disabled:"",id:"btn1"},children:"a button"},{type:"button",props:{disabled:!1,id:"btn2"},children:"a button"}]},t)}};export{b as createRenderer,l as getDefaultRenderOption,v as rendererItem};