<template>
	<div>
		<b-card>
			<b-form-row id="indicator">
				<div class="rcol-12 col-md-2">
                    <b-form-group label="Selecione o mês: *" label-for="filter-month">
                        <b-form-select
                            id="filter-month"
                            :options="months"
							v-model="search.actualMonth"
							>
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
				<div class="col-12 col-md-2" id="search-buttons">
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
		<b-card class="table-hour-geral">
			<b-table
				:fields=fields
				:items=itemsTableGeral
				small
				bordered
				responsive
				hover
				striped
			>
				<template slot="thead-top">
					<tr>
						<th class="table-title" :colspan="fields.length">RELATÓRIO GERENCIAL</th>
					</tr>
					<tr>
						<th class="month-title" :colspan="fields.length">Janeiro</th>
					</tr>
				</template>
			</b-table>

			<hr>

			<div>
				<b-card-group deck>
					<b-card>
						<h3>Totais</h3>
						<table class="table table-hover">
							<tbody v-for="(item) in totalHoursPerActivity" v-bind:key="item.key">
								<tr>
									<th>{{ item.label }}</th>
									<th>{{ item.total }}</th>
								</tr>
							</tbody>
							<tr>
								<th>Total de horas realizadas</th>
								<th>25h43min</th>
							</tr>
						</table>
					</b-card>
					<b-card>
						<h3>Horas Faturadas X Horas Não Faturadas</h3>
						<apexchart width="80%" type="donut" :options="chartDonutOptions" :series="donutSeries"></apexchart>
					</b-card>
				</b-card-group>
			</div>
		</b-card>
	</div>
</template>

<script>
import axios from 'axios'
import { baseApiUrl } from '@/global'
import moment from 'moment'

const months = moment.localeData('pt-BR').months()
const years = [ "2019" ]

const initialSearch = {
    actualMonth : moment().month(),
    actualYear : moment().year()
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

export default {
    name: 'ColaboratorsChart',
	data() {
		return {
			months : { ...months },
			fields : [],
			years : years,
			search : { ...initialSearch },
			itemsTableGeral: [],
			totalHoursPerActivity: [
				{ key : 1, label : "Break", total : "25h43min" },
				{ key : 2, label : "Atividade externa pessoal", total : "25h43min" },
				{ key : 3, label : "Férias", total : "25h43min" },
				{ key : 4, label : "Atestado médico", total : "25h43min" },
				{ key : 5, label : "Horas Faturadas", total : "25h43min" },
				{ key : 6, label : "Processos Internos", total : "25h43min" },
				{ key : 7, label : "Folga", total : "25h43min" },
				{ key : 8, label : "Licença", total : "25h43min" },
				{ key : 9, label : "Feriado", total : "25h43min" },
				{ key : 10, label : "Desenvolvimento", total : "25h43min" },
				{ key : 11, label : "Análise", total : "25h43min" },
				{ key : 12, label : "Code Review", total : "25h43min" },
				{ key : 13, label : "Request for proposal", total : "25h43min" }
			],
			// Donut Chart
			chartDonutOptions: {
				labels: ["Horas Faturadas", "Hora Não Faturadas"],
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
							}
						}
					}
				}
			},
			donutSeries: [44, 55]
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
				this.itemsTableGeral = res.data
			})
		},
		resetSearch() {
            this.search = { ...initialSearch }
        }
	},
	mounted: function() {
		const vm = this;
		const url = `${baseApiUrl}/headerTableHourReport`
		axios.get(url)
			.then(function(response){
				vm.fields = response.data
		})
	},
	beforeMount() {
		this.loadHeaders()
		this.loadData()
	}
}
</script>

<style>

.table-hour-geral {
  font-size: 0.8em;
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

</style>
