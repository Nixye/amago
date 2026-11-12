(function(root){
  function tagPage(documents,query='',page=0,size=12){
    const counts=new Map();
    for(const doc of documents)for(const tag of new Set(root.AmagoSearch.documentData(doc).tags))counts.set(tag,(counts.get(tag)||0)+1);
    const all=[...counts].filter(([tag])=>root.AmagoSearch.normalize(tag).includes(root.AmagoSearch.normalize(query))).sort((a,b)=>a[0].localeCompare(b[0]));
    const pages=Math.max(1,Math.ceil(all.length/size)),current=Math.min(pages-1,Math.max(0,page));
    return {items:all.slice(current*size,(current+1)*size),total:all.length,page:current,pages};
  }
  async function saveDraft(file,adapter){
    if(file.saving){await file.saving;return saveDraft(file,adapter)}
    if(!file.dirty)return {saved:true};
    const body=file.body,version=file.version;
    file.saving=Promise.resolve().then(()=>adapter.save(file.path,body,version)).catch(error=>({error:error.message}));
    const result=await file.saving;file.saving=null;
    if(result.error||result.conflict){file.conflict=!!result.conflict;file.error=result.error||'O arquivo mudou no disco.';return result}
    file.version=result.version;file.savedBody=body;file.dirty=file.body!==body;file.conflict=false;file.error=null;
    return file.dirty?saveDraft(file,adapter):result;
  }
  root.AmagoEditing={tagPage,saveDraft};
})(globalThis);
