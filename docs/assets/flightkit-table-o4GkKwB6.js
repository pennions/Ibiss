import{C as h}from"./Card-hI02ob6x.js";import{i as _,r as l,h as b,w as p,o as c,d as e,b as t,t as a,c as f,u as r}from"./index-rvugPL7J.js";const d=[{scientific_name:"Ardea cinerea",common_name:"Grey heron"},{scientific_name:"Ardea herodias",common_name:"Great blue heron"},{scientific_name:"Ardea cocoi",common_name:"Cocoi heron"},{scientific_name:"Ardea pacifica",common_name:"White-necked heron"},{scientific_name:"Ardea melanocephala",common_name:"Black-headed heron"},{scientific_name:"Ardea humbloti",common_name:"Humblot's heron"},{scientific_name:"Ardea insignis",common_name:"White-bellied heron"},{scientific_name:"Ardea sumatrana",common_name:"Great-billed heron"},{scientific_name:"Ardea goliath",common_name:"Goliath heron"},{scientific_name:"Ardea purpurea",common_name:"Purple heron"},{scientific_name:"Ardea alba",common_name:"Great egret, great white heron"},{scientific_name:"Ardea brachyrhyncha",common_name:"Yellow-billed egret"},{scientific_name:"Ardea intermedia",common_name:"Medium egret"},{scientific_name:"Ardea plumifera",common_name:"Plumed egret"}],g=e("header",null,[e("h1",{class:"mb-2"},"Flightkit Table"),e("hr")],-1),v={class:"column gap-5"},y=e("h3",{class:"mb-2"},"Using the table as a vanilla webcomponent",-1),w=e("hr",null,null,-1),k=e("table",{class:"property-table"},[e("thead",null,[e("tr",null,[e("th",null,"Attribute"),e("th",null,"Function"),e("th",null,"How to use")])]),e("tbody",null,[e("tr",null,[e("td",null,[e("code",null,'contents=""')]),e("td",null,"Used to set an array of objects to be displayed"),e("td",null,[t(" Either stringify a JSON object, or use the "),e("code",null,"setContents()"),t(" on the element, like show above ")])]),e("tr",null,[e("td",null,[e("code",null,'columns=""')]),e("td",null,"Used to set which columns there needs to be displayed and the order."),e("td",null,[t(" A comma separated string with the property names. "),e("br"),e("b",null,"E.G."),t(' "scientific_name,common_name" ')])]),e("tr",null,[e("td",null,[e("code",null,'order=""')]),e("td",null," Used to set the ordering of the rows. You can always click on one or more headers to order the table "),e("td",null,[t(" A comma separated string with the property names a 'pipe': | and the ordering. Defaults to ascending."),e("br"),e("b",null,"E.G."),t(' "scientific_name|asc,common_name|desc" or "scientific_name,common_name" ')])]),e("tr",null,[e("td",null,[e("code",null,'filter=""')]),e("td",null,"Used to do a global search on the table."),e("td",null,[t(" a string that will be used to filter the table "),e("br"),e("b",null,"E.G."),t(' "cinerea" ')])]),e("tr",null,[e("td",null,[e("code",null,'selection-property=""')]),e("td",null," When it is assigned, it will use the value to be a unique identifier for creating a selection. It will render checkboxes at each table row and a select all on the table head "),e("td",null,[t(" a property name that has a unique value per row in a table. Emits the event 'select' on checkbox change. On the event parameter, there is a property "),e("i",null,"detail"),t(" which has a property "),e("i",null,"selection"),t(" with the objects you selected"),e("b",null,"E.G."),t(' selection-property="id" ')])]),e("tr",null,[e("td",null,[e("code",null,"i-{event}")]),e("td",null,"builtin event handling."),e("td",null,[t(" Will trigger on the event "),e("b",null,"E.G."),t(),e("code",null,'i-click="myFunction"'),t(" will trigger the global function myEvent when clicked. ")])])])],-1),A=e("h2",{class:"mb-2"},"Example table",-1),E=e("hr",null,null,-1),G={class:"column gap-3 mb-3"},x=e("i",null,[e("b",null,"With filter:")],-1),S=["filter","contents"],C={class:"column gap-3"},j=e("i",null,[e("b",null,"With selection-property:")],-1),B={class:"row justify-between"},T=["contents"],W=e("span",{class:"mr-5"},"Example function:",-1),N=e("code",{class:"language-javascript"}," function handleSelect(event) { console.log(event.detail.selection) } ",-1),U={class:"border p-5"},F={class:"language-javascript"},O="<flk-table>  </flk-table>",D=`window.onload = () => {
                let ftTable = document.getElementById('ft-table');
                ftTable.setContents(ardeaSet);
                ftTable.init();
      
   })
};`,H={__name:"flightkit-table",setup(J){_(()=>{Prism.highlightAll()});const o=l(""),i=l(0);function u(n){o.value=n.target.value,i.value+=1}const s=l("Make a selection, and see the result here");function m(n){s.value=JSON.parse(JSON.stringify(n.detail.selection))}return(n,M)=>(c(),b(h,{class:"column gap-5"},{default:p(()=>[e("article",null,[g,e("div",{class:"mb-3"},[e("p",null,[t(" The component is "),e("code",null,a(O))])]),e("div",v,[e("section",{class:"column gap-3"},[e("div",null,[y,w,e("pre",{class:"border"},[e("code",{class:"language-javascript"},a(D))]),k])]),e("section",null,[A,E,e("div",G,[x,e("input",{class:"self-align-start",type:"text",placeholder:"filter table",onKeyup:u},null,32),(c(),f("flk-table",{key:i.value,id:"foo",filter:o.value,class:"table",contents:r(d)},null,8,S))]),e("div",C,[j,e("div",B,[e("flk-table",{"selection-property":"scientific_name",class:"table",onSelect:m,contents:r(d)},null,40,T),e("div",null,[W,N,e("pre",U,[e("code",F,a(s.value),1)])])])])])])])]),_:1}))}};export{H as default};