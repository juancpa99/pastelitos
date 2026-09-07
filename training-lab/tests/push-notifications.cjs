const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const client=fs.readFileSync(path.join(root,'push-client.js'),'utf8');
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const deliver=fs.readFileSync(path.resolve(root,'..','push-server','api','deliver.js'),'utf8');

const categories=['rest','workout','checkin','body','monthly','breakfast','lunch','snack','dinner','post-workout'];
for(const category of categories){
  const tag=`marevo-${category}`;
  assert.ok(client.includes(`'${tag}'`),`push-client must define ${tag}`);
  assert.ok(worker.includes(`'${tag}'`),`service worker must define ${tag}`);
}

assert.ok(worker.includes('getNotifications({tag})'),'service worker must close an existing notification with the same tag');
assert.ok(worker.includes('renotify:false'),'replacement notifications must not create a new alert chain');
assert.ok(deliver.includes('topic:pushTopic(reminder)'),'remote Web Push must use a stable Topic');
assert.ok(client.includes("`workout:${date}`"),'daily workout deduplication key must remain date-specific');
assert.ok(client.includes("'workout',at"),'workout display tag must remain category-specific');

console.log('MAREVO push notification grouping checks passed.');
