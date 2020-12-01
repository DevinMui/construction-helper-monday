(this["webpackJsonpmonday-integration-quickstart-app"]=this["webpackJsonpmonday-integration-quickstart-app"]||[]).push([[0],{287:function(e,t,a){e.exports=a(438)},292:function(e,t,a){},293:function(e,t,a){},438:function(e,t,a){"use strict";a.r(t);var n=a(1),i=a.n(n),o=a(75),r=a.n(o),l=(a(292),a(12)),s=a(23),u=a(24),d=a(11),c=(a(293),a(294),a(259)),m=a.n(c),f=a(260),h=a(271),v=m()(),g=[[{day:"2017-08-23",value:397},{day:"2017-08-04",value:79}],[],[],[],[],[],[],[],[]],p=[],y=0,b=[],k=[],S=[],x=[],D=["hsl(36, 70%, 50%)","hsl(170, 70%, 50%)","hsl(217, 70%, 50%)","hsl(240, 70%, 50%)","hsl(286, 70%, 50%)"],w=function e(t,a){Object(d.a)(this,e),this.x=t,this.y=a},C=function(e){Object(s.a)(a,e);var t=Object(u.a)(a);function a(e){var n;return Object(d.a)(this,a),(n=t.call(this,e)).randomData=function(e){e.preventDefault(),n.setState((function(e){return{data:e.data.map((function(e){return{name:e.name,value:Math.floor(100*Math.random()+1)}}))}}))},n.state={settings:{},name:"",boardData:{},data2:[],calendarData:[]},n}return Object(l.a)(a,[{key:"subCalendarItem",value:function(e,t,a){if(null!=e&&null!=t&&""!=t){var n=e.length;if(0!=n){new Date(e[n-1].day),new Date(e[0].day);return i.a.createElement("div",null,i.a.createElement("div",null,i.a.createElement("h2",null,a)),i.a.createElement("div",{style:{height:400}},i.a.createElement(f.a,{data:t,margin:{top:50,right:110,bottom:50,left:60},xScale:{type:"point"},yScale:{type:"linear",min:"auto",max:"auto",stacked:!0,reverse:!1},yFormat:" >-.2f",axisTop:null,axisRight:null,axisBottom:{orient:"bottom",tickSize:5,tickPadding:5,tickRotation:0,legend:"Dates",legendOffset:36,legendPosition:"middle"},axisLeft:{orient:"left",tickSize:5,tickPadding:5,tickRotation:0,legend:"Price",legendOffset:-40,legendPosition:"middle"},pointSize:10,pointColor:{theme:"background"},pointBorderWidth:2,pointBorderColor:{from:"serieColor"},pointLabelYOffset:-12,useMesh:!0,legends:[{anchor:"bottom-right",direction:"column",justify:!1,translateX:100,translateY:0,itemsSpacing:0,itemDirection:"left-to-right",itemWidth:80,itemHeight:20,itemOpacity:.75,symbolSize:12,symbolShape:"circle",symbolBorderColor:"rgba(0, 0, 0, .5)",effects:[{on:"hover",style:{itemBackground:"rgba(0, 0, 0, .03)",itemOpacity:1}}]}]})),i.a.createElement("div",{style:{height:600}},i.a.createElement(h.a,{data:e,from:e[0].day,to:e[n-1].day,emptyColor:"#eeeeee",colors:["#61cdbb","#97e3d5","#e8c1a0","#f47560"],margin:{top:40,right:40,bottom:40,left:40},yearSpacing:40,minValue:e[0].value,maxValue:e[n-1].value,monthBorderColor:"#ffffff",dayBorderWidth:2,dayBorderColor:"#ffffff",legends:[{anchor:"bottom-right",direction:"row",translateY:36,itemCount:4,itemWidth:42,itemHeight:36,itemsSpacing:14,itemDirection:"right-to-left"}]})))}return i.a.createElement("div",null)}return i.a.createElement("div",null)}},{key:"renderItems",value:function(){var e=[],t=0;for(t=0;t<y;t++){var a=g[t],n=[];n[0]=S[t],e.push(this.subCalendarItem(a,n,b[t]))}return e}},{key:"parsePricePoint",value:function(e,t,a){var n,i,o=this,r=0;for(i=0;i<y;i++){var l={id:b[i],color:D[i],data:[]};S[i]=l,x[i]=[]}for(n=0;n<e.length;n++)e[n].then((function(t){var a=t.data.items[0].id;i=0;var n=!1;for(i=0;i<y;i++){for(var l=p[i].values(),s=null;s=l.next().value;)s==a&&(n=!0);if(n)break}if(t.data.items[0].column_values[3].value&&t.data.items[0].column_values[4].value){var u=new Date(parseInt(t.data.items[0].column_values[3].value.replaceAll('"',""),10)),d=("0"+(u.getMonth()+1)).slice(-2),c=u.getUTCDate(),m=u.getUTCFullYear(),f=m+"/"+d+"/"+c,h=m+"-"+d+"-"+c;S[i].data.push({x:f,y:t.data.items[0].column_values[4].value.replaceAll('"',"")}),x[i].push({day:h,value:parseInt(t.data.items[0].column_values[4].value.replaceAll('"',""),10)})}else;r==e.length-1&&(console.log(S),S,o.setState({data2:S}),o.setState({calendarData:x}),g=x),r++}))}},{key:"parseData",value:function(e){var t,a,n=this,i=e.boards[0].items;for(y=i.length,t=0;t<y;t++){var o=[],r=i[t].column_values,l=r[14].value,s=r[0].value,u=JSON.parse(l),d=new Set;for(b.push(s),a=0;a<u.linkedPulseIds.length;a++){var c=u.linkedPulseIds[a].linkedPulseId;d.add(c);var m="query { items(ids: "+c+") { id column_values { id type value } } }";new w("","");k.push(v.api(m))}p[t]=d,Promise.all(k).then((function(e){n.parsePricePoint(k,o,s)}))}}}]),Object(l.a)(a,[{key:"componentDidMount",value:function(){var e=this;v.listen("settings",(function(t){e.setState({settings:t.data})})),v.listen("context",(function(t){e.setState({context:t.data}),v.api("query { boards(ids: [878537780]) { items { name group { id } column_values { id value text }  } }}",{variables:{boardIds:e.state.context.boardIds}}).then((function(t){e.setState({boardData:t.data})}))})),v.api("query { boards(ids: [878537780]) { items { name group { id } column_values { id value text }  } }}").then((function(t){e.parseData(t.data)}))}},{key:"render",value:function(){return i.a.createElement("div",{style:{background:this.state.settings.background,paddingLeft:100,paddingTop:100}},this.renderItems())}}]),a}(i.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(i.a.createElement(C,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[287,1,2]]]);
//# sourceMappingURL=main.617e6fac.chunk.js.map