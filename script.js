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
	validatedYear: false,
	validatedMonth: false,
	validatedDay: false,

	getData: function(){
		const archiveDataCurrency = document.querySelector('.archiveData_currency');
		const archiveDataCurrencyItem = document.querySelectorAll('.archiveData-currency-item');

		const archiveDataButton = document.querySelector('.archiveData_button');
		const year = document.getElementById('year');
		const month = document.getElementById('month');
		const day = document.getElementById('day');

		const archiveDataErrorMsgYear = document.querySelector('.archiveData_errorMsg-year');
		const archiveDataErrorMsgMonth = document.querySelector('.archiveData_errorMsg-month');
		const archiveDataErrorMsgDay = document.querySelector('.archiveData_errorMsg-day');

		[year, month, day].forEach( item => {
			item.addEventListener('input', function(){
				if(item.checkValidity() && item.value.length != 0){
					item.style.backgroundColor = 'rgba(0,255,0,0.8)';

					switch(item.name) {
						case 'year':
							this.validatedYear = true;
							archiveDataErrorMsgYear.style.display = 'none';
							break;
							case 'month':
							this.validatedMonth = true;
							archiveDataErrorMsgMonth.style.display = 'none';
							break;
							case 'day':
							this.validatedDay = true;
							archiveDataErrorMsgDay.style.display = 'none';
							break;
					}

					const archiveDataResultsErrorMsg = document.querySelector('.archiveData_results-errorMsg');
					if(archiveDataResultsErrorMsg.style.display === 'block'){
						archiveDataResultsErrorMsg.style.display = 'none';
					}


				} else {
					item.style.backgroundColor = 'rgba(255,0,0,0.8)';

					switch(item.name) {
						case 'year':
							this.validatedYear = false;
							break;
						case 'month':
							this.validatedMonth = false;
							break;
						case 'day':
							this.validatedDay = false;
							break;
					}
				}
			}.bind(this));
		})

		archiveDataCurrency.addEventListener('click', function(e){
			e.preventDefault();
			//wybór waluty z data-currency elementu
			this.selectedCurrency = e.target.dataset.currency;

			if(!this.selectedCurrency) return false;

			//zaznaczenie wyboru waluty
			[...archiveDataCurrencyItem].forEach((item)=>(item.classList.remove('selected')));
			e.target.classList.add("selected");

			const archiveDataCurrencyErrorMsg = document.querySelector('.archiveData-currency-error-msg');
			if(this.selectedCurrency){
				archiveDataCurrencyErrorMsg.style.display = 'none';
			};
		}.bind(this));

		archiveDataButton.addEventListener('click', function(){
			function singleDigit(value){
				if(value < 10){
					return '0'+ value;
				}else{
					return value;
				}
			}

			this.selectedDate = (`${year.value}-${singleDigit(Number(month.value))}-${singleDigit(Number(day.value))}`);
		}.bind(this));
	},

	showData: function(){
		const archiveDataButton = document.querySelector('.archiveData_button');

		const archiveDataCurrencyDateValue = document.querySelector('.archiveData_currency-dateValue');
		const archiveDataResultsAvgValue = document.querySelector('.archiveData_results-avgValue');
		const archiveDataResultsBuyValue = document.querySelector('.archiveData_results-buyValue');
		const archiveDataResultsSaleValue = document.querySelector('.archiveData_results-saleValue');

		archiveDataButton.addEventListener('click',function(){

			//informowanie użytkownika co jest nie tak w formularzu

			// wyświetl info jak user nie poda poprawnie daty
			const archiveDataDateInputs = document.querySelectorAll('.archiveData_dateInputs-item');
			[...archiveDataDateInputs].forEach(item => {
				if (!item.checkValidity()) {
					item.nextElementSibling.innerText = item.validationMessage;
					item.nextElementSibling.style.display = 'block';

				}
			});

			// wyświetl info jak use nie wybierze waluty
			const archiveDataCurrencyErrorMsg = document.querySelector('.archiveData-currency-error-msg');
			if(!this.selectedCurrency){
				archiveDataCurrencyErrorMsg.style.display = 'block';
			}

			if( !(this.validatedYear && this.validatedMonth && this.validatedDay  && !!(this.selectedCurrency)) ) {
				return false;
			}

			const URL_archiveCurrencyMid = `http://api.nbp.pl/api/exchangerates/rates/a/${this.selectedCurrency}/${this.selectedDate}/`;
			const URL_archiveCurrencySellBuy = `http://api.nbp.pl/api/exchangerates/rates/c/${this.selectedCurrency}/${this.selectedDate}/`;

			fetch(URL_archiveCurrencyMid)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{effectiveDate,mid}]} = resp;

					//przypisania wartości z api - data + wartość średdnia
					archiveDataCurrencyDateValue.innerText = effectiveDate;
					archiveDataResultsAvgValue.innerText = mid;
				})
				.catch(error => {
					if (error.message === "Unexpected token N in JSON at position 4") {
						const archiveDataResultsErrorMsg = document.querySelector('.archiveData_results-errorMsg');
						archiveDataResultsErrorMsg.style.display = 'block';
					}
				});

			fetch(URL_archiveCurrencySellBuy)
				.then(resp => resp.json())
				.then(resp => {
					const {rates:[{bid,ask}]} = resp;

					//przypisania wartości z api - wartość kupna i sprzedaży
					archiveDataResultsBuyValue.innerText = bid;
					archiveDataResultsSaleValue.innerText = ask;
				})
				.catch(error => {
					if (error.message === "Unexpected token N in JSON at position 4") {
						const archiveDataResultsErrorMsg = document.querySelector('.archiveData_results-errorMsg');
						archiveDataResultsErrorMsg.style.display = 'block';
					}
				});
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
