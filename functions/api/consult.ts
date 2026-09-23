interface Env {
  RESEND_API_KEY?: string; CONSULT_TO?: string; CONTACT_FROM?: string; TURNSTILE_SECRET_KEY?: string; ALLOWED_ORIGINS?: string;
}
interface Submission {
  category?:string; nickname?:string; email?:string; message?:string; publishConsent?:string; adult?:string; agree?:string; 'cf-turnstile-response'?:string; website?:string;
}
const CATEGORY_LABELS:Record<string,string>={sexless:'セックスレス','libido-gap':'性欲差',boredom:'マンネリ',initiation:'誘い方・断られ方',preferences:'性的な好み・伝え方',body:'身体に関する悩み',relationship:'出会い・パートナー関係',other:'その他'};
const json=(status:number,body:Record<string,unknown>)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const MAX_REQUEST_BYTES=24000,within=(value:string,max:number)=>value.length<=max,hasNewline=(value:string)=>/[\r\n]/.test(value);
const parseSubmission=async(request:Request):Promise<Submission|null>=>{const declaredLength=Number(request.headers.get('content-length')||0);if(declaredLength>MAX_REQUEST_BYTES)return null;const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>MAX_REQUEST_BYTES)return null;const type=request.headers.get('content-type')?.toLowerCase()||'';if(!type.includes('application/x-www-form-urlencoded'))return null;const params=new URLSearchParams(raw);const data:Submission={};params.forEach((value,key)=>{(data as Record<string,string>)[key]=value;});return data;};
interface TurnstileResult{success?:boolean;action?:string}
const verifyTurnstile=async(secret:string,token:string,remoteIp:string|null)=>{const payload=new URLSearchParams({secret,response:token});if(remoteIp)payload.set('remoteip',remoteIp);const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload});if(!response.ok)return false;const result=await response.json() as TurnstileResult;return Boolean(result.success&&result.action==='consult');};
interface RequestContext{request:Request;env:Env}
export const onRequestPost=async({request,env}:RequestContext):Promise<Response>=>{
  const allowedOrigins=new Set((env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean)),origin=request.headers.get('origin');
  if(allowedOrigins.size===0)return json(503,{message:'相談フォームが一時的に利用できません'});if(!origin||!allowedOrigins.has(origin))return json(403,{message:'この送信元からは受け付けられません'});
  let data:Submission|null=null;try{data=await parseSubmission(request);}catch{}if(!data)return json(400,{message:'リクエストの形式またはサイズが不正です'});if(data.website)return json(200,{ok:true});
  const category=(data.category||'').trim(),nickname=(data.nickname||'').trim(),email=(data.email||'').trim(),message=(data.message||'').trim(),publishConsent=(data.publishConsent||'').trim(),token=(data['cf-turnstile-response']||'').trim();
  if(!CATEGORY_LABELS[category]||!message||!data.adult||!data.agree||!['yes','no'].includes(publishConsent))return json(400,{message:'必須項目を確認してください'});
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(400,{message:'メールアドレスの形式が正しくありません'});
  if(!within(nickname,50)||!within(email,254)||!within(message,5000)||hasNewline(nickname)||hasNewline(email))return json(400,{message:'入力内容が長すぎるか、形式が不正です'});
  const secret=env.TURNSTILE_SECRET_KEY?.trim();if(!secret||!token)return json(503,{message:'セキュリティ確認を利用できません'});try{if(!await verifyTurnstile(secret,token,request.headers.get('CF-Connecting-IP')))return json(400,{message:'セキュリティ確認に失敗しました'});}catch{return json(503,{message:'セキュリティ確認が一時的に利用できません'});}
  const apiKey=env.RESEND_API_KEY?.trim(),to=(env.CONSULT_TO||'').trim(),from=env.CONTACT_FROM?.trim();if(!apiKey||!to||!from)return json(503,{message:'相談フォームが一時的に利用できません'});
  const body=[`カテゴリ: ${CATEGORY_LABELS[category]}`,`ニックネーム: ${nickname||'匿名'}`,`返信用メール: ${email||'なし'}`,`匿名掲載許可: ${publishConsent==='yes'?'あり（編集・匿名化が前提）':'なし'}`,'','--- 相談内容 ---',message,'',`送信日時: ${new Date().toISOString()}`].join('\n');
  try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],...(email?{reply_to:email}:{}),subject:`【INTIMETRY匿名相談】${CATEGORY_LABELS[category]}／${nickname||'匿名'}`,text:body})});if(!response.ok)return json(500,{message:'送信処理に失敗しました'});}catch{return json(500,{message:'送信処理に失敗しました'});}
  return json(200,{ok:true});
};