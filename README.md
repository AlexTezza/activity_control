# Registro de Atividades
Projeto desenvolvido para facilitar o registro de atividades dos colaboradores.

Esta aplicação possibilita aos colaboradores que registrem suas atividades, 
juntamente com o tipo da atividade, data de realização, hora de início e fim. 
A partir destes dados, conseguimos extrair informações, como: tempo total gasto por tipo de atividade, 
média de horas gastas por tipo de atividades, entre outros.

# Configuração do projeto
## Backend
Para executar o backend é necessário primeiro criar uma nova base de dados (postgres), com o nome **hour_control**.

Após criar esta base, precisamos renomear o arquivo `\backend\env_file` para `.env` (lembrando que este arquivo não pode ser comitado, 
pois conterá informações importantes sobre o banco de dados e da geração de hash de senha do usuário).
Após alterar o nome do arquivo, abrir ele e alterar as propiedades de acordo com suas configurações:

### .env

```
module.exports = {
    # Esta propiedade será o "sal" utilizado na geração do hash de senha do usuário.
    # Adicionar uma sequência de caracteres qualquer, exemplo: "df34dsf3254"
    authSecret: '',
    db: {
        # Seu host do banco de dados
        host: '127.0.0.1',
        # A porta do seu host do banco de dados
        port: 5432,
        # Nome da base de dados, no nosso caso "hour_control"
        database: '',
        # Seu usuáiro do banco de dados
        user : '',
        # Sua senha do banco de dados
        password: ''
    }
}
```

Após configurar o arquivo **.env** basta rodar as migrations para criar as entidades no banco de dados.
Para isto, utilizamos o [Knex](https://knexjs.org/).

Basta abrir o prompt de comando na raiz do projeto backend, e instalar a dependencia do **knex** globalmente: `npm install knex -g`

Após instalado, basta rodar o comando `knex migrate:latest`, com este comando, todas as entidades utilizadas pela aplicação serão criadas.

Para executar o projeto, basta executar os comandos:

`npm install`
   
`npm start`

Por padrão, esta sendo utilizada o ip `localhost:3000` (o ip pode ser alterado no arquivo `\backend\global\global.js`, e a porta pode ser alterada no arquivo `\backend\index.js`).

## Frontend
Antes de executar o frontend, precisamos alterar a propiedade `baseApiUrl` dentro do arquivo `\frontend\src\global.js`, esta propiedade seta a url do **backend** (caso esteja executando o backend com o ip localhost, basta setar o localhost aqui também).

Para executar o projeto, basta executar os seguintes comandos na raiz do projeto frontend:

`npm install`
   
`npm run serve`

Para acessar a aplicação, basta acessar o endereço `http://localhost:8080`, criar um login e senha e entrar.

Observação: Para criar o primeiro usuário admin é necessário setá-lo diretamente via banco de dados, basta fazer um select na entidade `usuario` e alterar a coluna `admin` para **true**, a partir dai, todos os outros usuários que precisem ser admins podem ser setados na própia aplicação (dentro do cadastro de usuários).

