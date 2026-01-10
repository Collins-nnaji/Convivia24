module.exports=[93695,(e,t,s)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,s)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,s)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},24361,(e,t,s)=>{t.exports=e.x("util",()=>require("util"))},62504,e=>{"use strict";var t=e.i(47909),s=e.i(74017),a=e.i(96250),n=e.i(59756),r=e.i(61916),i=e.i(74677),o=e.i(69741),d=e.i(16795),l=e.i(87718),u=e.i(95169),c=e.i(47587),p=e.i(66012),_=e.i(70101),m=e.i(26937),R=e.i(10372),f=e.i(93695);e.i(52474);var E=e.i(220),h=e.i(89171),g=e.i(80998),v=e.i(71650);async function b(e,{params:t}){try{let s=await (0,v.authenticate)(e);if(s.error)return h.NextResponse.json({error:s.error},{status:s.status});let{user:a}=s,{id:n}=t;if(!g.sql){let e={id:n,business_id:"mock-business-1",service_id:"mock-service-1",requested_by:a.id,status:n.includes("mock-1")?"pending":n.includes("mock-2")?"in_progress":"completed",urgency:"routine",scheduled_start:new Date(Date.now()+864e5).toISOString(),scheduled_end:new Date(Date.now()+864e5+144e5).toISOString(),location_address:"123 Main Street, Lagos",special_instructions:"Please use eco-friendly cleaning products",total_cost:15e3,payment_status:"pending",business_name:"TechCorp Nigeria",business_address:"123 Main Street, Lagos",business_phone:"+234 800 000 0000",service_name:"Routine Commercial Cleaning",service_type:"routine",service_description:"Daily/weekly office cleaning including floors, restrooms, and common areas",requested_by_email:"client@techcorp.com",requested_by_first_name:"John",requested_by_last_name:"Doe",assignments:[{id:"mock-assignment-1",staff_id:"mock-staff-1",staff_first_name:"James",staff_last_name:"Wilson",staff_email:"james@convivia24.com",status:"assigned",assigned_at:new Date().toISOString()}],compliance_logs:n.includes("mock-3")?[{id:"mock-log-1",checked_by:"mock-supervisor-1",checked_by_first_name:"Supervisor",checked_by_last_name:"User",checklist_items:[{id:1,text:"All floors swept and mopped",completed:!0},{id:2,text:"Restrooms cleaned and sanitized",completed:!0},{id:3,text:"Trash bins emptied",completed:!0}],photos:[],sign_off:!0,verified_at:new Date(Date.now()-864e5).toISOString()}]:[],invoice:n.includes("mock-3")?{id:"mock-invoice-1",invoice_number:"INV-2024-001",amount:15e3,tax:1125,total:16125,status:"paid",due_date:new Date(Date.now()+2592e6).toISOString().split("T")[0],paid_at:new Date(Date.now()-1728e5).toISOString()}:null,created_at:new Date().toISOString()};return h.NextResponse.json({booking:e})}let[r]=await g.sql`
      SELECT 
        b.*,
        bs.name as business_name,
        bs.address as business_address,
        bs.phone as business_phone,
        s.name as service_name,
        s.type as service_type,
        s.description as service_description,
        u.email as requested_by_email,
        u.first_name as requested_by_first_name,
        u.last_name as requested_by_last_name
      FROM bookings b
      LEFT JOIN businesses bs ON b.business_id = bs.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN users u ON b.requested_by = u.id
      WHERE b.id = ${n}
    `;if(!r)return h.NextResponse.json({error:"Booking not found"},{status:404});if("client"===a.role&&r.business_id!==a.business_id)return h.NextResponse.json({error:"Unauthorized"},{status:403});let i=await g.sql`
      SELECT 
        sa.*,
        u.email as staff_email,
        u.first_name as staff_first_name,
        u.last_name as staff_last_name,
        sup.email as supervisor_email,
        sup.first_name as supervisor_first_name,
        sup.last_name as supervisor_last_name
      FROM staff_assignments sa
      LEFT JOIN users u ON sa.staff_id = u.id
      LEFT JOIN users sup ON sa.supervisor_id = sup.id
      WHERE sa.booking_id = ${n}
    `,o=await g.sql`
      SELECT 
        cl.*,
        u.email as checked_by_email,
        u.first_name as checked_by_first_name,
        u.last_name as checked_by_last_name
      FROM compliance_logs cl
      LEFT JOIN users u ON cl.checked_by = u.id
      WHERE cl.booking_id = ${n}
      ORDER BY cl.created_at DESC
    `,[d]=await g.sql`
      SELECT * FROM invoices WHERE booking_id = ${n}
    `;return h.NextResponse.json({booking:{...r,assignments:i,compliance_logs:o,invoice:d}})}catch(e){return console.error("Get booking error:",e),h.NextResponse.json({error:"Failed to fetch booking"},{status:500})}}async function x(e,{params:t}){try{let s,a=await (0,v.authenticate)(e);if(a.error)return h.NextResponse.json({error:a.error},{status:a.status});let{user:n}=a,{id:r}=t,i=await e.json(),[o]=await g.sql`
      SELECT * FROM bookings WHERE id = ${r}
    `;if(!o)return h.NextResponse.json({error:"Booking not found"},{status:404});if("admin"!==n.role&&("client"!==n.role||o.business_id!==n.business_id)&&("staff"!==n.role||"in_progress"!==o.status))return h.NextResponse.json({error:"Unauthorized to update this booking"},{status:403});if(void 0!==i.status&&void 0!==i.scheduled_start&&void 0!==i.scheduled_end)s=await g.sql`
        UPDATE bookings
        SET 
          status = ${i.status},
          scheduled_start = ${i.scheduled_start},
          scheduled_end = ${i.scheduled_end},
          special_instructions = ${i.special_instructions||o.special_instructions},
          location_address = ${i.location_address||o.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${r}
        RETURNING *
      `;else if(void 0!==i.status)s=await g.sql`
        UPDATE bookings
        SET 
          status = ${i.status},
          special_instructions = ${void 0!==i.special_instructions?i.special_instructions:o.special_instructions},
          location_address = ${void 0!==i.location_address?i.location_address:o.location_address},
          actual_start = ${void 0!==i.actual_start?i.actual_start:o.actual_start},
          actual_end = ${void 0!==i.actual_end?i.actual_end:o.actual_end},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${r}
        RETURNING *
      `;else if(void 0!==i.scheduled_start&&void 0!==i.scheduled_end)s=await g.sql`
        UPDATE bookings
        SET 
          scheduled_start = ${i.scheduled_start},
          scheduled_end = ${i.scheduled_end},
          special_instructions = ${void 0!==i.special_instructions?i.special_instructions:o.special_instructions},
          location_address = ${void 0!==i.location_address?i.location_address:o.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${r}
        RETURNING *
      `;else if(void 0!==i.actual_start||void 0!==i.actual_end)s=await g.sql`
        UPDATE bookings
        SET 
          actual_start = ${void 0!==i.actual_start?i.actual_start:o.actual_start},
          actual_end = ${void 0!==i.actual_end?i.actual_end:o.actual_end},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${r}
        RETURNING *
      `;else{if(void 0===i.special_instructions&&void 0===i.location_address)return h.NextResponse.json({error:"No fields to update"},{status:400});s=await g.sql`
        UPDATE bookings
        SET 
          special_instructions = ${void 0!==i.special_instructions?i.special_instructions:o.special_instructions},
          location_address = ${void 0!==i.location_address?i.location_address:o.location_address},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${r}
        RETURNING *
      `}if(!s||0===s.length)return h.NextResponse.json({error:"Booking not found or update failed"},{status:404});return h.NextResponse.json({booking:s[0]})}catch(e){return console.error("Update booking error:",e),h.NextResponse.json({error:"Failed to update booking"},{status:500})}}e.s(["GET",()=>b,"PATCH",()=>x],43542);var T=e.i(43542);let w=new t.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/bookings/[id]/route",pathname:"/api/bookings/[id]",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/bookings/[id]/route.js",nextConfigOutput:"",userland:T}),{workAsyncStorage:k,workUnitAsyncStorage:N,serverHooks:y}=w;function S(){return(0,a.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:N})}async function C(e,t,a){w.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let h="/api/bookings/[id]/route";h=h.replace(/\/index$/,"")||"/";let g=await w.prepare(e,t,{srcPage:h,multiZoneDraftMode:!1});if(!g)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:v,params:b,nextConfig:x,parsedUrl:T,isDraftMode:k,prerenderManifest:N,routerServerContext:y,isOnDemandRevalidate:S,revalidateOnlyGenerated:C,resolvedPathname:O,clientReferenceManifest:A,serverActionsManifest:q}=g,I=(0,o.normalizeAppPath)(h),$=!!(N.dynamicRoutes[I]||N.routes[O]),P=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,T,!1):t.end("This page could not be found"),null);if($&&!k){let e=!!N.routes[O],t=N.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(x.experimental.adapterPath)return await P();throw new f.NoFallbackError}}let U=null;!$||w.isDev||k||(U="/index"===(U=O)?"/":U);let D=!0===w.isDev||!$,j=$&&!D;q&&A&&(0,i.setManifestsSingleton)({page:h,clientReferenceManifest:A,serverActionsManifest:q});let M=e.method||"GET",H=(0,r.getTracer)(),F=H.getActiveScopeSpan(),L={params:b,prerenderManifest:N,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,s,a,n)=>w.onRequestError(e,t,a,n,y)},sharedContext:{buildId:v}},W=new d.NodeNextRequest(e),G=new d.NodeNextResponse(t),B=l.NextRequestAdapter.fromNodeNextRequest(W,(0,l.signalFromNodeResponse)(t));try{let i=async e=>w.handle(B,L).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let s=H.getRootSpanAttributes();if(!s)return;if(s.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${s.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=s.get("next.route");if(a){let t=`${M} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${M} ${h}`)}),o=!!(0,n.getRequestMeta)(e,"minimalMode"),d=async n=>{var r,d;let l=async({previousCacheEntry:s})=>{try{if(!o&&S&&C&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await i(n);e.fetchMetrics=L.renderOpts.fetchMetrics;let d=L.renderOpts.pendingWaitUntil;d&&a.waitUntil&&(a.waitUntil(d),d=void 0);let l=L.renderOpts.collectedTags;if(!$)return await (0,p.sendResponse)(W,G,r,L.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(r.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let s=void 0!==L.renderOpts.collectedRevalidate&&!(L.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&L.renderOpts.collectedRevalidate,a=void 0===L.renderOpts.collectedExpire||L.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:L.renderOpts.collectedExpire;return{value:{kind:E.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:s,expire:a}}}}catch(t){throw(null==s?void 0:s.isStale)&&await w.onRequestError(e,t,{routerKind:"App Router",routePath:h,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:S})},!1,y),t}},u=await w.handleResponse({req:e,nextConfig:x,cacheKey:U,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:N,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:C,responseGenerator:l,waitUntil:a.waitUntil,isMinimalMode:o});if(!$)return null;if((null==u||null==(r=u.value)?void 0:r.kind)!==E.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(d=u.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",S?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),k&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,_.fromNodeOutgoingHttpHeaders)(u.value.headers);return o&&$||f.delete(R.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,m.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)(W,G,new Response(u.value.body,{headers:f,status:u.value.status||200})),null};F?await d(F):await H.withPropagatedContext(e.headers,()=>H.trace(u.BaseServerSpan.handleRequest,{spanName:`${M} ${h}`,kind:r.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},d))}catch(t){if(t instanceof f.NoFallbackError||await w.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:j,isOnDemandRevalidate:S})},!1,y),$)throw t;return await (0,p.sendResponse)(W,G,new Response(null,{status:500})),null}}e.s(["handler",()=>C,"patchFetch",()=>S,"routeModule",()=>w,"serverHooks",()=>y,"workAsyncStorage",()=>k,"workUnitAsyncStorage",()=>N],62504)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__39b0ca01._.js.map