# 🎟️ ClickTicket

## 📌 Sobre o projeto

# TESTE DO TIAGO

O **ClickTicket** é um sistema desenvolvido para simular uma plataforma de **venda e gerenciamento de ingressos para eventos**. O projeto foi criado com finalidade **educacional**, tendo como principal objetivo aplicar, na prática, conhecimentos relacionados ao desenvolvimento de sistemas web e à construção de uma API para gerenciamento de dados.

Por meio da plataforma, é possível trabalhar com informações relacionadas a **usuários, eventos, atrações e ingressos**, simulando o funcionamento básico de um sistema de venda de tickets.

> ⚠️ **Aviso:** Este projeto possui finalidade exclusivamente educacional e não representa uma plataforma comercial real. As informações e operações realizadas no sistema são utilizadas apenas para fins de aprendizado.


## 🚀 Como utilizar este template?

1. Preencha o arquivo `init.sql` com o banco de dados desejado.
1. Após preenchido, execute o seguinte comando:
```
docker compose up --build -d
```

Caso queira resetar ou recriar o banco de dados (lembre-se que os dados atuais serão perdidos!), execute o comando:

```
docker compose down -v
```

Após inicializado, o webservice pode ser acessado em `http://localhost:3000/`. A interface gráfica de controle do banco de dados pode ser acessada em `http://localhost:8081`.


## Deploy

Configure os detalhes de deploy no arquivo `.env`, seguindo o exemplo presente em `.env.example`.