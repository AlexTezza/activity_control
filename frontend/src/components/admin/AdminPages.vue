<template>
    <div class="admin-pages">
        <PageTitle icon="fa fa-cogs" main="Administração do Sistema"
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
                    <b-tab title="Tipo atividade">
                        <TipoAtividade />
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
import TipoAtividade from './TipoAtividade'
import UsuarioDepartamento from './UsuarioDepartamento'

export default {
    name: 'AdminPages',
    components: { PageTitle, Departamento, Usuario, TipoAtividade, UsuarioDepartamento }
}
</script>

<style>

</style>
