import{i as l}from"./util-B7zk4-Xm.js";const s={createElement:function(e){return document.createElement(e)},setElementText:function(e,n){e.textContent=n},insert:function(e,n,o){n.innerHTML="",n.appendChild(e)}};function p(){return{createElement:function(e){return document.createElement(e)},setElementText:function(e,n){e.textContent=n},insert:function(e,n,o){n.innerHTML="",n.appendChild(e)}}}function m(e=s){const{createElement:n,insert:o,setElementText:c}=e;function u(t,r){const i=n(t.type);typeof t.children=="string"&&c(i,t.children),o(i,r)}function d(t,r,i){t||u(r,i)}function f(t,r){t?d(r._vnode,t,r):r._vnode&&(r.innerHTML=""),r._vnode=t}return{render:f}}const h={name:"7.3_custom-renderer",doRender:function(){const e=l(),{render:n}=m();n({type:"h1",children:"7.3_custom-renderer hello"},e)}};export{m as createRenderer,p as getDefaultRenderOption,h as rendererItem};
