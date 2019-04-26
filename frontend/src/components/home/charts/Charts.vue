<template>
	<div>
		<b-card>
			<b-form-row id="indicator">
				<div class="rcol-12 col-md-3">
					<b-form-group label="Data de:" label-for="search-data-of">
						<b-form-input
							id="search-data-of" 
							type="date"
							v-model="search.dataDe" />
					</b-form-group>
				</div>
				<div class="rcol-12 col-md-3">
					<b-form-group label="Até:" label-for="search-data-until">
						<b-form-input
							id="search-data-until" 
							type="date"
							v-model="search.dataAte" />
					</b-form-group>
				</div>
				<div class="rcol-12 col-md-2" id="search-buttons">
					<b-button variant="danger" class="mr-1" @click="resetSearch">
						<i class="fa fa-remove"></i>
					</b-button>
					<b-button variant="primary" @click="loadData">
						<i class="fa fa-search"></i>
					</b-button>
				</div>
			</b-form-row>
		</b-card>

		<br>

		<b-card-group deck>
			<b-card>
				<h3>Total de horas por tipo de atividade</h3>
				<apexchart type="bar" :options="chartBarOptions" :series="barSeries"></apexchart>
			</b-card>
			<b-card>
				<h3>Percentual de horas por tipo de atividade</h3>
				<apexchart type="donut" :options="chartDonutOptions" :series="donutSeries"></apexchart>
			</b-card>
		</b-card-group>
	</div>
</template>

<script>
import axios from 'axios'
import { baseApiUrl, userKey } from '@/global'
import moment from 'moment'

const initialSearch = {
    dataDe: moment().startOf('month').format('YYYY-MM-DD'),
    dataAte: moment().endOf('month').format('YYYY-MM-DD')
}

function formatterTooltip(val) {
	if (val) {
		let hours = val.toString().split('.')[0]
		let minutes = val.toString().split('.')[1]
		if (minutes && minutes !== '00') {
			if (minutes.length === 1) {
				minutes = minutes + "0"
			}
			return hours + "h" + minutes + "min"
		}
		return hours + "h"
	}
	return ""
}

const defaultText = 'Nenhum dado para ser exibido'

export default {
	name: 'Charts',
	data: function() {
		return {
			search : { ...initialSearch },
			chartSerieName: [],

			// Bar Chart
			chartBarOptions: {
				plotOptions: {
					bar: {
						horizontal: false,
						columnWidth: '60%',
					},
				},
				dataLabels: {
					enabled: false
				},
				stroke: {
					show: true,
					width: 2,
					colors: ['transparent']
				},
				xaxis: {
					categories: [this.defaultText]
				},
				yaxis: {
					title: {
						text: 'Horas'
					}
				},
				fill: {
					opacity: 1
				},
				tooltip: {
					y: {
						formatter: function(val) {
							return formatterTooltip(val)
						}
					}
				}
			},
			barSeries: [{
				name: '',
				data: []
			}],
			chartBarData: [],

			// Donut Chart
			chartDonutOptions: {
				labels: [],
				legend: {
					position: 'left',
				},
				tooltip: {
					y: {
						formatter: function(val) {
							return formatterTooltip(val)
						}
					}
				},
				chart: {
					toolbar: {
						show: true
					},
				},
				plotOptions: {
					pie: {
						donut: {
							labels: {
								show: true,
								name: {
									show: true
								},
								value: {
									show: true,
									formatter: function(val) {
										return formatterTooltip(val)
									}
								},
								// total: {
								// 	show: true,
								// 	formatter: function(w) {
								// 		return w
								// 	}
								// }
							}
						}
					}
				}
			},
			donutSeries: [0],
			chartDonutData: [],
		};
	},
	computed: {
		usuarioLogado: function() {
			// Pega o usuário logado
			const json = localStorage.getItem(userKey)
			// Transforma o json em objeto
			return JSON.parse(json)
		}
	},
	methods: {
		loadData() {
			const url = `${baseApiUrl}/dashboard/user/${this.usuarioLogado.id}/${this.search.dataDe}/${this.search.dataAte}`
			axios.get(url).then(res => {

				this.chartSerieName = [defaultText]
				// Clean the data of Bar Chart
				this.chartBarData = []
				// Clean the data of Donut Chart
				this.chartDonutData = [0]

				if (res.data && res.data.result && res.data.result.length > 0) {
					this.chartSerieName = []
					this.chartDonutData = []
					
					res.data.result.forEach((element) => {
						this.chartSerieName.push(element.name)
						this.chartBarData.push(element.data)
						this.chartDonutData.push(Number.parseFloat(element.data))
					});
				}
				this.chartBarOptions = {  xaxis: {  categories: this.chartSerieName  }}
				this.barSeries = [{ name: 'Tempo', data: this.chartBarData }]

				this.chartDonutOptions = { labels: this.chartSerieName }
				this.donutSeries = this.chartDonutData
            })
		},
		resetSearch() {
            this.search = { ...initialSearch }
        }
	},
	mounted() {
		this.loadData();
	}
};
</script>

<style>

.template-view {
	display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

</style>