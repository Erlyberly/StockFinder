// @flow
/* eslint eqeqeq: "off" */
import * as React from 'react';
import { Component } from 'react-simplified';
import { HashRouter, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';

const dao = require('./dao/dao');
//dao.getKeyStats('AAPL');

class Company {
  ticker: string;

  stats;
  quote;

  name;
  sector; //another call
  price;
  change;

  constructor(ticker: string) {
    this.ticker = ticker;
    this.init(ticker);
  }

  async init(ticker){
    this.stats = await dao.getStockInfo(ticker, "stats");
    this.quote = await dao.getStockInfo(ticker, "quote");
    this.name = this.stats["companyName"];
    this.price = this.quote["latestPrice"];
    this.change = this.quote["change"];

    setInterval(() => {
      this.getRealTime(ticker)
    }, 1000);
  }

  async getRealTime(ticker){
    this.stats = await dao.getStockInfo(ticker, "stats");
    this.quote = await dao.getStockInfo(ticker, "quote");
    this.price = this.quote["latestPrice"];
    this.change = this.quote["change"];
  }

}

let companies = [
  new Company('FB'),
  new Company('AAPL'),
  new Company('AMZN'),
  new Company('NFLX'),
  new Company('GOOGL')
];

class Dashboard extends Component {

  render() {
    return (
      <div>
        {companies.map(company => (
          <div key={company.ticker} className="article">
            <div className="articleTitle">{company.name}</div>
            <div className="price">{company.price} USD ({company.change})</div>
          </div>
        ))}
      </div>
    );
  }

  mounted() {
    setInterval(() => {
      this.forceUpdate();
    }, 1000);
  }

}

class Navbar extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-dark bg-dark justify-content-between">
          <a id="navbarTitle" className="navbar-brand" href="/">
            Stockfinder
          </a>
          <form className="form-inline">
            <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
              Search
            </button>
          </form>
        </nav>
      </div>
    );
  }
}

class Sidebar extends Component {
  render() {
    return <div />;
  }
}

const root = document.getElementById('root');

setTimeout(function(){
  if (root)
    ReactDOM.render(
      <HashRouter>
        <div>
          <Navbar />
          <Sidebar />
          <div>
            <Route path="/" component={Dashboard} />
          </div>
        </div>
      </HashRouter>,
      root
    );
}, 1000);
