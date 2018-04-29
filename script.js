const exchangeTable = {

 	averageRatesTableA: function() {

    	const asideTable = document.querySelector(".aside_table");
		const asideDate = document.querySelector('.aside_date')
    	const URL_tableA = "http://api.nbp.pl/api/exchangerates/tables/a/";

    	fetch(URL_tableA)
			.then(resp => resp.json())
			.then(resp => {

				let tableContent = `
					<thead>
						<tr>
							<th>Nazwa waluty</th>
							<th>Kod waluty</th>
							<th>Kurs średni</th>
						</tr>
					</thead>
				`;

				tableContent += `<tbody>`;
				resp[0].rates.forEach(rate => {

					tableContent += `
						<tr>
							<td>${rate.currency}</td>
							<td>${rate.code}</td>
							<td>${rate.mid}</td>
						</tr>
					`
				});
				tableContent += `</tbody>`;

				asideDate.innerText = resp[0].effectiveDate;
				asideTable.innerHTML = tableContent;
			})
	}
}


const exchangeChart = {

	currencySelection: '',
	daysSelection: 5,

	singleCurrency: function(){

		const mainCurrency = document.querySelector('.main_currency');
		const mainCurrencyItems = document.querySelectorAll('.main-currency-item')

		const mainCurrencyDateValue = document.querySelector('.main_currency-dateValue');
		const mainResultsAvgValue = document.querySelector('.main_results-avgValue');
		const mainResultsBuyValue = document.querySelector('.main_results-buyValue');
		const mainResultsSaleValue = document.querySelector('.main_results-saleValue');

		mainCurrency.addEventListener('click', function(e){
			e.preventDefault();
			//wybór waluty z data-currency elementu
			this.currencySelection = e.target.dataset.currency;

			if(!this.currencySelection) return false;

			//zaznaczenie wyboru waluty
			[...mainCurrencyItems].forEach((item)=>(item.classList.remove('selected')));
			e.target.classList.add("selected");

			//pobieranie danych
			const URL_singleCurrencyMid = `http://api.nbp.pl/api/exchangerates/rates/a/${this.currencySelection}`;
			const URL_singleCurrencySellBuy = `http://api.nbp.pl/api/exchangerates/rates/c/${this.currencySelection}`;

			fetch(URL_singleCurrencyMid)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{effectiveDate,mid}]} = resp;

				//przypisania wartości z api - data + wartość średdnia
				mainCurrencyDateValue.innerText = effectiveDate;
				mainResultsAvgValue.innerText = mid;
				})

			fetch(URL_singleCurrencySellBuy)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{bid,ask}]} = resp;

				//przypisania wartości z api - wartość kupna i sprzedaży
				mainResultsBuyValue.innerText = bid;
				mainResultsSaleValue.innerText = ask;
			})

			this.chartShowDate();

		}.bind(this));
	},

	chartShowDate: function(){

		//wykres - pobranie danych + wyświetlanie
		const URL_currencyTable_Days = `http://api.nbp.pl/api/exchangerates/tables/a/last/${this.daysSelection}/`;
		fetch(URL_currencyTable_Days)
			.then(resp => resp.json())
			.then(resp => {

				let labelsArray = [];
				let seriesArray = [];

				resp.forEach(item => {
					labelsArray.push(item.effectiveDate);
					seriesArray.push((item.rates.find(item => item.code === this.currencySelection.toUpperCase())).mid)
				})

				//funkcja pomocnicza
				function scaleLabelsArrayWithDate(arr, divider) {
					return arr = [...arr].map( (date, i) => { return (i % divider === 0 ? date.slice(5) : '') } )
				}

				//zmieniam wyświetlanie legendy na osi X
				switch(this.daysSelection) {
					case Number(10):
						labelsArray = scaleLabelsArrayWithDate(labelsArray,2);
						break;
					case Number(22):
						labelsArray = scaleLabelsArrayWithDate(labelsArray,3);
						break;
					case Number(66):
						labelsArray = scaleLabelsArrayWithDate(labelsArray,6);
						break;
				}

				let data = {
					// A labels array that can contain any sort of values
					labels: labelsArray,
					// Our series array that contains series objects or in this case series data arrays
					series: [
						seriesArray
					]
				};

				  // As options we currently only set a static size of 300x200 px. We can also omit this and use aspect ratio containers
				  // as you saw in the previous example
				let options = {
					// width: 600,
					height: 300
				};

				// http://gionkunz.github.io/chartist-js/index.html
				// Create a new line chart object where as first parameter we pass in a selector
				// that is resolving to our chart container element. The Second parameter
				// is the actual data object. As a third parameter we pass in our custom options.
				new Chartist.Line('.ct-chart', data, options);
		})

	},

	singleCurrencyMultiDaysChartList: function(){

		const choiceNumberOfDays = document.querySelector('.choice-number-of-days');
		const choiceNumberOfDaysItems = document.querySelectorAll('.choice-number-of-days-item');

		choiceNumberOfDays.addEventListener('click', function(e){
			e.preventDefault();

			//wybór okresu dla którego wyświetlać dane
			this.daysSelection = Number(e.target.dataset.currency);
			if(!this.daysSelection) return false;

			[...choiceNumberOfDaysItems].forEach((item)=>(item.classList.remove('selected')));
			e.target.classList.add("selected");

			// wyświetlanie danych
			this.chartShowDate();
		}.bind(this)); //pamietać o bind w obiekcie !!! ;-)
	}
} // koniec obiektu exchange

