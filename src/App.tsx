import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Currency from './interfaces/Currency';
import Header from './components/Header';
import env from 'react-dotenv';
import { Col, Container, Row } from 'react-bootstrap';
import CurrencyBlock from './components/CurrencyBlock';
import rightArrow from './images/right-arrow.png';

const App: React.FC = () => {
	const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currencySymbols, setCurrencySymbols] = useState<string[]>([]);
	const [leftSymbol, setLeftSymbol] = useState<string>("");
	const [rightSymbol, setRightSymbol] = useState<string>("");
	const [fromCurrency, setFromCurrency] = useState<Currency | null | undefined>(null);
	const [toCurrency, setToCurrency] = useState<Currency | null | undefined>(null);
	const [fromValue, setFromValue] = useState<string>("");
	const [toValue, setToValue] = useState<string>("");
	const [rates, setRates] = useState<any>({});
	const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
	const [countryError, setCountryError] = useState<boolean>(false);
	const [exchangeError, setExchangeError] = useState<boolean>(false);

    useEffect(() => {
        axios
            .get("https://restcountries.eu/rest/v2/all")
            .then((res) => {
				let currencyList: Currency[] = [];	// will be used to set state
				let currencyCodeSet: Set<string> = new Set();	// will be used to help build the above currencyList variable
                let currencySymbolSet: Set<string> = new Set();	// will be used to set state

                res.data.forEach((entry: any) => {
                    entry.currencies.forEach((curr: any) => {
						// add symbol to set of unique currency symbols
						if (curr.symbol !== null)
							currencySymbolSet.add(curr.symbol);

						// add unique currencies to currencyList, using set to keep track of uniques
						if (!currencyCodeSet.has(curr.code) && curr.code !== null) {
							currencyCodeSet.add(curr.code);
							currencyList.push({ 
								code: curr.code === "VEF" ? "VES" : curr.code,	// there is a discrepency between the 2 APIs, have to add this for consistency
								name: curr.name,
								symbol: curr.symbol,
							});
						}
                    });				
                });

				// sort currency list
				currencyList.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

				setCurrencies(currencyList);
                setCurrencySymbols(Array.from(currencySymbolSet));
				
				setFromCurrency(currencyList.find(x => x.code === "CAD") || null);
				setToCurrency(currencyList.find(x => x.code === "USD") || null);
            }).catch(() => {
				setCountryError(true);
			});

		axios.get(`https://v6.exchangerate-api.com/v6/${env.API_KEY}/latest/CAD`)
			.then((res) => {
				const moment = require("moment");
				setLastUpdated(moment.unix(res.data.time_last_update_unix).format("MMMM Do, YYYY @ HH:mm:ss"));
				
				setRates(res.data.conversion_rates);
				setFromValue("1");
				setToValue((1 * res.data.conversion_rates["USD"]).toFixed(4));	// set initial value to match initial from value ($1 CAD)
			}).catch(() => {
				setExchangeError(true);
			});
    }, []);

	useEffect(() => {
		const updateTitleCurrency = (): void => {
			if (currencySymbols.length > 0) {
				let leftIndex: number = Math.floor(Math.random() * currencySymbols.length);
				setLeftSymbol(currencySymbols[leftIndex]);
	
				let rightIndex: number = Math.floor(Math.random() * currencySymbols.length);
				setRightSymbol(currencySymbols[rightIndex]);
			}
		}
		updateTitleCurrency();
		
		let timer: ReturnType<typeof setInterval>;
		timer = setInterval(() => {
			updateTitleCurrency();
		}, 5000);

		return () => clearInterval(timer);
	}, [currencySymbols]);

	const updateFromCurrency = (selected?: Currency | null | undefined): void => {
		setFromCurrency(selected);
		// query the rates api and update array in memory, as well as update timestamp
		axios.get(`https://v6.exchangerate-api.com/v6/${env.API_KEY}/latest/${selected?.code}`)
			.then((res) => {
				const moment = require("moment");
				setLastUpdated(moment.unix(res.data.time_last_update_unix).format("MMMM Do, YYYY @ HH:mm:ss"));
				
				setRates(res.data.conversion_rates);
				setToValue((Number(fromValue) * res.data.conversion_rates[toCurrency?.code || ""]).toFixed(4));
			}).catch(() => {
				setExchangeError(true);
				setFromValue("");
				setToValue("");
			});;
	}

	const updateToCurrency = (selected?: Currency | null | undefined): void => {
		setToCurrency(selected);

		// recalculate own value based on rate of newly selected country
		if (fromValue !== "")
			setToValue((Number(fromValue) * rates[selected?.code || ""]).toFixed(4));
	}

	const updateFromValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isNaN(+e.target.value)) {
			setFromValue(e.target.value);

			// now update the to value accordingly
			let value: number = Number(e.target.value);
			setToValue((value * rates[toCurrency?.code || ""]).toFixed(4));
		}
	}

	const updateToValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!isNaN(+e.target.value)) {
			setToValue(e.target.value);

			// now update the from value accordingly
			let value: number = Number(e.target.value);
			setFromValue((value * (1 / rates[toCurrency?.code || ""])).toFixed(4));
		}
	}

    return (
        <div>
            <Header leftSymbol={leftSymbol} rightSymbol={rightSymbol} />
			{ !countryError &&
				<div>
					{ !exchangeError &&
						<p className="updateTstamp mt-3">Currencies updated as of: <b>{lastUpdated}</b></p>
					}
					{ exchangeError &&
						<p className="updateTstamp mt-3">Could not get currency exchange rate data at this time, please check back later</p>
					}
					<hr></hr>
					<Container className="mt-4 mb-4">
						<Row>
							<Col xs="5" className="d-flex flex-row-reverse">
								<CurrencyBlock activeCurrency={fromCurrency} currencies={currencies} panelSide={"left"} 
								updateSelectedCurrency={updateFromCurrency} value={fromValue} updateValue={updateFromValue}
								readOnly={exchangeError} />
							</Col>
							<Col xs="2" className="d-flex justify-content-center">
								<img src={rightArrow} alt="right-arrow" width="80" />
							</Col>
							<Col xs="5" className="d-flex flex-row">
								<CurrencyBlock activeCurrency={toCurrency} currencies={currencies} panelSide={"right"} 
								updateSelectedCurrency={updateToCurrency} value={toValue} updateValue={updateToValue}
								readOnly={exchangeError} />
							</Col>
						</Row>
					</Container>
					<hr></hr>
				</div>
			}
			{ countryError &&
				<div><h3 className="mt-3 text-center">Could not access country data API, check back later.</h3></div>
			}
        </div>
    );
};

export default App;