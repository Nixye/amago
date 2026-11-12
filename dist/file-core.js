/* Shared file policy for browser and desktop. Text is displayed, never executed. */
(function(root){
 const markdown=/\.(md|markdown)$/i,image=/\.(png|jpe?g|gif|webp|bmp|svg|avif|ico)$/i;
 const text=/\.(txt|json|jsonc|csv|tsv|log|yaml|yml|toml|xml|ini|cfg|conf|env|html?|css|scss|less|js|mjs|cjs|jsx|ts|tsx|py|rb|rs|go|java|c|h|cpp|hpp|cs|sql|sh|bat|ps1|tex|rst|adoc|properties|gitignore|editorconfig)$/i;
 const kind=name=>markdown.test(name)?'markdown':image.test(name)?'image':text.test(name)||/^(readme|license|dockerfile|makefile|\.gitignore|\.env|\.editorconfig)$/i.test(name.split(/[\\/]/).at(-1))?'text':'file';
 const editable=file=>['markdown','text'].includes(typeof file==='string'?kind(file):file?.kind);
 const ignored=name=>['.git','.obsidian','.amago','node_modules','.svn','.hg'].includes(name)||name.startsWith('.amago-write-');
 const api={kind,editable,ignored};root.AmagoFiles=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
