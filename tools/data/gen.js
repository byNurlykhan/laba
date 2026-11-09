// Тізімді (sheet.json) Code.gs логикасымен оқып, сайтқа арналған статикалық JSON файлдарын жазады.
// Қолданылуы: node tools/data/gen.js <sheet.json> data
const fs=require('fs'), path=require('path');
const [,, sheetJson, out] = process.argv;
const code=fs.readFileSync(path.join(__dirname,'..','..','apps-script','Code.gs'),'utf8');
const V=JSON.parse(fs.readFileSync(sheetJson,'utf8'));
const range=(r,c,nr,nc)=>({getDisplayValues:()=>V.slice(r-1,r-1+nr).map(row=>row.slice(c-1,c-1+nc))});
const sheet={getName:()=>'Тізім',getLastRow:()=>V.length,getLastColumn:()=>V[0].length,getRange:range};
global.SpreadsheetApp={getActive:()=>({getSheetByName:n=>n==='Тізім'?sheet:null})};
global.CacheService={getScriptCache:()=>({get:()=>null,getAll:()=>({}),put(){},putAll(){},remove(){},removeAll(){}})};
eval(code);
const all = getPassports_();
const idx = passportIndex_();
fs.mkdirSync(path.join(out,'passports'),{recursive:true});
fs.writeFileSync(path.join(out,'passports-index.json'), JSON.stringify(idx));
const chunks={};
all.forEach(x=>{ const k=Math.floor(Number(x.id)/200); (chunks[k]=chunks[k]||{})[x.id]=x; });
Object.keys(chunks).forEach(k=>fs.writeFileSync(path.join(out,'passports',k+'.json'), JSON.stringify(chunks[k])));
console.log('libs',all.length,'index rows',idx.rows.length,'chunks',Object.keys(chunks).length, 'non-numeric ids', all.filter(x=>!/^\d+$/.test(x.id)).length);
