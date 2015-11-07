# erlenmeyer_stock_ionic

A mobile front end for steph's stock system

# Cross domain api config
* add proxies to ionic.project:
```
"proxies": [
    {
      "path": "/api",
      "proxyUrl": "http://stock.erlenmeyer.com.au/server/api"
    }
  ]
```