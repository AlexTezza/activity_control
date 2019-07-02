<template>
	<div>
		<b-button
			id="search-colaborators-charts-button"
			@click="toggleCollapse"
			variant="dark"
			v-b-toggle.search>
				Pesquisa
			<i class="fa fa-lg" :class="icon"></i>
		</b-button>
		<b-tooltip ref="tooltip" target="search-colaborators-charts-button" placement="bottomright">
			Pesquisar mês e ano
		</b-tooltip>
		<div class="pt-2">
			<b-collapse id="search" accordion="accordion-colaborators-charts" role="tabpanel-colaborators-charts">
				<b-card-group deck>
					<b-card footer-tag="footer">
						<b-form-row id="indicator">
							<div class="rcol-12 col-md-2">
								<b-form-group label="Selecione o mês: *" label-for="filter-month">
									<b-form-select
										id="filter-month"
										:options="months"
										v-model="search.actualMonth">
									</b-form-select>
								</b-form-group>
							</div>
							<div class="rcol-12 col-md-2">
								<b-form-group label="Selecione o ano: *" label-for="filter-year">
									<b-form-select
										id="filter-year"
										:options="years"
										v-model="search.actualYear"
										>
									</b-form-select>
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
		<b-card-group class="pt-4">
			<b-card class="table-hour-geral" deck>
				<b-table
					:fields=fields
					:items=itemsTableGeral
					small
					bordered
					responsive
					hover
					striped>
					<template slot="thead-top">
						<tr>
							<th class="table-title" :colspan="fields.length">RELATÓRIO GERENCIAL</th>
						</tr>
						<tr>
							<th class="month-title" :colspan="fields.length">{{ searchedMonth }}</th>
						</tr>
					</template>
				</b-table>
				<div class="pt-4">
					<b-card-group deck>
						<b-card>
							<h4>Totais</h4>
							<table class="table table-hover">
								<tbody v-for="(item) in totalHoursPerActivity" v-bind:key="item.key">
									<tr>
										<td>{{ item.description }}</td>
										<td>{{ item.total }}</td>
									</tr>
								</tbody>
								<tr class="total-hours">
									<th>{{ totalHours.description }}</th>
									<th>{{ totalHours.totalHours }}</th>
								</tr>
							</table>
						</b-card>
						<b-card>
							<h4>Percentual de horas por tipo de atividade</h4>
							<apexchart type="donut" :options="chartDonutOptions" :series="donutSeries"></apexchart>
						</b-card>
					</b-card-group>
				</div>
			</b-card>
		</b-card-group>
	</div>
</template>

<script>
import axios from 'axios'
import { baseApiUrl } from '@/global'
import moment from 'moment'
import { minutesToHours, percentualPerActivity, formatterTooltip } from '../../../utils'

const months = moment.localeData('pt-BR').months()
const years = [ "2019" ]

const initialSearch = {
    actualMonth : moment().month(),
    actualYear : moment().year()
}

const defaultText = 'Nenhum dado para ser exibido'

let totalHoursRealized = null
let totalMinutesRealized = null

export default {
    name: 'ColaboratorsChart',
	data() {
		return {
			months : { ...months },
			fields : [],
			years : years,
			search : { ...initialSearch },
			searchedMonth: '',
			itemsTableGeral: [],
			totalHours: {},
			totalHoursPerActivity: [],
			// Donut Chart
			chartDonutOptions: {
				labels: [],
				legend: {
					position: 'left',
					formatter: function(val, serie) {
						return percentualPerActivity(val, serie, totalMinutesRealized)
					}
				},
				tooltip: {
					y: {
						formatter: function(val) {
							return minutesToHours(val)
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
							minAngleToShowLabel: 4
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
										return minutesToHours(val)
									}
								},
								total: {
									show: true,
									formatter: function() {
										return formatterTooltip(totalHoursRealized)
									}
								}
							}
						}
					}
				}
			},
			chartSerieName: [],
			donutSeries: [0],
			chartDonutData: [],
		}
	},
	computed: {
		icon() {
			return this.$store.state.isCollapseVisible ? "fa-angle-up" : "fa-angle-down"
		}
	},
	methods: {
		loadHeaders: async function() {
			const url = `${baseApiUrl}/tipoAtividade`
			this.activitiesType = await axios.get(url)
				.then(function(response){
					return response.data.data.map(activity => {
						return { key: activity.sigla, label: activity.descricao }
					})
			})
		},
		loadData() {
			var startDate = moment([this.search.actualYear, this.search.actualMonth]);
			const dateFrom = startDate.format('YYYY-MM-DD')
			const dateUntil = moment(startDate).endOf('month').format('YYYY-MM-DD');

			const url = `${baseApiUrl}/colaborators-chart/${dateFrom}/${dateUntil}`
			axios.get(url).then(res => {

				this.chartSerieName = [defaultText]
				this.chartDonutData = [0]
				totalHoursRealized = 0
				totalMinutesRealized = 0

				this.itemsTableGeral = res.data.organizedResultData
				this.searchedMonth = months[this.search.actualMonth]
				this.totalHours = res.data.totals
				totalHoursRealized = res.data.totals ? res.data.totals.totalHours : 0
				totalMinutesRealized = res.data.totals ? res.data.totals.totalMinutes : 0
				this.totalHoursPerActivity = res.data.rawResultData

				if (res.data && res.data.optionsSeries
						&& res.data.optionsSeries
						&& res.data.optionsSeries.options.length > 0
						&& res.data.optionsSeries.series.length > 0) {

					this.chartSerieName = res.data.optionsSeries.options
					this.chartDonutData = res.data.optionsSeries.series
				}
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
	beforeMount() {
		this.loadHeaders()
		this.loadData()
	},
	mounted: function() {
		const vm = this;
		const url = `${baseApiUrl}/headerTableHourReport`
		axios.get(url)
			.then(function(response){
				vm.fields = response.data
		})
	},
}
</script>

<style>

.table-hour-geral {
  font-size: 1em;
}

.table-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: 500;
  color: white;
  background-color: lightslategray;
  vertical-align: middle !important;
}

.month-title {
  font-size: 1.5em;
  font-weight: 700;
  text-align: center;
  background-color: lightyellow;
  vertical-align: middle !important;
}

.total-hours {
	font-size: 1.2em;
	font-weight: 700;
}

</style>
