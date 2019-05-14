# Registro de Atividades
Projeto desenvolvido para facilitar o registro de atividades dos colaboradores.

Esta aplicação possibilita aos colaboradores que registrem suas atividades, 
juntamente com o tipo da atividade, data de realização, hora de início e fim. 
A partir destes dados, conseguimos extrair informações, como: tempo total gasto por tipo de atividade, 
média de horas gastas por tipo de atividades, entre outros.

# Configuração do projeto
## Backend

#### Para baixar as dependências do projeto(backend), basta executar o seguinte comando dentro da pasta `\backend`:
`npm install`

Antes de executar o backend é necessário criar uma nova base de dados (postgres), utilize o nome que preferir, neste exemplo iremos considerar o como **hour_control**.

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

Basta rodar o comando `knex migrate:latest` e todas as entidades utilizadas pela aplicação serão criadas.

Por padrão, esta sendo utilizada o ip e porta `localhost:3000` (o ip e porta podem ser alterados no arquivo `\backend\index.js`).

#### Para executar o projeto, basta executar o seguinte comando na raiz do projeto backend: 
`npm start`

----------------------------------------------------------------------------------------------------------------------------------------

## Frontend

#### Para baixar as dependências do projeto(frontend), basta executar o seguinte comando dentro da pasta `\frontend`:
`npm install`
#### Para executar o projeto, basta executar o seguinte comando na raiz do projeto frontend: 
`npm run serve`

Para acessar a aplicação, basta acessar o endereço `http://localhost:8080`, criar um login e senha e entrar.

Observação: Para criar o primeiro usuário admin do sistema é necessário, primeiro cadastrá-lo via aplicação, depois ir até o banco de dados, fazer um select na entidade `usuario` e alterar a coluna `admin` para **true**, a partir dai, todos os outros usuários que precisem de acesso admin, podem ser setados na própia aplicação, na tela de cadastro de usuários (seção administrativa).

#### Alterar configuração de Ip/Porta (conexão com o backend): 
Basta alterar a constante `baseApiUrl` do arquivo `\frontend\src\global.js`, esta propiedade seta a url do **backend**.

