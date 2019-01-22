let http = require('http');
const config = require('./config');

// create a server object:
// http
//     .createServer((req, res) => {
//         res.write('Hello World!'); // write a response to the client
//         res.end(); // end the response
//     })
//     .listen(8080); // the server object listens on port 8080

const ebay = require('ebay-api');
const { getSellers } = require('./sellers');

const sellers = getSellers();

const appId = config.getAppId();
const devId = config.getDevId();
const certId = config.getCertId();

function findHotItems(entriesPerPage = 100, pageNumber = 1) {
    ebay.xmlRequest(
        {
            serviceName: 'Finding',
            opType: 'findCompletedItems',
            appId: appId,
            params: {
                // keywords: ['CHUWI'],
                // categoryId: '26677',
                // add additional fields
                outputSelector: [
                    'AspectHistogram',
                    'SellerInfo',
                    'StoreInfo',
                    'PictureURLSuperSize'
                ],

                paginationInput: {
                    entriesPerPage: entriesPerPage,
                    pageNumber: pageNumber
                },

                itemFilter: [
                    // { name: 'SoldItemsOnly', value: true },
                    // { name: 'Condition', value: ['1000', '1500']}, // new only , "1750", "2000"
                    // { name: 'listingType', value: 'FixedPrice' },
                    // { name: 'LocatedIn', value: config.getItemFilterLocatedIn() },
                    { name: 'MinPrice', value: config.getItemFilterMinPrice() },
                    // { name: 'FeedbackScoreMin', value: config.getItemFilterFeedbackScoreMin() },
                    // { name: 'HideDuplicateItems', value: true },
                    { name: 'Seller', value: sellers }
                ],

                sortOrder: 'WatchCountDecreaseSort'
            },
            parser: ebay.parseResponseJson // (default)
        },
        (error, data) => {
            if (error) throw error;

            // console.log(JSON.stringify(data, null, 2));
            const items = data.searchResult.item;
            // console.log(items, null, 2);
            if (!items) return console.log('no items found');

            console.log('--------------- Found', items.length, 'Items', 'out of', sellers.length, 'Sellers', 'paging: ', pageNumber, '---------------');

            const ids = items.map(item => console.log(item.itemId, item.title));
            // const ids = items.map(item => item.itemId);
            // ids.forEach(loadItemTransactions);
            // loadItemTransactions();
        }
    );
}

function loadItemTransactions(itemId) {
    ebay.xmlRequest(
        {
            serviceName: 'Trading',
            opType: 'GetItemTransactions',

            // // app/environment
            devId: devId,
            certId: certId,
            appId: appId,
            // sandbox: true,

            // per user
            authToken: config.getAuthToken(),

            params: {
                ItemID: itemId,
                // ModTimeFrom: monthAdd(-3),
                // ModTimeFrom: '2018-10-12T13:06:56.084Z',
                // ModTimeTo: new Date().toISOString(),

                paginationInput: {
                    entriesPerPage: 100,
                    pageNumber: 1
                }
            }
        },
        (error, data) => {
            if (error) return console.error(error);

            // console.log(JSON.stringify(data, null, 2));

            const item = data.Item;
            const itemId = item.ItemID;
            const seller = item.Seller;
            const sellerPositiveFeedbackPercent = seller.PositiveFeedbackPercent;

            if (sellerPositiveFeedbackPercent < config.getItemFilterMinPositiveFeedbackPercent()) return console.log('Seller too noob, skipping..');

            const url = item.ListingDetails.ViewItemURLForNaturalSearch;

            let txs = data.Transactions;
            console.log('txs', txs);
            if (!txs) return null;

            txs = Array.isArray(txs) ? txs : [txs];

            if (txs.length < config.getItemFilterMinTxs()) return console.log('not enough txs, skipping..');

            console.log('------------------------------------------');
            // console.log(JSON.stringify(txs, null, 2));
            console.log(itemId, item.Title, url);
            console.log('Found', txs.length, 'Txs in the last 30 days');

            txs.forEach(tx => {
                console.log(tx.Buyer.UserID, tx.ConvertedAmountPaid.amount + tx.ConvertedAmountPaid.currencyID);
            });
            console.log('------------------------------------------');
        }
    );
}

function run() {
    findHotItems(100, 1);
    findHotItems(100, 2);
    // findHotItems(100, 3);
    // findHotItems(100, 4);
    // findHotItems(100, 5);
    // findHotItems(100, 6);
    // findHotItems(100, 7);
    // findHotItems(100, 8);
    // findHotItems(100, 9);
    // findHotItems(100, 10);
    // findHotItems(100, 11);
}

run();
