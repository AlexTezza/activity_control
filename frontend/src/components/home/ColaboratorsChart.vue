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
						<th class="month-title first-thrid-month" :colspan="fields.length">Janeiro</th>
					</tr>
				</template>
				<!-- <template slot="bottom-row">
					<th class="table-title-total">Total geral mensal</th>
				</template> -->
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
				{ key : 13, label : "Request for proposal", total : "25h43min" },
				{ key : 14, label : "Total de horas realizadas", total : "25h43min" }
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
			// const url = `${baseApiUrl}/dashboard/user/${this.usuarioLogado.id}/${this.search.dataDe}/${this.search.dataAte}`
			// axios.get(url).then(res => {

			this.itemsTableGeral = [
				{ id: 1, name: "Alberton Silva", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 2, name: "Alex Tezza", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 3, name: "Christian Surkamp", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 4, name: "Giovane Gottardo", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 5, name: "Iêda Brasil", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 6, name: "Letícia Taborda", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 7, name: "Rodrigo Santini", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 8, name: "Uriel Mello", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 9, name: "Vanesa Holdefer", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
				{ id: 10, name: "Vitor Cervelin", BRK: "2h25min", AEP: "3h45min", FES: "5h34min", AMO: "5h34min", HFS: "1h29min", PIS: "0h", FOA: "2h25min", LIA: "3h45min", FEO: "5h34min", DEO: "5h34min", ANE: "1h29min", CRW: "0h", RFP: "3h45min" },
			]

            // })
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
		// return [
		// 	{ key : "name", label : "" },
		// 	{ key: "FES", label: " Férias"},
		// 	{ key: "ANE", label: "Análise"},
		// 	{ key: "AMO", label: "Atestado médico"},
		// 	{ key: "AEP", label: "Atividade externa pessoal"},
		// 	{ key: "BRK", label: "Break"},
		// 	{ key: "CRW", label: "Code Review"},
		// 	{ key: "DEO", label: "Desenvolvimento"},
		// 	{ key: "FEO", label: "Feriado"},
		// 	{ key: "FOA", label: "Folga"},
		// 	{ key: "HFS", label: "Horas Faturadas"},
		// 	{ key: "LIA", label: "Licença"},
		// 	{ key: "PIS", label: "Processos Internos"},
		// 	{ key: "RFP", label: "Request for proposal"}
		// ]
	},
	beforeMount() {
		this.loadHeaders()
		this.loadData()
	}
}
</script>

<style>

.table-hour-geral {
  font-size: 0.9em;
}

.table-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: 500;
  color: white;
  background-color: lightslategray;
  vertical-align: middle !important;
}

.table-sub-title {
  text-align: center;
  font-size: 1.5em;
  font-weight: 700;
  vertical-align: middle !important;
}

.table-title-total {
  text-align: left;
  font-size: 1.2em;
  font-weight: 700;
  color: black;
  background-color:lightgreen;
  vertical-align: middle !important;
}

.month-title {
  font-size: 1.5em;
  font-weight: 700;
  text-align: center;
  vertical-align: middle !important;
}

.column-title {
  text-align: center;
  vertical-align: middle !important;
}

.column-value {
  text-align: center;
  vertical-align: middle !important;
}

.first-thrid-month {
  background-color: lightyellow;
}

.second-month {
  background-color: lightcyan;
}

</style>
