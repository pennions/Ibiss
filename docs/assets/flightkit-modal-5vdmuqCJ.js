import{C as a}from"./Card-8frXWVwT.js";import{i as s,h as d,w as u,o as c,d as l,b as e,t}from"./index-swt2rCww.js";const i=l("header",null,[l("h1",{class:"mb-2"},"Flightkit Modal"),l("hr")],-1),h=l("section",{class:"column gap-3"},[l("div",null,[l("h3",{class:"mb-2"},"Using the modal"),l("hr"),l("table",{class:"property-table mb-5"},[l("thead",null,[l("tr",null,[l("th",null,"Attribute"),l("th",null,"Function"),l("th",null,"How to use")])]),l("tbody",null,[l("tr",null,[l("td",null,[l("code",null,'modal-title=""')]),l("td",null,"Sets the title of the modal header"),l("td",null,[l("b",null,"E.G."),e(' modal-title="my modal"')])]),l("tr",null,[l("td",null,[l("code",null,'header-class=""')]),l("td",null,"Adds classes to the header, add multiple with a space"),l("td",null,[l("b",null,"E.G."),e(' header-class="foo bar baz"')])])])]),l("span",{class:"inline-block mb-3"},[e(" When you have the element selected like "),l("code",null,"let myModal = document.getElementById('myModal')"),e(" you can use the following functions: ")]),l("table",{class:"property-table"},[l("thead",null,[l("tr",null,[l("th",null,"Function"),l("th",null,"Parameters / Events"),l("th",null,"Effect")])]),l("tbody",null,[l("tr",null,[l("td",null,[l("code",null,"myModal.openModal(reset = true)")]),l("td",null,[e(" If reset is "),l("i",null,"true [default]"),e(" the modal will be reset to the center. If false it will appear where the user left it. ")]),l("td",null,"Shows the modal")]),l("tr",null,[l("td",null,[l("code",null,"myModal.closeModal()")]),l("td"),l("td",null,"Closes the modal")])])])])],-1),r=l("h3",{class:"mb-2"},"Using the modal",-1),m=l("hr",null,null,-1),p=l("flk-modal",{id:"foo","modal-title":"My Modal"},[l("div",{class:"p-1"},[l("h1",null,"Modal title"),l("hr"),l("section",null,"Hello Modal!")])],-1),f="<flk-modal>  </flk-modal>",b="<flk-draggable>  </flk-draggable>",w={__name:"flightkit-modal",setup(g){s(()=>{Prism.highlightAll()});function o(){document.getElementById("foo").openModal()}function n(){document.getElementById("foo").closeModal()}return(_,y)=>(c(),d(a,{class:"column gap-5"},{default:u(()=>[l("article",null,[i,l("div",{class:"mb-3"},[l("p",{class:"column gap-2 align-start"},[e(" The component is "),l("code",null,t(f)),e(" Dependencies: "),l("code",null,t(b))])]),l("div",{class:"column gap-5"},[h,l("section",null,[r,m,l("button",{class:"mr-3",onClick:o},"Open modal"),l("button",{onClick:n},"Close the modal"),p])])])]),_:1}))}};export{w as default};