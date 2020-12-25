!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.StructBuffer=e():t.StructBuffer=e()}(this,(function(){return(()=>{"use strict";var t={24:(t,e,n)=>{n.r(e),n.d(e,{BYTE:()=>p,DWORD:()=>y,QWORD:()=>_,StructBuffer:()=>z,WORD:()=>l,char:()=>o,display:()=>O,double:()=>d,float:()=>c,int16_t:()=>a,int32_t:()=>f,int64_t:()=>h,int8_t:()=>g,registerType:()=>i,sizeof:()=>m,string_t:()=>u,uint16_t:()=>x,uint32_t:()=>w,uint64_t:()=>D,uint8_t:()=>b});class s{constructor(t,e,n,s,r,i){this.typeName=e,this.size=n,this.unsigned=s,this.get=r,this.set=i,this.deeps=[],this.deeps.push(t);const o=new Proxy(this,{get:(t,e)=>e in t?t[e]:(e=e.toString(),/\d+/.test(e)&&t.deeps.push(parseInt(e)),o)});return o}}class r extends Array{constructor(t,e,n){super(),this.typeName=t,this.size=e,this.unsigned=n,this.deeps=[];const{set:i,get:o}=function(t){switch(t.size){case 1:return{get:t.unsigned?"getUint8":"getInt8",set:t.unsigned?"setUint8":"setInt8"};case 2:return{get:t.unsigned?"getUint16":"getInt16",set:t.unsigned?"setUint16":"setInt16"};case 4:const e="float"===t.typeName;return{get:e?"getFloat32":t.unsigned?"getUint32":"getInt32",set:e?"setFloat32":t.unsigned?"setUint32":"setInt32"};case 8:const n="double"===t.typeName;return{get:n?"getFloat64":t.unsigned?"getBigUint64":"getBigInt64",set:n?"setFloat64":t.unsigned?"setBigUint64":"setBigInt64"};default:throw new Error(`StructBuffer: Unrecognized ${t} type.`)}}(this);this.set=i,this.get=o;return new Proxy(this,{get(t,e){if(e in t)return t[e];if(e=e.toString(),/\d+/.test(e)){const n=new s(parseInt(e),t.typeName,t.size,t.unsigned,t.get,t.set);return Object.setPrototypeOf(n,r.prototype),n}throw new Error(`StructBuffer: (${t.typeName.toUpperCase()}) type error.`)}})}get isList(){return!!this.deeps.length}get count(){return this.deeps.reduce(((t,e)=>t*e),1)}is(t){return t.typeName===this.typeName}}function i(t,e,n=!0){return new r(t,e,n)}const o=i("char",1),u=i("string_t",1),c=i("float",4),d=i("double",8),g=i("int8_t",1,!1),a=i("int16_t",2,!1),f=i("int32_t",4,!1),h=i("int64_t",8,!1),p=i("BYTE",1),l=i("WROD",2),y=i("DWORD",4),_=i("QWORD",8),b=i("uint8_t",1),x=i("uint16_t",2),w=i("uint32_t",4),D=i("uint64_t",8);function m(t){return t instanceof z?t.byteLength:t.isList?t.size*t.count:t.size}function O(t,e,n=!0,s=!1){let r=0;const i=[];for(;;)try{let o=t[e.get](r,s);!n||c.is(e)||d.is(e)||(o=o.toString(16).toUpperCase().padStart(2*e.size,"0")),i.push({offset:r,value:o}),r+=e.size}catch(t){break}return i}class z{constructor(t){this.struct=t,this._textDecode=new TextDecoder,this._textEncoder=new TextEncoder}get textDecode(){return this._textDecode}set textDecode(t){this._textDecode=t}_decode(t){return this.textDecode.decode(t)}get textEncoder(){return this._textEncoder}set textEncoder(t){this._textEncoder=t}_encode(t){return this.textEncoder.encode(t)}get byteLength(){return Object.values(this.struct).reduce(((t,e)=>t+m(e)),0)}decode(t,e=!1,n=0){t instanceof DataView||(t=new DataView(t.buffer));return Object.entries(this.struct).reduce(((s,[r,i])=>{if(i instanceof z)s[r]=i.decode(t,e,n),n+=i.byteLength;else{let o;const c=u.is(i);if(i.isList){o=[];for(let s=0;s<i.count;s++){const s=t[i.get](n,e);o.push(s),n+=i.size}if(c&&(o=this._decode(new Uint8Array(o)),i.deeps.length<2))return s[r]=o,s;o=function(t,e,n=!1){let s=t;n&&"string"==typeof s&&(s=s.split(""));for(let t=e.length-1;t>=1;t--){const r=t===e.length-1,i=e[t];s=s.reduce(((t,e,n)=>(n%i==0&&t.push([]),t[t.length-1].push(e),t)),[]),n&&r&&(s=s.map((t=>t.join(""))))}return s}(o,i.deeps,c)}else o=t[i.get](n,e),c&&(o=this._decode(new Uint8Array([o]))),n+=i.size;s[r]=o}return s}),{})}encode(t,e=!1,n=0,s){const r=s||new DataView(new ArrayBuffer(this.byteLength));return Object.entries(this.struct).reduce(((s,[r,i])=>{let o=t[r];if(i instanceof z)i.encode(o,e,n,s),n+=i.byteLength;else{const t=u.is(i);if(i.isList){Array.isArray(o)&&(o=o.flat(),t&&(o=o.join(""))),t&&(o=this._encode(o));for(let t=0;t<i.count;t++){const r=o[t]??0;s[i.set](n,r,e),n+=i.size}}else t&&(o=this._encode(o)[0]),s[i.set](n,o,e),n+=i.size}return s}),r)}}}},e={};function n(s){if(e[s])return e[s].exports;var r=e[s]={exports:{}};return t[s](r,r.exports,n),r.exports}return n.d=(t,e)=>{for(var s in e)n.o(e,s)&&!n.o(t,s)&&Object.defineProperty(t,s,{enumerable:!0,get:e[s]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),n.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n(24)})()}));