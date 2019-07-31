<template>
    <div class="admin-pages">
        <PageTitle
            icon="fa fa-cog"
            main="Administração do Sistema"
            sub="Cadastros & Cia" />
        <div class="admin-pages-tabs">
            <b-card no-body>
                <b-tabs card>
                    <b-tab title="Departamento">
                        <Departamento />
                    </b-tab>
                    <b-tab title="Usuário">
                        <Usuario />
                    </b-tab>
                    <b-tab title="Usuário -> Departamento">
                        <UsuarioDepartamento />
                    </b-tab>
                    <b-tab title="Função">
                        <Funcao />
                    </b-tab>
                    <b-tab title="Tipo atividade">
                        <TipoAtividade />
                    </b-tab>
                    <b-tab title="Redmine">
                        <Redmine />
                    </b-tab>
                    <b-tab title="Tipo atividade <-> Redmine">
                        <DeParaTipoAtividade />
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle'
import Usuario from './Usuario'
import Departamento from './Departamento'
import Funcao from './Funcao'
import TipoAtividade from './TipoAtividade'
import UsuarioDepartamento from './UsuarioDepartamento'
import Redmine from './Redmine'
import DeParaTipoAtividade from './DeParaTipoAtividade'

export default {
    name: 'AdminPages',
    components: { PageTitle, Departamento, Usuario, Funcao, TipoAtividade, UsuarioDepartamento, Redmine, DeParaTipoAtividade}
}
</script>

<style>

</style>
