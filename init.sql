CREATE DATABASE IF NOT EXISTS clickTicket;
USE clickTicket;


CREATE TABLE atracao(
    id VARCHAR(7) NOT NULL,
    nome VARCHAR(60) NOT NULL,
    nacionalidade VARCHAR(30),
    tipo VARCHAR(30),

    CONSTRAINT atracao_pk PRIMARY KEY (id)
);


CREATE TABLE local(
    id VARCHAR(7) NOT NULL,
    nome VARCHAR(60),
    pais VARCHAR(40),
    estado VARCHAR(40),
    cidade VARCHAR(40),
    endereco VARCHAR(100) NOT NULL,
    capacidade INT NOT NULL,

    CONSTRAINT local_pk PRIMARY KEY (id),
    CONSTRAINT local_ck CHECK (capacidade > 0)
);


CREATE TABLE show(
    id VARCHAR(7) NOT NULL,
    nome VARCHAR(60) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    local_id VARCHAR(7) NOT NULL,

    CONSTRAINT show_pk PRIMARY KEY (id),
    CONSTRAINT show_fk_local FOREIGN KEY (local_id) REFERENCES local(id)
);


CREATE TABLE usuario(
    id VARCHAR(7) NOT NULL,
    nome VARCHAR(60) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    ano_nasc YEAR NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,

    CONSTRAINT usuario_pk PRIMARY KEY (id),
    CONSTRAINT usuario_uq_cpf UNIQUE (cpf),
    CONSTRAINT usuario_uq_email UNIQUE (email)
);


CREATE TABLE ingresso(
    id VARCHAR(7) NOT NULL,
    usuario_id VARCHAR(7) NOT NULL,
    show_id VARCHAR(7) NOT NULL,
    tipo VARCHAR(25) NOT NULL,
    preco INT NOT NULL,
    data_compra DATE NOT NULL,

    CONSTRAINT ingresso_pk PRIMARY KEY (id),
    CONSTRAINT ingresso_ck CHECK (preco >= 0),
    CONSTRAINT ingresso_fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    CONSTRAINT ingresso_fk_show FOREIGN KEY (show_id)REFERENCES show(id)
);


CREATE TABLE showAtracao(
    show_id VARCHAR(7) NOT NULL,
    atracao_id VARCHAR(7) NOT NULL,

    CONSTRAINT showAtracao_pk PRIMARY KEY (show_id, atracao_id),
    CONSTRAINT showAtracao_fk_show FOREIGN KEY (show_id) REFERENCES show(id),
    CONSTRAINT showAtracao_fk_atracao FOREIGN KEY (atracao_id) REFERENCES atracao(id)
);



