const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
require('dotenv')['config']();

const getSinglePageData = async(page,url) => {
	await page.goto(url);
	const html= await page.content();
	const _ = await cheerio.load(html);
	const scrapedList = _('p.result-info').map((index,element) => {
	let jobTitle = _(element).find('.result-title');
	let jobDesc = _(jobTitle).text();
	let jobUrl = _(jobTitle).attr('href');
	let dateItem = _(element).find('.result-date');	
	let jobDate = new Date(_(dateItem).attr('datetime'));
	let getNeighborhood = _(element).find('.result-hood');
	let jobNeighborhood = _(getNeighborhood)
			.text()
			.trim()
			.replace(/[()]/g,'');
	return{
		jobDesc,
		jobDate,
		jobNeighborhood,
		jobUrl
	}	
	}).get();
	return scrapedList;
};

const sleep = (action,time) => {
	setTimeout(async() => {
		await action
	},time);
}

const getMultiPageData = async(scrapedList,page) => {
	for(let i = 0; i < scrapedList['length']; i++){
		sleep(await page.goto(scrapedList[i]['jobUrl']),3000);
		const html = await page.content();
		const _ = await cheerio.load(html);
		const jobTitle =  _('#titletextonly').text();
		scrapedList[i]['jobTitle'] = jobTitle;
		const jobInfo = _('#postingbody').text();
		scrapedList[i]['jobInfo'] = jobInfo;
		const jobPayment = _('p.attrgroup > span:nth-child(1) > b').text();
		scrapedList[i]['jobPayment'] = jobPayment;
		console.log(scrapedList[i]['jobPayment']);
	}
	return scrapedList;
}

const main = async() => {
	const browser = await puppeteer.launch({
		headless: false
	}); 
	const page = await browser.newPage();
	const scrapedList = await getSinglePageData(page,process.env.WEB_URL);
	const scrapedMultiPageList = await getMultiPageData(scrapedList,page);
	console.log(scrapedMultiPageList);
};

main();
