import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { createHash } from "node:crypto";

const root=process.cwd();
const audit=resolve(root,"plans/seo-semrush/audit");
const renders=resolve(root,"plans/seo-semrush/renders");
const before=JSON.parse(await readFile(resolve(audit,"S15-visual-before.json"),"utf8"));
const after=JSON.parse(await readFile(resolve(audit,"S15-visual-after.json"),"utf8"));
if(before.results.length!==68||after.results.length!==84)throw new Error("Both complete captures are required: 68 BEFORE, 84 AFTER");
const checkpoint=JSON.parse(await readFile(resolve(audit,"S15-visual-preS16.json"),"utf8"));
const checkpointComparisons=await Promise.all(after.results.map(async current=>{
  const previous=checkpoint.results.find(row=>row.id===current.id&&row.locale===current.locale&&row.width===current.width);
  const screenshotSha256=createHash("sha256").update(await readFile(resolve(renders,current.screenshot))).digest("hex");
  return {id:current.id,locale:current.locale,width:current.width,screenshotSha256,preS16Sha256:previous?.screenshotSha256,identical:screenshotSha256===previous?.screenshotSha256,identicalMetrics:JSON.stringify(current.metrics)===JSON.stringify(previous?.metrics)};
}));
await writeFile(resolve(audit,"S15-visual-final-checkpoint.json"),JSON.stringify({preS16BuildId:checkpoint.buildId,finalBuildId:after.buildId,comparisons:checkpointComparisons},null,2)+"\n");
const comparisons=after.results.map(current=>{
  const previous=before.results.find(row=>row.id===current.id&&row.locale===current.locale&&row.width===current.width);
  const violations=current.axe?.violations??[];
  const priorViolations=previous?.axe?.violations??[];
  const existingKeys=new Set(priorViolations.map(item=>`${item.id}:${item.impact}`));
  return {id:current.id,locale:current.locale,width:current.width,before:previous?.screenshot??null,after:current.screenshot,
    comparison:previous?"Existing route":"New page; no baseline",
    beforeHeight:previous?.metrics?.height,afterHeight:current.metrics?.height,
    heightDelta:previous?.metrics&&current.metrics?current.metrics.height-previous.metrics.height:null,
    footerHeightDelta:previous?.metrics?.footer&&current.metrics?.footer?current.metrics.footer.height-previous.metrics.footer.height:null,
    status:current.status,overflow:current.metrics?.scrollWidth>current.width,errors:current.errors,consoleErrors:current.consoleErrors,brokenImages:current.metrics?.brokenImages,
    axe:violations.map(item=>({id:item.id,impact:item.impact,baseline:previous?existingKeys.has(`${item.id}:${item.impact}`):null})),
    originalSections:previous?.metrics?.sections.length,finalSections:current.metrics?.sections.length,
  };
});
await writeFile(resolve(audit,"S15-visual-comparison.json"),JSON.stringify({beforeBuildId:before.buildId,afterBuildId:after.buildId,comparisons},null,2)+"\n");
const ids=[...new Set(after.results.map(row=>row.id))];
for(let offset=0;offset<ids.length;offset+=3){
  const selected=after.results.filter(row=>ids.slice(offset,offset+3).includes(row.id));
  const tiles=[];
  for(const [index,row] of selected.entries()){
    const column=index%4;
    const line=Math.floor(index/4);
    const label=`${row.id} ${row.locale} ${row.width}`;
    const title=Buffer.from(`<svg width="360" height="36"><rect width="360" height="36" fill="white"/><text x="10" y="24" font-size="18" fill="black">${label}</text></svg>`);
    const image=await sharp(resolve(renders,row.screenshot)).resize({width:360}).toBuffer();
    const metadata=await sharp(image).metadata();
    const crop=await sharp(image).extract({left:0,top:0,width:360,height:Math.min(600,metadata.height)}).toBuffer();
    tiles.push({input:title,left:column*360,top:line*636},{input:crop,left:column*360,top:line*636+36});
  }
  await sharp({create:{width:1440,height:Math.ceil(selected.length/4)*636,channels:3,background:"#ffffff"}}).composite(tiles).png().toFile(resolve(renders,`S15-contact-sheet-${offset/3+1}.png`));
}
const report=["# S15 visual comparison","",`AFTER: ${after.results.length} captures. BEFORE: ${before.results.length} captures; ${before.skipped.length} new-page cases intentionally have no baseline.`,"",
  "| Template | Locale | Width | Before height | After height | Delta | Footer delta |",
  "|---|---|---:|---:|---:|---:|---:|",
  ...comparisons.map(row=>`| ${row.id} | ${row.locale} | ${row.width} | ${row.beforeHeight??"new"} | ${row.afterHeight} | ${row.heightDelta??"—"} | ${row.footerHeightDelta??"—"} |`),"",
  "## Automated findings","",
  `Runtime/console errors: ${after.results.reduce((total,row)=>total+row.errors.length+row.consoleErrors.length,0)}.`,
  `Overflow cases: ${comparisons.filter(row=>row.overflow).length}.`,
  `Broken image cases: ${comparisons.filter(row=>row.brokenImages?.length).length}.`,
  `Serious/critical axe cases: ${after.results.filter(row=>row.axe?.violations.some(item=>["serious","critical"].includes(item.impact))).length}.`,
  "",
  `All axe violation cases: ${after.results.filter(row=>row.axe?.violations.length).length}. The pre-S16 landmark-unique finding is retained in the baseline and pre-S16 checkpoint, not assumed present in the final artifact. This is not a claim of complete accessibility conformance.`,
  `Pre-S16 screenshot SHA-256 matches: ${checkpointComparisons.filter(row=>row.identical).length}/84. See S15-visual-final-checkpoint.json for per-case hashes and metric equality.`,"",
];
await writeFile(resolve(audit,"S15-visual-comparison.md"),report.join("\n"));
const files=[...(await readdir(audit)).filter(name=>name.startsWith("S15-visual")).map(name=>`plans/seo-semrush/audit/${name}`),
  ...(await readdir(renders)).filter(name=>name.startsWith("S15-")).map(name=>`plans/seo-semrush/renders/${name}`)];
await writeFile(resolve(audit,"S15-visual-manifest.txt"),[...new Set([...files,"plans/seo-semrush/audit/S15-visual-manifest.txt"])].sort().join("\n")+"\n");
console.log(JSON.stringify({before:before.results.length,after:after.results.length,new:before.skipped.length,files:files.length,sheets:Math.ceil(ids.length/3)}));
