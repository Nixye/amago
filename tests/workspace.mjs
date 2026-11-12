import {mkdtemp,writeFile,readFile,mkdir,readdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {Workspace}=createRequire(import.meta.url)('../desktop/workspace.cjs');
const temp=await mkdtemp(path.join(tmpdir(),'amago-workspace-test-'));
try{
 const root=path.join(temp,'project'),outside=path.join(temp,'outside');await mkdir(root);await mkdir(outside);await mkdir(path.join(root,'nested'));await mkdir(path.join(root,'.git'));
 await writeFile(path.join(root,'nested','note.md'),'# Original\n');await writeFile(path.join(root,'photo.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');await writeFile(path.join(outside,'private.md'),'Outside');
 const workspace=await Workspace.open(root),tree=await workspace.tree();assert.equal(tree.entries[0].kind,'directory');assert.equal(tree.entries.find(e=>e.name==='nested').children[0].kind,'markdown');assert.ok(!tree.entries.some(e=>e.name==='.git'));assert.equal(tree.entries.find(e=>e.name==='photo.svg').kind,'image');
 const initial=await workspace.read('nested/note.md');assert.equal(initial.body,'# Original\n');
 const saved=await workspace.save('nested/note.md','# Updated\n',initial.version);assert.ok(saved.saved);assert.equal(await readFile(path.join(root,'nested','note.md'),'utf8'),'# Updated\n');
 assert.ok((await workspace.save('nested/note.md','Stale write',initial.version)).conflict);assert.equal(await readFile(path.join(root,'nested','note.md'),'utf8'),'# Updated\n');
 const concurrent=await Promise.all([workspace.save('nested/note.md','First',saved.version),workspace.save('nested/note.md','Second',saved.version)]);assert.ok(concurrent[0].saved);assert.ok(concurrent[1].conflict);assert.equal(await readFile(path.join(root,'nested','note.md'),'utf8'),'First');assert.ok(!(await readdir(path.join(root,'nested'))).some(n=>n.startsWith('.amago-write-')));
 for(const unsafe of ['../outside/private.md',path.join(outside,'private.md'),'nested/note.md:stream'])await assert.rejects(workspace.read(unsafe));
 await assert.rejects(workspace.save('photo.svg','oops',''));await workspace.create('nested/new.md','markdown');await assert.rejects(workspace.create('nested/note.md','markdown'));assert.equal(await readFile(path.join(root,'nested','note.md'),'utf8'),'First');
 await writeFile(path.join(root,'invalid.md'),Buffer.from([0xff,0xfe,0x61]));await assert.rejects(workspace.read('invalid.md'));
 await symlink(outside,path.join(root,'escape'),process.platform==='win32'?'junction':'dir');await assert.rejects(workspace.read('escape/private.md'));assert.ok(!(await workspace.tree()).entries.some(e=>e.name==='escape'));
 assert.ok((await workspace.image('photo.svg')).url.startsWith('data:image/svg+xml;base64,'));
 console.log('Workspace: nested tree, UTF-8, atomic save, conflict retention, concurrent writes, exclusive creation, image preview and path/junction boundaries passed.');
}finally{if(path.dirname(temp)!==path.resolve(tmpdir())||!path.basename(temp).startsWith('amago-workspace-test-'))throw Error('Unexpected cleanup path');await rm(temp,{recursive:true,force:true})}
