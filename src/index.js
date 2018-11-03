// @flow
/* eslint eqeqeq: "off" */
import * as React from 'react';
import { Component, sharedComponentData } from 'react-simplified';
import { HashRouter, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';
import {Line} from 'react-chartjs-2';

const dao = require('./dao/dao');
const stock = require('./data/stock');
const compare = require('./util/compare');
const line = require('./data/line');

let shared = sharedComponentData({
  stocks: [new stock.Stock('GOOG'), new stock.Stock('AAPL'), new stock.Stock('AMZN'), new stock.Stock('NFLX')]
});

class Card extends Component<{id?: string, className?: string, title?: React.Node, children?: React.Node}> {
  render() {
    return(
      <div id={this.props.id} className={"card " + this.props.className}>
        <div className="card-body">
          <h5 className="card-title">{this.props.title}</h5>
          <div className="card-text">{this.props.children}</div>
        </div>
      </div>
    )
  }
}

class Row extends Component<{id?: string, className?: string, style?: {}, children?: any}>{
  render(){
    return (
      <div id={this.props.id} className={this.props.className} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

//Main site. Path: '/'
class Dashboard extends Component {
  changeClass = 'change-positive';
  interval = null;

  render() {
    return (
      <Row className="page">
        <Navbar />
        <Row id="dashboard-main">
          <Sidebar />
          <Row id="dashboard">
            {shared.stocks.map(stock => (
              <Row key={stock.ticker} className={stock.visible ? 'article-visible' : 'article-hidden'}>
                <a href={'#/StockInfo/' + stock.ticker}>
                  <Row className="article-title">{stock.name}</Row>
                </a>
                <Row className="sector">{stock.sector}</Row>
                <Row>
                  <Row className="price">{stock.price} USD</Row>
                  <Row className={stock.changePercent > 0 ? 'change-positive' : 'change-negative'}>
                    ({stock.changePercent > 0 ? '+' : ''}
                    {Math.round(stock.changePercent * 10000) / 100}
                    %)
                  </Row>
                </Row>
                <Row className="info">Market Cap: {Math.round((stock.marketcap / 1000000000) * 1000) / 1000} B</Row>
                <Row className="info">EPS (TTM): {Math.round(stock.ttmEPS * 1000) / 1000}</Row>
                <Row className="info">PE (TTM): {Math.round((stock.price / stock.ttmEPS) * 1000) / 1000}</Row>
                <Row className="info">  Dividend: {stock.dividendRate} ({Math.round(stock.dividendYield * 1000) / 1000}%)
                </Row>
              </Row>
            ))}
          </Row>
        </Row>
      </Row>
    );
  }

  mounted() {
    var count = 0;
    this.interval = setInterval(() => {
      (shared.stocks.map(stock => stock.update(stock.ticker)));
    }, 2000);
  }

  beforeUnmount(){
    if (this.interval) clearInterval(this.interval);
  }
}

//Navbar for dashboard
class Navbar extends Component {
  render() {
    return (
      <Row id="navbar">
        <nav className="navbar navbar-dark bg-dark justify-content-between">
          <a id="navbarTitle" className="navbar-brand" href="#/">
            Stockfinder
          </a>
          <form className="form-inline">
            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
              Search
            </button>
          </form>
        </nav>
      </Row>
    );
  }
}

//Sidebar for dashboard
class Sidebar extends Component {
  ticker = '';

  render() {
    return (
      <Row id="sidebar" className="nav-side-menu">
        sidebar
        <Row id="register">
          <Row>
            <input
              id="register-input"
              type="text"
              value={this.ticker}
              onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.ticker = event.target.value)}
            />
          </Row>
          <Row>
            <button id="register-button" onClick={this.buttonClicked}>
              Register
            </button>
          </Row>
        </Row>
      </Row>
    );
  }

  async buttonClicked() {
    if ((await dao.getStockInfo(this.ticker, 'price')) !== 404) {
      shared.stocks.push(new stock.Stock(this.ticker));
    }
  }
}

//Shows all information for a specific stock. Path = '/StockInfo'
class StockInfo extends Component<{ update: boolean, match: { params: { ticker: string } } }> {
  stock = null;
  loaded = false;
  interval = null;

  //shouldComponentUpdate(nextProps, nextState) {
  //  return compare.shallowCompare(this, nextProps, nextState);
  //}

  render() {
      return (
        this.loaded ? (
          <Row className="page">
            <Navbar />
            <Row id="main-stockinfo">
              <Row id='stockinfo-price'>
                <Row>
                  <h1 id="stockinfo-title">{this.stock.name}</h1>
                  <h2 id='stockinfo-market'>{this.stock.market}</h2>
                </Row>
                <Row>
                  <Row className='stockinfo-change left'>{this.stock.price} USD</Row>
                  <Row className={(this.stock.changePercent > 0 ? 'change-positive' : 'change-negative') + ' stockinfo-change'} >
                    ({this.stock.changePercent > 0 ? '+' : ''}
                    {Math.round(this.stock.changePercent * 10000) / 100}
                    %)
                </Row>
                </Row>
              </Row>
              <Row className='h-100 w-100'>
              <Card id='graph'>
              <div className='btn-group d-flex' role='group'>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1d')}>1 Day</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1m')}>1 Month</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('6m')}>6 Months</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('ytd')}>YTD</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('1y')}>1 Year</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('2y')}>2 Years</button>
              <button type="button" className="btn btn-secondary w-100" onClick={() => this.changeGraph('5y')}>5 Years</button>
              </div>
              <Line data={line.data(this.stock.chart)} />
              </Card>
                <Card id='basic-info' title='Essentials'>
                <Row className="info">Market Cap: {Math.round((this.stock.marketcap / 1000000000) * 1000) / 1000} B</Row>
                <Row className="info">EPS (TTM): {Math.round(this.stock.ttmEPS * 1000) / 1000}</Row>
                <Row className="info">PE (TTM): {Math.round((this.stock.price / this.stock.ttmEPS) * 1000) / 1000}</Row>
                <Row className="info">  Dividend: {this.stock.dividendRate} ({Math.round(this.stock.dividendYield * 1000) / 1000}%)</Row>
                </Card>
              </Row>
            </Row>
          </Row>
        ) : (<span>Loading...</span>)
      )
  }

  changeGraph(timePeriod){
    this.stock.getChartData(timePeriod);
  }

  mounted() {
    this.stock = new stock.Stock(this.props.match.params.ticker);
    this.stock.getChartData('1d');
    this.interval = setInterval(() => {
          this.loaded = this.stock.init;
          if(this.loaded) clearInterval(this.interval);
    }, 100);
  }

  beforeUnmount(){
    if (this.interval) clearInterval(this.interval);
  }
}

const root = document.getElementById('root');

setTimeout(function() {
  if (root)
    ReactDOM.render(
      <HashRouter>
        <Row className="page">
          <Route exact path="/" component={Dashboard} />
          <Route path="/StockInfo/:ticker" component={StockInfo} />
        </Row>
      </HashRouter>,
      root
    );
}, 1000);
