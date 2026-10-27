const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://localhost:3016';
const id = '9921c7e8-7141-42f4-b550-649fad18a5b4';
(async () => {
 let checks = 0;
 for (const [agent, expected] of [
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)','https://testflight.apple.com/join/b7TRQTF3'],
  ['Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)','https://testflight.apple.com/join/b7TRQTF3'],
  ['Mozilla/5.0 (Linux; Android 14; Pixel 8)','https://play.google.com/apps/testing/com.irpintennis.app'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)','https://testflight.apple.com/join/b7TRQTF3'],
 ]) for (const path of [`/invite/${id}`,`/invite/tournament/${id}`]) {
   const r = await fetch(base+path,{redirect:'manual',headers:{'User-Agent':agent}});
   assert.equal(r.status,307);assert.equal(r.headers.get('location'),expected);assert.equal(await r.text(),'');
   assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('vary'),/User-Agent/i);checks++;
 }
 const missing=await fetch(base+'/invite/not-a-valid-id',{redirect:'manual'});assert.equal(missing.status,404);checks++;
 for(const path of ['apple-app-site-association','assetlinks.json']){const r=await fetch(base+'/.well-known/'+path,{redirect:'manual'});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/json/);checks++;}
 console.log(`${checks} direct invitation redirects / no intermediate HTML / platform / association checks passed`);
})().catch(e=>{console.error(e);process.exitCode=1;});