const exchangeArchiveData = {

	selectedCurrency: '',
	selectedDate: null,

	getData: function(){
		const archiveDataCurrency = document.querySelector('.archiveData_currency');
		const archiveDataCurrencyItem = document.querySelectorAll('.archiveData-currency-item');

		const archiveDataButton = document.querySelector('.archiveData_button');
		const year = document.getElementById('year');
		const month = document.getElementById('month');
		const day = document.getElementById('day');

		archiveDataCurrency.addEventListener('click', function(e){
			e.preventDefault();
			//wybór waluty z data-currency elementu
			this.selectedCurrency = e.target.dataset.currency;

			if(!this.selectedCurrency) return false;

			//zaznaczenie wyboru waluty
			[...archiveDataCurrencyItem].forEach((item)=>(item.classList.remove('selected')));
			e.target.classList.add("selected");
		}.bind(this));

		archiveDataButton.addEventListener('click', function(){
			const year = document.getElementById('year').value;
			const month = document.getElementById('month').value;
			const day = document.getElementById('day').value;

			this.selectedDate = (`${year}-${month}-${day}`);
		}.bind(this));
	},

	showData: function(){
		const archiveDataButton = document.querySelector('.archiveData_button');

		const archiveDataCurrencyDateValue = document.querySelector('.archiveData_currency-dateValue');
		const archiveDataResultsAvgValue = document.querySelector('.archiveData_results-avgValue');
		const archiveDataResultsBuyValue = document.querySelector('.archiveData_results-buyValue');
		const archiveDataResultsSaleValue = document.querySelector('.archiveData_results-saleValue');

		archiveDataButton.addEventListener('click',function(){

			console.log(this.selectedCurrency);
			console.log(this.selectedDate);

			const URL_archiveCurrencyMid = `http://api.nbp.pl/api/exchangerates/rates/a/${this.selectedCurrency}/${this.selectedDate}/`;
			const URL_archiveCurrencySellBuy = `http://api.nbp.pl/api/exchangerates/rates/c/${this.selectedCurrency}/${this.selectedDate}/`;

			fetch(URL_archiveCurrencyMid)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{effectiveDate,mid}]} = resp;

					//przypisania wartości z api - data + wartość średdnia
					archiveDataCurrencyDateValue.innerText = effectiveDate;
					archiveDataResultsAvgValue.innerText = mid;
					console.log(resp)
				})

			fetch(URL_archiveCurrencySellBuy)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{bid,ask}]} = resp;

					//przypisania wartości z api - wartość kupna i sprzedaży
					archiveDataResultsBuyValue.innerText = bid;
					archiveDataResultsSaleValue.innerText = ask;
					console.log(resp)
			})


		}.bind(this));

	}
}

document.addEventListener("DOMContentLoaded", function(event) {

	exchangeTable.averageRatesTableA();
	exchangeChart.singleCurrency();

	const singleCurrencyButtonUSD = document.querySelector("[data-currency='usd']");
	singleCurrencyButtonUSD.click();

	exchangeChart.singleCurrencyMultiDaysChartList();

	exchangeArchiveData.getData();
	exchangeArchiveData.showData();
});
