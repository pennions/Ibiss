import{C as o}from"./Card-2OCnG6Eh.js";import{i as a,h as s,w as d,o as u,d as l,b as e,t}from"./index-Z9theFxX.js";const c=l("header",null,[l("h1",{class:"mb-2"},"Flightkit Modal"),l("hr")],-1),i=l("section",{class:"column gap-3"},[l("div",null,[l("h3",{class:"mb-2"},"Using the modal"),l("hr"),l("table",{class:"property-table mb-5"},[l("thead",null,[l("tr",null,[l("th",null,"Attribute"),l("th",null,"Function"),l("th",null,"How to use")])]),l("tbody",null,[l("tr",null,[l("td",null,[l("code",null,'title=""')]),l("td",null,"Sets the title of the modal header"),l("td",null,[l("b",null,"E.G."),e(' title="my modal"')])]),l("tr",null,[l("td",null,[l("code",null,'header-class=""')]),l("td",null,"Adds classes to the header, add multiple with a space"),l("td",null,[l("b",null,"E.G."),e(' header-class="foo bar baz"')])])])]),l("span",{class:"inline-block mb-3"},[e(" When you have the element selected like "),l("code",null,"let myModal = document.getElementById('myModal')"),e(" you can use the following functions: ")]),l("table",{class:"property-table"},[l("thead",null,[l("tr",null,[l("th",null,"Function"),l("th",null,"Parameters / Events"),l("th",null,"Effect")])]),l("tbody",null,[l("tr",null,[l("td",null,[l("code",null,"myModal.openModal(reset = true)")]),l("td",null,[e(" If reset is "),l("i",null,"true"),e(" the modal will be reset to the center. If false it will appear where the user left it. ")]),l("td",null,"Shows the modal")]),l("tr",null,[l("td",null,[l("code",null,"myModal.closeModal()")]),l("td",null,[e(" Emits the event 'hide' with the "),l("code",null,"{ hidden: true, id: {id} }"),e(" parameters ")]),l("td",null,"Closes the modal")])])])])],-1),h=l("h3",{class:"mb-2"},"Using the modal",-1),r=l("hr",null,null,-1),m=l("flk-modal",{id:"foo",title:"My Modal"},[l("div",{class:"p-1"},[l("h1",null,"Modal title"),l("hr"),l("section",null,"Hello Modal!")])],-1),p="<flk-modal>  </flk-modal>",f="<flk-draggable>  </flk-draggable>",k={__name:"flightkit-modal",setup(b){a(()=>{Prism.highlightAll()});function n(){document.getElementById("foo").openModal()}return(g,_)=>(u(),s(o,{class:"column gap-5"},{default:d(()=>[l("article",null,[c,l("div",{class:"mb-3"},[l("p",{class:"column gap-2 align-start"},[e(" The component is "),l("code",null,t(p)),e(" Dependencies: "),l("code",null,t(f))])]),l("div",{class:"column gap-5"},[i,l("section",null,[h,r,l("button",{onClick:n},"Open modal"),m])])])]),_:1}))}};export{k as default};
