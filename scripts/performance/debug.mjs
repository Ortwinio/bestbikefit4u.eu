import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch({headless:true});
try {
 const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>errors.push(`${request.url()}: ${request.failure()?.errorText}`));
 await page.goto('https://localhost:3197/en',{waitUntil:'networkidle'});
 await page.screenshot({path:'/private/tmp/s10-debug.png'});
 await writeFile('/private/tmp/s10-debug.json',JSON.stringify({errors,url:page.url(),text:await page.locator('body').innerText(),
 paint:await page.evaluate(()=>performance.getEntriesByType('paint').map(e=>e.toJSON()))},null,2));
}finally{await browser.close();}
