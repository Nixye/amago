// The renderer can request a check, never choose the API host or an external URL.
const repository='Nixye/amago';
const releasesUrl=`https://github.com/${repository}/releases/latest`;
function parseVersion(value){const m=String(value).match(/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\w.-]+))?(?:\+[\w.-]+)?$/);return m?{numbers:m.slice(1,4).map(Number),pre:m[4]?.split('.')||[]}:null}
function compareVersions(a,b){a=parseVersion(a);b=parseVersion(b);if(!a||!b)throw Error('Versão inválida.');for(let i=0;i<3;i++)if(a.numbers[i]!==b.numbers[i])return Math.sign(a.numbers[i]-b.numbers[i]);if(!a.pre.length||!b.pre.length)return Math.sign(b.pre.length-a.pre.length);for(let i=0;i<Math.max(a.pre.length,b.pre.length);i++){const x=a.pre[i],y=b.pre[i];if(x===undefined)return -1;if(y===undefined)return 1;if(x===y)continue;const nx=/^\d+$/.test(x),ny=/^\d+$/.test(y);return nx&&ny?Math.sign(Number(x)-Number(y)):nx?-1:ny?1:x>y?1:-1}return 0}
async function checkRelease(currentVersion,token='',request=fetch){
 if(typeof token!=='string'||token.length>512||/[\r\n]/.test(token))return {status:'error',message:'Token inválido.'};
 token=token.trim();
 try{
  const response=await request(`https://api.github.com/repos/${repository}/releases/latest`,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','User-Agent':'Amago-Update-Check',...(token?{Authorization:'Bearer '+token}:{})},signal:AbortSignal.timeout(15000),redirect:'error'});
  if(response.status===401)return {status:'auth',message:'O GitHub recusou o token. Confira a validade e o acesso ao repositório Nixye/amago.'};
  if(response.status===404)return {status:'auth',message:'A release não está acessível. O repositório pode ser privado ou ainda não ter uma release publicada. Use um token com acesso de leitura ou abra o GitHub no navegador.'};
  if(response.status===403||response.status===429)return {status:'error',message:'O GitHub limitou a consulta ou negou o acesso. Confira as permissões e tente novamente mais tarde.'};
  if(!response.ok)return {status:'error',message:'O GitHub não respondeu à consulta. Tente novamente mais tarde.'};
  const release=await response.json(),parsed=parseVersion(release.tag_name);
  if(release.draft||release.prerelease||!parsed||parsed.pre.length)return {status:'error',message:'A release encontrada não é uma versão estável reconhecida.'};
  const version=parsed.numbers.join('.'),tag=release.tag_name,url=`https://github.com/${repository}/releases/tag/${encodeURIComponent(tag)}`;
  const assets={};for(const [kind,label] of [['setup','Setup'],['portable','Portable']]){const name=`Amago-${version}-${label}-x64.exe`,expected=`https://github.com/${repository}/releases/download/${encodeURIComponent(tag)}/${name}`,asset=release.assets?.find(a=>a.name===name&&a.state==='uploaded'&&a.size>0&&a.browser_download_url===expected);if(asset)assets[kind]={name,url:expected,size:asset.size}}
  const order=compareVersions(version,currentVersion);
  return {status:order>0?'available':order<0?'ahead':'current',version,url,assets,notes:String(release.body||'').slice(0,12000),publishedAt:release.published_at||null,checkedAt:new Date().toISOString()};
 }catch{return {status:'error',message:'Não foi possível consultar o GitHub. Verifique a conexão e tente novamente.'}}
}
module.exports={repository,releasesUrl,compareVersions,checkRelease};
