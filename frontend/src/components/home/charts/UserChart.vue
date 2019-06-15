<template>
	<div>
		<b-button
			id="search-charts-button"
			@click="toggleCollapse"
			variant="dark"
			v-b-toggle.accordion>
				Pesquisa
			<i class="fa fa-lg" :class="icon"></i>
		</b-button>
		<b-tooltip ref="tooltip" target="search-charts-button" placement="bottomright">
			Pesquisar período
		</b-tooltip>
		<div class="pt-2">
			<b-collapse id="accordion" accordion="my-accordion" role="tabpanel">
				<b-card-group deck>
					<b-card footer-tag="footer">
						<b-form-row id="indicator">
							<div class="rcol-12 col-md-6">
								<b-form-group label="Data de:" label-for="search-data-of">
									<b-form-input
										id="search-data-of"
										type="date"
										v-model="search.dataDe" />
								</b-form-group>
							</div>
							<div class="rcol-12 col-md-6">
								<b-form-group label="Até:" label-for="search-data-until">
									<b-form-input
										id="search-data-until"
										type="date"
										v-model="search.dataAte" />
								</b-form-group>
							</div>
						</b-form-row>
						<div slot="footer" class="float-right">
							<b-button
								variant="light"
								class="mr-1"
								@click="resetSearch">
								<i class="fa fa-remove"></i>
								Limpar
							</b-button>
							<b-button
								variant="primary"
								@click="loadData">
								<i class="fa fa-search"></i>
								Pesquisar
							</b-button>
						</div>
					</b-card>
				</b-card-group>
			</b-collapse>
		</div>
		<b-card-group class="pt-4" deck>
			<b-card>
				<h4 style="text-align:center">Total de horas por tipo de atividade</h4>
				<apexchart type="bar" :options="chartBarOptions" :series="barSeries"></apexchart>
			</b-card>
			<b-card>
				<h4 style="text-align:center">Percentual de horas por tipo de atividade</h4>
				<apexchart type="donut" :options="chartDonutOptions" :series="donutSeries"></apexchart>
			</b-card>
		</b-card-group>
	</div>
</template>

<script>
import axios from 'axios'
import { baseApiUrl, userKey } from '@/global'
import moment from 'moment'

let totalHours = null;

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
	return "0h00min"
}

function minutesToHours(totalMinutes) {
	let hours = Math.trunc(totalMinutes / 60)
	let minutes = totalMinutes % 60

	if (hours < 10) {
		hours = `0${hours}`
	}
	if (minutes < 10) {
		minutes = `0${minutes}`
	}

	return formatterTooltip(`${hours}.${minutes}`)
}

const defaultText = 'Nenhum dado para ser exibido'

export default {
	name: 'UserChart',
	data: function() {
		return {
			search : { ...initialSearch },
			chartSerieName: [],
			// Bar Chart
			chartBarOptions: {
				plotOptions: {
					bar: {
						horizontal: false,
						distributed: true,
						dataLabels: {
							position: 'top',
						},
					},
				},
				dataLabels: {
					enabled: true,
					offsetY: -20,
					formatter: function(val) {
						return formatterTooltip(val)
					},
					hideOverflowingLabels: false,
					style: {
						fontSize: '12px',
						colors: ["#304758"]
					}
				},
				stroke: {
					show: true,
					width: 6,
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
						expandOnClick: true,
						dataLabels: {
							offset: 0,
							minAngleToShowLabel: 2
						},
						donut: {
							labels: {
								show: true,
								name: {
									show: true,
									color: '#304758',
								},
								value: {
									show: true,
									formatter: function(val) {
										return formatterTooltip(val)
									}
								},
								total: {
									show: true,
									formatter: function() {
										return minutesToHours(totalHours)
									}
								}
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
		},
		icon() {
            return this.$store.state.isCollapseVisible ? "fa-angle-up" : "fa-angle-down"
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
				// Clean the total hour variable
				totalHours = 0;

				if (res.data && res.data.result && res.data.result.length > 0) {
					this.chartSerieName = []
					this.chartDonutData = []

					res.data.result.forEach((element) => {
						this.chartSerieName.push(element.name)
						this.chartBarData.push(element.data)
						this.chartDonutData.push(Number.parseFloat(element.data))
						totalHours += Number.parseFloat(element.total)
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
		},
		toggleCollapse() {
            this.$store.commit('toggleCollapse')
        },
	},
	mounted() {
		this.loadData();
	}
};
</script>

<style>

.template {
	height: 100%;
}

.template-view {
	display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

</style>
