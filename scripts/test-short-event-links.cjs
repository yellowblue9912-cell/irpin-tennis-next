const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict');
const load=(path,requireMock)=>{const exports={};new Function('require','exports',ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(requireMock,exports);return exports;};
const stores=load('lib/tennisGoLinks.ts',()=>{});
const redirect=load('lib/invitationRedirect.ts',()=>stores);
let id='11111111-1111-4111-8111-111111111111',event={title:'<script>alert(1)</script>',city:'Ірпінь',court:'Корт'},error=null;
const rpc=async name=>({data:name==='resolve_event_share_code'?id:event,error});
const {shortEventResponse:respond}=load('lib/shortEventLink.ts',name=>name==='@supabase/supabase-js'?{createClient:()=>({rpc})}:redirect);
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='public-test';
const request=agent=>new Request('https://tennisgo.club/match/abcdef12',{headers:{'user-agent':agent}});
(async()=>{
 let r=await respond(request('iPhone'),'match','abcdef12');assert.equal(r.status,307);assert.ok(r.headers.get('location').includes('testflight.apple.com'));
 r=await respond(request('Android'),'match','abcdef12');assert.ok(r.headers.get('location').includes('play.google.com/apps/testing/'));
 r=await respond(request('TelegramBot'),'tournament','abcdef12');assert.equal(r.status,200);let html=await r.text();assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('og:site_name" content="TennisGo'));
 assert.equal((await respond(request('iPhone'),'match','not-valid')).status,404);
 id=null;assert.equal((await respond(request('iPhone'),'match','abcdef12')).status,404);
 id='11111111-1111-4111-8111-111111111111';event=null;assert.equal((await respond(request('iPhone'),'match','abcdef12')).status,404);
 error=new Error('unavailable');assert.equal((await respond(request('iPhone'),'match','abcdef12')).status,503);
 console.log('Website invitations: platform redirects, preview escaping, invalid/deleted events and service errors passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
