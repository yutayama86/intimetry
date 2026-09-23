interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
}
interface Submission {
  topic?: string; name?: string; email?: string; message?: string; agree?: string; website?: string; 'cf-turnstile-response'?: string;
}
const TOPIC_LABELS: Record<string,string> = { service:'サービス・機能について', media:'取材・メディア', business:'広告・事業提携', privacy:'プライバシー・データ', other:'その他' };
const json=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
const MAX_REQUEST_BYTES=24000;
const within=(value:string,max:number)=>value.length<=max;
const hasNewline=(value:string)=>/[\r\n]/.test(value);
interface TurnstileResult { success?:boolean; action?:string }
const verifyTurnstile=async(secret:string,token:string,remoteIp:string|null)=>{const payload=new URLSearchParams({secret,response:token});if(remoteIp)payload.set('remoteip',remoteIp);const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload});if(!response.ok)return false;const result=await response.json() as TurnstileResult;return Boolean(result.success&&result.action==='contact');};
const parseSubmission=async(request:Request):Promise<Submission|null>=>{const declaredLength=Number(request.headers.get('content-length')||0);if(declaredLength>MAX_REQUEST_BYTES)return null;const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>MAX_REQUEST_BYTES)return null;const type=request.headers.get('content-type')?.toLowerCase()||'';if(!type.includes('application/x-www-form-urlencoded'))return null;const params=new URLSearchParams(raw);const data:Submission={};params.forEach((value,key)=>{(data as Record<string,string>)[key]=value;});return data;};
interface RequestContext { request:Request; env:Env }
export const onRequestPost=async({request,env}:RequestContext):Promise<Response>=>{
  const allowedOrigins=new Set((env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean));const origin=request.headers.get('origin');
  if(allowedOrigins.size===0)return json(503,{message:'フォームが一時的に利用できません'});
  if(!origin||!allowedOrigins.has(origin))return json(403,{message:'この送信元からは受け付けられません'});
  let data:Submission|null;try{data=await parseSubmission(request);}catch{data=null;}if(!data)return json(400,{message:'リクエストの形式またはサイズが不正です'});if(data.website)return json(200,{ok:true});
  const topic=(data.topic||'').trim(),name=(data.name||'').trim(),email=(data.email||'').trim(),message=(data.message||'').trim(),token=(data['cf-turnstile-response']||'').trim();
  if(!TOPIC_LABELS[topic]||!name||!email||!message||!data.agree)return json(400,{message:'必須項目を確認してください'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(400,{message:'メールアドレスの形式が正しくありません'});
  if(!within(name,100)||!within(email,254)||!within(message,5000)||hasNewline(name)||hasNewline(email))return json(400,{message:'入力内容が長すぎるか、形式が不正です'});
  const secret=env.TURNSTILE_SECRET_KEY?.trim();if(!secret||!token)return json(503,{message:'セキュリティ確認を利用できません'});
  try{if(!await verifyTurnstile(secret,token,request.headers.get('CF-Connecting-IP')))return json(400,{message:'セキュリティ確認に失敗しました'});}catch{return json(503,{message:'セキュリティ確認が一時的に利用できません'});}
  const apiKey=env.RESEND_API_KEY?.trim(),to=env.CONTACT_TO?.trim(),from=env.CONTACT_FROM?.trim();if(!apiKey||!to||!from)return json(503,{message:'フォームが一時的に利用できません'});
  const text=[`種別: ${TOPIC_LABELS[topic]}`,`お名前: ${name}`,`メール: ${email}`,'',message,'',`送信日時: ${new Date().toISOString()}`].join('\n');
  try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`【INTIMETRY】${TOPIC_LABELS[topic]}／${name}様`,text})});if(!response.ok)return json(500,{message:'送信処理に失敗しました'});}catch{return json(500,{message:'送信処理に失敗しました'});}
  return json(200,{ok:true});
};