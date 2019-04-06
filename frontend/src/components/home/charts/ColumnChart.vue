<template>
<b-card>
	<h3>Total de horas por tipo de atividade</h3>
	<b-form-row id="indicator">
		<div class="rcol-12 col-md-5">
			<b-form-group label="Data de:" label-for="search-data-of">
				<b-form-input
					id="search-data-of" 
					type="date"
					v-model="search.dataDe" />
			</b-form-group>
		</div>
		<div class="rcol-12 col-md-5">
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
	<b-form-row>
		<apexchart type="bar" width="590" :options="chartOptions" :series="series"></apexchart>
	</b-form-row>
</b-card>
</template>

<script>
import axios from 'axios'
import { baseApiUrl, showError, userKey } from '@/global'
import moment from 'moment'

const initialSearch = {
    dataDe: moment().startOf('month').format('YYYY-MM-DD'),
    dataAte: moment().endOf('month').format('YYYY-MM-DD')
}

export default {
	name: 'ColumnChart',
	data: function() {
		return {
			search : { ...initialSearch },
			chartOptions: {
				plotOptions: {
					bar: {
						horizontal: false,
						// endingShape: 'rounded',
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
					categories: ['Nenhum dado para ser exibido']
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
							console.log(val.toString())
							let hours = val.toString().split('.')[0]
							let minutes = val.toString().split('.')[1]
							if (minutes && minutes !== '00') {
								return hours + "h" + minutes + "min"
							}
							return hours + "h"
						}
					}
				}
			},
			columnName: [],
			columnData: [],
			series: [{
				name: '',
				data: []
			}]
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
				if (res.data && res.data.result && res.data.result.length > 0) {
					this.columnName = []
					this.columnData = []

					res.data.result.forEach((element, index) => {
						this.columnName.push(element.name)
						this.columnData.push(element.data)
					});
					this.chartOptions = {  xaxis: {  categories: this.columnName  }}
					this.series = [{ name: 'Tempo', data: this.columnData }]
					console.log(this.series)
				}
            })
		},
		resetSearch() {
            this.search = { ...initialSearch }
        },
	},
	mounted() {
		this.loadData();
	}
};
</script>

<style>

</style>