import{C as n}from"./Card-zTmj4XIL.js";import{i as o,h as s,w as a,o as d,d as t,b as l,t as e}from"./index-lkxuAJnY.js";const r=t("header",null,[t("h1",{class:"mb-2"},"Flightkit Dropdown"),t("hr")],-1),i=t("h3",{class:"mb-2"},"Using the dropdown",-1),c=t("hr",null,null,-1),h=t("b",null,"E.G.",-1),p=t("table",{class:"property-table"},[t("thead",null,[t("tr",null,[t("th",null,"Attribute"),t("th",null,"Effect")])]),t("tbody",null,[t("tr",null,[t("td",null,[t("code",null,'text="My dropdown title"')]),t("td",null,"Text to show on the button.")]),t("tr",null,[t("td",null,[t("code",null,"right")]),t("td",null,"Aligns the dropdown drawer to the right (overflows to the left)")]),t("tr",null,[t("td",null,[t("code",null,'drawer-width="30rem"')]),t("td",null,"Customizes the drawer width, you need to implement the unit too.")])])],-1),u=t("section",null,[t("h3",{class:"mb-2"},"Using the dropdown"),t("hr"),t("div",{class:"row justify-between px-5"},[t("flk-dropdown",{class:"primary",text:"Left dropdown","drawer-width":"20rem"},[t("template",null,[t("div",{class:"p-2 border border-light"},"Dropdown on the left")])]),t("flk-dropdown",{text:"Right dropdown",right:""},[t("template",null,[t("div",{class:"p-5"},"Dropdown on the right")])])])],-1),m=t("h3",null,"Example",-1),w=t("hr",null,null,-1),_="<flk-dropdown>  </flk-dropdown>",g="<template></template>",b=`<flk-dropdown
  text="My dropdown"
  class="primary"
  drawer-width="70rem"
  right>
  <template>
    <ul class="p-5 test">
      <li><a>Link 1</a></li>
      <li><a>Link 2</a></li>
      <li><a>Link 3</a></li>
      <li><a>Link 4</a></li>
      <li><a>Link 5</a></li>
    </ul>
  </template>
</flk-dropdown>`,L={__name:"flightkit-dropdown",setup(f){return o(()=>{Prism.highlightAll()}),(k,y)=>(d(),s(n,{class:"column gap-5"},{default:a(()=>[t("article",null,[r,t("div",{class:"mb-3"},[t("p",null,[l(" The component is "),t("code",null,e(_))])]),t("div",{class:"column gap-5"},[t("section",{class:"column gap-3"},[t("div",null,[i,c,t("p",{class:"mb-5"},[l(" It will generate a button. Which will take any classes you give it. So all Avian styles can apply. "),h,l(" link. You need to use a "),t("code",{class:"inline-block my-2"},e(g)),l(" inside the element to make the content not being rendered. ")]),p])]),u,t("section",null,[m,w,t("pre",{class:"border stretch"},[t("code",{class:"language-html"},e(b))])])])])]),_:1}))}};export{L as default};
