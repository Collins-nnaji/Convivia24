module.exports=[93695,(e,t,s)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,s)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,s)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,s)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},24361,(e,t,s)=>{t.exports=e.x("util",()=>require("util"))},71220,e=>{"use strict";var t=e.i(47909),s=e.i(74017),a=e.i(96250),i=e.i(59756),r=e.i(61916),n=e.i(74677),o=e.i(69741),l=e.i(16795),c=e.i(87718),d=e.i(95169),u=e.i(47587),p=e.i(66012),_=e.i(70101),b=e.i(26937),m=e.i(10372),h=e.i(93695);e.i(52474);var g=e.i(220),R=e.i(89171),E=e.i(80998),x=e.i(71650);async function k(e){try{let t=(0,x.requireRole)("supervisor","admin"),s=await t(e);if(s.error)return R.NextResponse.json({error:s.error},{status:s.status});let{booking_id:a,checklist_items:i,photos:r,sign_off:n,signature_url:o,non_compliance_notes:l}=await e.json();if(!a)return R.NextResponse.json({error:"Booking ID is required"},{status:400});let[c]=await E.sql`
      SELECT * FROM bookings WHERE id = ${a}
    `;if(!c)return R.NextResponse.json({error:"Booking not found"},{status:404});let[d]=await E.sql`
      INSERT INTO compliance_logs (
        booking_id,
        checked_by,
        checklist_items,
        photos,
        sign_off,
        signature_url,
        non_compliance_notes,
        verified_at
      )
      VALUES (
        ${a},
        ${s.user.id},
        ${i?JSON.stringify(i):null},
        ${r||[]},
        ${n||!1},
        ${o||null},
        ${l||null},
        ${n?new Date().toISOString():null}
      )
      RETURNING *
    `;if(d.checklist_items&&"string"==typeof d.checklist_items&&(d.checklist_items=JSON.parse(d.checklist_items)),n&&"completed"!==c.status){await E.sql`
        UPDATE bookings
        SET status = 'completed', actual_end = CURRENT_TIMESTAMP
        WHERE id = ${a}
      `;let e=`INV-${Date.now()}-${a.substring(0,8)}`,t=new Date;t.setDate(t.getDate()+30),await E.sql`
        INSERT INTO invoices (
          booking_id,
          business_id,
          invoice_number,
          amount,
          tax,
          total,
          due_date,
          status
        )
        VALUES (
          ${a},
          ${c.business_id},
          ${e},
          ${c.total_cost},
          ${.075*c.total_cost}, -- 7.5% VAT (adjust as needed)
          ${1.075*c.total_cost},
          ${t.toISOString().split("T")[0]},
          'sent'
        )
      `}return R.NextResponse.json({compliance_log:d},{status:201})}catch(e){return console.error("Create compliance log error:",e),R.NextResponse.json({error:"Failed to create compliance log"},{status:500})}}async function f(e){try{let t,s=await authenticate(e);if(s.error)return R.NextResponse.json({error:s.error},{status:s.status});let{user:a}=s;if(!["admin","supervisor","client"].includes(a.role))return R.NextResponse.json({error:"Unauthorized"},{status:403});let{searchParams:i}=new URL(e.url),r=i.get("booking_id");if(!E.sql){let e=[{id:"mock-log-1",booking_id:r||"mock-3",checked_by:"mock-supervisor-1",checked_by_first_name:"Supervisor",checked_by_last_name:"User",checked_by_email:"supervisor@convivia24.com",checklist_items:[{id:1,text:"All floors swept and mopped",completed:!0},{id:2,text:"Restrooms cleaned and sanitized",completed:!0},{id:3,text:"Trash bins emptied",completed:!0},{id:4,text:"High-touch surfaces disinfected",completed:!0},{id:5,text:"Windows and glass surfaces cleaned",completed:!0},{id:6,text:"Furniture dusted and arranged",completed:!0}],photos:[],sign_off:!0,verified_at:new Date(Date.now()-864e5).toISOString(),booking_status:"completed",business_name:"Finance Hub Ltd",created_at:new Date(Date.now()-864e5).toISOString()}];return r&&(e=e.filter(e=>e.booking_id===r)),"client"===a.role&&(e=e.filter(e=>e.business_id===a.business_id)),R.NextResponse.json({compliance_logs:e})}return"admin"===a.role||"supervisor"===a.role?t=r?await E.sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email,
            u.first_name as checked_by_first_name,
            u.last_name as checked_by_last_name
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE cl.booking_id = ${r}
          ORDER BY cl.created_at DESC
          LIMIT 100
        `:await E.sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email,
            u.first_name as checked_by_first_name,
            u.last_name as checked_by_last_name
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          ORDER BY cl.created_at DESC
          LIMIT 100
        `:"client"===a.role&&(t=r?await E.sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE b.business_id = ${a.business_id} AND cl.booking_id = ${r}
          ORDER BY cl.created_at DESC
        `:await E.sql`
          SELECT 
            cl.*,
            b.id as booking_id,
            b.status as booking_status,
            bs.name as business_name,
            u.email as checked_by_email
          FROM compliance_logs cl
          LEFT JOIN bookings b ON cl.booking_id = b.id
          LEFT JOIN businesses bs ON b.business_id = bs.id
          LEFT JOIN users u ON cl.checked_by = u.id
          WHERE b.business_id = ${a.business_id}
          ORDER BY cl.created_at DESC
        `),t.forEach(e=>{e.checklist_items&&"string"==typeof e.checklist_items&&(e.checklist_items=JSON.parse(e.checklist_items))}),R.NextResponse.json({compliance_logs:t})}catch(e){return console.error("Get compliance logs error:",e),R.NextResponse.json({error:"Failed to fetch compliance logs"},{status:500})}}e.s(["GET",()=>f,"POST",()=>k],72087);var N=e.i(72087);let v=new t.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/compliance/route",pathname:"/api/compliance",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/compliance/route.js",nextConfigOutput:"",userland:N}),{workAsyncStorage:O,workUnitAsyncStorage:w,serverHooks:y}=v;function T(){return(0,a.patchFetch)({workAsyncStorage:O,workUnitAsyncStorage:w})}async function S(e,t,a){v.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let R="/api/compliance/route";R=R.replace(/\/index$/,"")||"/";let E=await v.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!E)return t.statusCode=400,t.end("Bad Request"),null==a.waitUntil||a.waitUntil.call(a,Promise.resolve()),null;let{buildId:x,params:k,nextConfig:f,parsedUrl:N,isDraftMode:O,prerenderManifest:w,routerServerContext:y,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,resolvedPathname:C,clientReferenceManifest:I,serverActionsManifest:A}=E,D=(0,o.normalizeAppPath)(R),q=!!(w.dynamicRoutes[D]||w.routes[C]),$=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,N,!1):t.end("This page could not be found"),null);if(q&&!O){let e=!!w.routes[C],t=w.dynamicRoutes[D];if(t&&!1===t.fallback&&!e){if(f.experimental.adapterPath)return await $();throw new h.NoFallbackError}}let j=null;!q||v.isDev||O||(j="/index"===(j=C)?"/":j);let F=!0===v.isDev||!q,L=q&&!F;A&&I&&(0,n.setManifestsSingleton)({page:R,clientReferenceManifest:I,serverActionsManifest:A});let P=e.method||"GET",H=(0,r.getTracer)(),U=H.getActiveScopeSpan(),M={params:k,prerenderManifest:w,renderOpts:{experimental:{authInterrupts:!!f.experimental.authInterrupts},cacheComponents:!!f.cacheComponents,supportsDynamicResponse:F,incrementalCache:(0,i.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:f.cacheLife,waitUntil:a.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,s,a,i)=>v.onRequestError(e,t,a,i,y)},sharedContext:{buildId:x}},J=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),K=c.NextRequestAdapter.fromNodeNextRequest(J,(0,c.signalFromNodeResponse)(t));try{let n=async e=>v.handle(K,M).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let s=H.getRootSpanAttributes();if(!s)return;if(s.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${s.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=s.get("next.route");if(a){let t=`${P} ${a}`;e.setAttributes({"next.route":a,"http.route":a,"next.span_name":t}),e.updateName(t)}else e.updateName(`${P} ${R}`)}),o=!!(0,i.getRequestMeta)(e,"minimalMode"),l=async i=>{var r,l;let c=async({previousCacheEntry:s})=>{try{if(!o&&T&&S&&!s)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let r=await n(i);e.fetchMetrics=M.renderOpts.fetchMetrics;let l=M.renderOpts.pendingWaitUntil;l&&a.waitUntil&&(a.waitUntil(l),l=void 0);let c=M.renderOpts.collectedTags;if(!q)return await (0,p.sendResponse)(J,B,r,M.renderOpts.pendingWaitUntil),null;{let e=await r.blob(),t=(0,_.toNodeOutgoingHttpHeaders)(r.headers);c&&(t[m.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let s=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,a=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:g.CachedRouteKind.APP_ROUTE,status:r.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:s,expire:a}}}}catch(t){throw(null==s?void 0:s.isStale)&&await v.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:L,isOnDemandRevalidate:T})},!1,y),t}},d=await v.handleResponse({req:e,nextConfig:f,cacheKey:j,routeKind:s.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:w,isRoutePPREnabled:!1,isOnDemandRevalidate:T,revalidateOnlyGenerated:S,responseGenerator:c,waitUntil:a.waitUntil,isMinimalMode:o});if(!q)return null;if((null==d||null==(r=d.value)?void 0:r.kind)!==g.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});o||t.setHeader("x-nextjs-cache",T?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let h=(0,_.fromNodeOutgoingHttpHeaders)(d.value.headers);return o&&q||h.delete(m.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||h.get("Cache-Control")||h.set("Cache-Control",(0,b.getCacheControlHeader)(d.cacheControl)),await (0,p.sendResponse)(J,B,new Response(d.value.body,{headers:h,status:d.value.status||200})),null};U?await l(U):await H.withPropagatedContext(e.headers,()=>H.trace(d.BaseServerSpan.handleRequest,{spanName:`${P} ${R}`,kind:r.SpanKind.SERVER,attributes:{"http.method":P,"http.target":e.url}},l))}catch(t){if(t instanceof h.NoFallbackError||await v.onRequestError(e,t,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:L,isOnDemandRevalidate:T})},!1,y),q)throw t;return await (0,p.sendResponse)(J,B,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>T,"routeModule",()=>v,"serverHooks",()=>y,"workAsyncStorage",()=>O,"workUnitAsyncStorage",()=>w],71220)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__28c4cee6._.js.map