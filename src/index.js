// @flow
/* eslint eqeqeq: "off" */
import * as React from 'react';
import { Component, sharedComponentData } from 'react-simplified';
import { HashRouter, Route, Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { Line } from 'react-chartjs-2';
import { Progress } from 'react-sweet-progress';
import "react-sweet-progress/lib/style.css";

//import createHashHistory from 'history/createHashHistory';
//const history = createHashHistory(); // Use history.push(...) to programmatically change path
const dao = require('./dao/dao');
const stock = require('./data/stock');
//const compare = require('./util/compare');
const line = require('./data/line');

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

let symbols = [];
let loaded = false;

let shared = sharedComponentData({
  stocks: []
});

async function initialize(){
  symbols = await dao.getSymbols();
  loaded = true;
  console.log('Initialized');
}

initialize();

//Navbar used on all routes
class Navbar extends Component {
  input = '';

  render() {
    return (
      <div id="navbar">
        <nav className="navbar navbar-default bg-dark justify-content-between">
          <a id="navbarTitle" className="navbar-brand" href="/">
          Stockfinder
          </a>
          <form className="form-inline" style={{color: 'white', fontSize:'18px'}}>
            <input className="form-control mr-sm-2" type="search" placeholder="Ticker / Name" aria-label="Search"
            value={this.input} onChange={(e) => {this.input = e.target.value}}/>
            <Link to={'/' + this.input}>
            <button className="btn btn-outline-primary my-2 my-sm-0" type="submit" onClick={() => this.search()}>
              Search
            </button>
            </Link>
          </form>
        </nav>
      </div>
    );
  }

  search(){
      console.log(this.amountArticles);
      shared.Stocks = [];
      updateDashboard = false;
      window.location.reload();
  }
}

//Reusable cards with optional title
class Card extends Component<{ id?: string, className?: string, title?: React.Node, children?: React.Node }> {
  render() {
    return (
      <div id={this.props.id} className={'card ' + this.props.className}>
        <div className="card-body">
          <h5 className="card-title">{this.props.title}</h5>
          <div className="card-text">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

//Sidebar for dashboard
class Sidebar extends Component {
  render() {
    return (
      <div id="sidebar" className="nav-side-menu">
      </div>
    );
  }

  async buttonClicked() {
    if ((await dao.getStockInfo(this.ticker, 'price')) !== 404) {
      shared.stocks.push(new stock.Stock(this.ticker));
    }
  }
}

//Main site. Exact path: '/'. To make a search: Exact path: '/:key'
let updateDashboard = true;
let articles = [];
let amountShowingCap = 50;
let amountShowing = 0;
class Dashboard extends Component<{ match: { params: { key: string } } }> {

  changeClass = 'change-positive';
  interval = null;
  search = '';

  shouldComponentUpdate(nextProps, nextState) {
    return updateDashboard;
  }

  render() {
    return (
      <div className="page">
        <Navbar />
        <div id="dashboard-main">
          <Sidebar />
          <Articles />
        </div>
      </div>
    );
  }

  addArticles(){
    if(amountShowing < amountShowingCap){
      while((amountShowing < amountShowingCap) && (amountShowing < articles.length)){
        shared.stocks.push(new stock.Stock(articles[amountShowing]));
        amountShowing++;
      }
    }
    let dashboardLoader = setInterval(function(){
      if(shared.stocks.length > 0){
        if(shared.stocks[(shared.stocks.length - 1)].init){
          updateArticles = true;
          clearInterval(dashboardLoader);
        }
      }else{
        updateArticles = true;
      }
    }, 100);
  }

  mounted() {
    updateDashboard = true;
    if(this.props.match.params.key != null){
      this.search = this.props.match.params.key;
    }

    let regExp = new RegExp(this.search, 'i');
    symbols.forEach(symbol => {
      if(symbol['symbol'].match(regExp) != null || symbol['name'].match(regExp) != null){
        articles.push(symbol['symbol']);
      }
    });

    this.addArticles();

    this.interval = setInterval(() => {
      shared.stocks.map(stock => stock.update(stock.ticker));
      this.forceUpdate();
    }, 3000);
  }

  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  }
}

//Articles for dashboard main content
let updateArticles = false;
class Articles extends Component {

  /*shouldComponentUpdate(nextProps, nextState) {
    return updateArticles;
  }*/

  render() {
    return updateArticles ? (
      <div id='max-size'>
        {shared.stocks.map(stock => (
          <a key={stock.ticker} href={'#/StockInfo/' + stock.ticker}>
          <div key={stock.ticker} className={stock.visible ? 'article-visible' : 'article-hidden'}>
            <div className="article-title">{stock.name + ' (' + stock.ticker + ')'}</div>
            <div className="sector">{stock.sector}</div>
            <div>
              <div className="price">{stock.price} USD</div>
              <div className={stock.changePercent > 0 ? 'change-positive' : 'change-negative'}>
                ({stock.changePercent > 0 ? '+' : ''}
                {Math.round(stock.changePercent * 10000) / 100}
                %)
              </div>
                <Progress
                  percent={88}
                  status="default"
                  theme={{
                  default: {
                    symbol: '❤️',
                  }
                }}
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    ) : (
      <span style={{fontSize: '30px', color: 'white', marginLeft: '10px'}}>Searching...</span>
      );
  }
}

//Shows all information for a specific stock. Path = '/StockInfo'
class StockInfo extends Component<{ update: boolean, match: { params: { ticker: string } } }> {
  stock: stock.Stock = null;
  loaded = false;
  interval = null;

  //shouldComponentUpdate(nextProps, nextState) {
  //  return compare.shallowCompare(this, nextProps, nextState);
  //}

  render() {
    return this.loaded ? (
      <div className="page">
        <Navbar />
        <div id="main-stockinfo">
          <div id="stockinfo-price">
            <div>
              <h1 id="stockinfo-title">{this.stock.name}</h1>
              <h2 id="stockinfo-market">{this.stock.market}</h2>
            </div>
            <div>
              <div className="stockinfo-change left">{this.stock.price} USD</div>
              <div
                className={(this.stock.changePercent > 0 ? 'change-positive' : 'change-negative') + ' stockinfo-change'}
              >
                ({this.stock.changePercent > 0 ? '+' : ''}
                {Math.round(this.stock.changePercent * 10000) / 100}
                %)
              </div>
            </div>
          </div>
          <div className="h-100 w-100">
            <Card id="graph">
              <div className="btn-group d-flex" role="group">
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1d')}>
                  1 Day
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1m')}>
                  1 Month
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('6m')}>
                  6 Months
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('ytd')}>
                  YTD
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1y')}>
                  1 Year
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('2y')}>
                  2 Years
                </button>
                <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('5y')}>
                  5 Years
                </button>
              </div>
              <Line data={line.data(this.stock.chart)} />
            </Card>
            <Card id="essentials" title="Essentials">
              <div className="info">Market Cap: {Math.round((this.stock.marketcap / 1000000000) * 1000) / 1000} B</div>
              <div className="info">EPS (TTM): {Math.round(this.stock.ttmEPS * 1000) / 1000}</div>
              <div className="info">PE (TTM): {this.stock.peRatio}</div>
              <div className="info">
                {' '}
                Dividend: {this.stock.dividendRate} ({Math.round(this.stock.dividendYield * 1000) / 1000}
                %)
              </div>
              <div className="info">YearAgoChangePercent : {this.stock.yearAgoChangePercent}</div>
              <div className="info">
                PEG (not working): {Math.round((this.stock.peRatio * 100) / this.stock.yearAgoChangePercent) / 1000}
              </div>
            </Card>
          </div>
        </div>
      </div>
    ) : (
      <span>Loading...</span>
    );
  }

  changeGraph(timePeriod) {
    this.stock.getChartData(timePeriod);
  }

  mounted() {
    this.stock = new stock.Stock(this.props.match.params.ticker);
    this.stock.getChartData('1d');
    this.interval = setInterval(() => {
      this.loaded = this.stock.init;
      if (this.loaded) clearInterval(this.interval);
    }, 100);
  }

  beforeUnmount() {
    if (this.interval) clearInterval(this.interval);
  }
}

const root = document.getElementById('root');

var loader = setInterval(function(){
  if(loaded){
    rootRender();
    clearInterval(loader);
  }
}, 100);

function rootRender(){
  if (root){
    ReactDOM.render(
      <HashRouter>
        <div className="page">
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/:key" component={Dashboard} />
          <Route path="/StockInfo/:ticker" component={StockInfo} />
        </div>
      </HashRouter>,
      root
    );
  }
}
