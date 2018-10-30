// @flow
/* eslint eqeqeq: "off" */
import * as React from 'react';
import { Component } from 'react-simplified';
import { HashRouter, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';
import {Line} from 'react-chartjs-2';

const dao = require('./dao/dao');
const stock = require('./data/stock');
const line = require('./data/line');

let stocks = [new stock.Stock('GOOG'), new stock.Stock('AAPL'), new stock.Stock('AMZN'), new stock.Stock('NFLX')];

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
            {stocks.map(stock => (
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
    this.interval = setInterval(() => {
      (stocks.map(stock => stock.update(stock.ticker)));
      this.forceUpdate();
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
      stocks.push(new stock.Stock(this.ticker));
    }
  }
}

//Shows all information for a specific stock. Path = '/StockInfo'
class StockInfo extends Component<{ update: boolean, match: { params: { ticker: string } } }> {
  stock = new stock.Stock(this.props.match.params.ticker);
  interval = null;

  shallowEqual(objA: mixed, objB: mixed): boolean {
    if (objA === objB) {
      return true;
    }

    if (typeof objA !== 'object' || objA === null ||
        typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) {
      return false;
    }

    // Test for A's keys different from B.
    var bHasOwnProperty = hasOwnProperty.bind(objB);
    for (var i = 0; i < keysA.length; i++) {
      if (!bHasOwnProperty(keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
        return false;
      }
    }

    return true;
  }

  shallowCompare(instance, nextProps, nextState) {
    return (
      !this.shallowEqual(instance.props, nextProps) ||
      !this.shallowEqual(instance.state, nextState)
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.shallowCompare(this, nextProps, nextState);
  }

  async updateChart() {
    await this.stock.getChartData('1d');
  }

  render() {
    this.updateChart();
    return (
      <Row className="page">
        <Navbar />
        <Row id="main-stockinfo">
          <Row style={{height: '50px'}}>
            <Row>
              <h1 id="stockinfo-title">
                {this.stock.name}
              </h1>
            </Row>
            <Row className='stockinfo-change left'>{this.stock.price} USD</Row>
            <Row className={(this.stock.changePercent > 0 ? 'change-positive' : 'change-negative') + ' stockinfo-change'} >
              ({this.stock.changePercent > 0 ? '+' : ''}
              {Math.round(this.stock.changePercent * 10000) / 100}
              %)
            </Row>
          </Row>
          <Row>
            <Line data={line.data(this.stock.chart)} />
          </Row>
        </Row>
      </Row>
    );
  }

  mounted() {
    this.interval = setInterval(() => {
      this.stock.update(stock.ticker);
      this.forceUpdate();
    }, 5000);
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
