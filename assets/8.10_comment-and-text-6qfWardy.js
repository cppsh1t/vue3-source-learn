import{i as C}from"./util-B7zk4-Xm.js";function _(){return{createElement:function(i){return document.createElement(i)},setElementText:function(i,n){i.textContent=n},insert:function(i,n,f){n.appendChild(i)},patchProps:function(i,n,f,s){const o=i,{is:d,type:m}=P(n);if(d){let l=(i._eventInvoker||(i._eventInvoker={}))[n];s?l?l.value=s:(l=i._eventInvoker[n]=u=>{u.timeStamp<l.attached||(Array.isArray(l.value)?l.value.forEach(E=>E(u)):l.value(u))},l.value=s,l.attached=performance.now(),i.addEventListener(m,l)):l&&i.removeEventListener(m,l)}else n==="class"?i.className=s||"":g(i,n)?typeof o[n]==="boolean"&&s===""?o[n]=!0:o[n]=s:i.setAttribute(n,s)},createText(i){return document.createTextNode(i)},setText(i,n){i.nodeValue=n},createComment(i){return document.createComment(i)}}}const T=_();function g(i,n,f){return n==="form"&&i.tagName==="INPUT"?!1:n in i}function P(i){const n=/^\$on/.test(i),f=n?i.slice(3).toLowerCase():void 0;return{is:n,type:f}}function h(i){var f;const n=(f=i._vnode)==null?void 0:f.el;if(n){const s=n==null?void 0:n.parentNode;s&&s.removeChild(n)}}function I(i=T){const{createElement:n,insert:f,setElementText:s,patchProps:o,createText:d,setText:m,createComment:p}=i;function l(e,t){const c=e.el=n(e.type);if(typeof e.children=="string"?s(c,e.children):Array.isArray(e.children)&&e.children.forEach(r=>v(void 0,r,c)),e.props)for(const r in e.props)o(c,r,void 0,e.props[r]);f(c,t)}function u(e,t){const c=t.el=e.el,r=e.props??{},y=t.props??{};for(const a in y)y[a]!==r[a]&&o(c,a,r[a],y[a]);for(const a in r)a in y||o(c,a,r[a],void 0);E(e,t,c)}function E(e,t,c){typeof t.children=="string"?(Array.isArray(e.children)&&e.children.forEach(r=>h(r)),s(c,t.children)):Array.isArray(t.children)?Array.isArray(e.children)?(e.children.forEach(r=>h(r)),t.children.forEach(r=>v(void 0,r,c))):(s(c,""),t.children.forEach(r=>v(void 0,r,c))):Array.isArray(e.children)?e.children.forEach(r=>h(r)):typeof e.children=="string"&&s(c,"")}function v(e,t,c){if(e&&e.type!==t.type&&(h(e),e=void 0),t.type==="text")if(e){const r=t.el=e.el;t.children!==e.children&&r&&m(r,t.children)}else{const r=t.el=d(t.children);f(r,c)}else if(t.type==="comment")if(e){if(t.el=e.el,t.children!==e.children){h(e);const r=t.el=p(t.children);f(r,c)}}else{const r=t.el=p(t.children);f(r,c)}else typeof t.type=="string"?e?u(e,t):l(t,c):typeof t.type=="object"||t.type}function A(e,t){e?v(t._vnode,e,t):t._vnode&&h(t._vnode),t._vnode=e}return{render:A}}const b={name:"8.10_comment-and-text",doRender:function(){const i=C(),{render:n}=I();n({type:"div",children:[{type:"text",children:"just text"},{type:"comment",children:"cant see me"}]},i);const s=i.children[0];for(const o of s.childNodes)console.log(o.nodeValue)}};export{I as createRenderer,_ as getDefaultRenderOption,b as rendererItem};
