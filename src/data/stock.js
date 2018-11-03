const dao = require('../dao/dao');

export class Stock {
  ticker = "";
  init = false;
  visible: boolean;

  stats;
  quote;
  chart;

  name;
  price;
  change;
  changePercent;
  sector;
  market;
  marketcap;
  eps;
  ttmEPS;
  sharesOutstanding;
  dividendRate;
  dividendYield;

  constructor(ticker: string) {
    this.visible = true;
    this.ticker = ticker;
    this.initialize(ticker);
  }

  async initialize(ticker) {
    this.stats = await dao.getStockInfo(ticker, 'stats');
    this.quote = await dao.getStockInfo(ticker, 'quote');

    this.name = this.stats['companyName'];
    this.price = this.quote['latestPrice'];
    this.change = this.quote['change'];
    this.changePercent = this.quote['changePercent'];
    this.sector = this.quote['sector'];
    this.market = this.quote['primaryExchange'];
    this.marketcap = this.stats['marketcap'];
    this.ttmEPS = this.stats['ttmEPS'];
    this.eps = this.stats['latestEPS'];
    this.sharesOutstanding = this.stats['sharesOutstanding'];
    this.dividendRate = this.stats['dividendRate'];
    this.dividendYield = this.stats['dividendYield'];

    this.init = true;
  }

  async update() {
    var statsPromise = await dao.getStockInfo(this.ticker, 'stats');
    var quotePromise = await dao.getStockInfo(this.ticker, 'quote');
    this.internalUpdate(statsPromise, quotePromise);
    return [statsPromise, quotePromise];
  }

  async internalUpdate(statsPromise, quotePromise){

    this.stats = statsPromise;
    this.quote = quotePromise;

    this.price = this.quote['latestPrice'];
    this.change = this.quote['change'];
    this.changePercent = this.quote['changePercent'];
    this.sector = this.quote['sector'];
    this.market = this.quote['primaryExchange'];
    this.marketcap = this.stats['marketcap'];
    this.ttmEPS = this.stats['ttmEPS'];
    this.eps = this.stats['latestEPS'];
    this.sharesOutstanding = this.stats['sharesOutstanding'];
    this.dividendRate = this.stats['dividendRate'];
    this.dividendYield = this.stats['dividendYield'];
  }

  async getChartData(timePeriod){
    var proxyObject = dao.getStockInfo(this.ticker, ('chart/' + timePeriod));
    this.chart = await proxyObject;
    return this.chart;
  }

}
