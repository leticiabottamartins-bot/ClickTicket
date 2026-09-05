CREATE TABLE atracao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    nacionalidade VARCHAR(30),
    tipo VARCHAR(30),

    CONSTRAINT atracao_nome_ck
        CHECK (TRIM(nome) <> '')
);

CREATE TABLE local (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    endereco VARCHAR(150) NOT NULL,
    capacidade INT NOT NULL,

    CONSTRAINT local_capacidade_ck
        CHECK (capacidade > 0),

    CONSTRAINT local_nome_ck
        CHECK (TRIM(nome) <> ''),

    CONSTRAINT local_endereco_ck
        CHECK (TRIM(endereco) <> '')
);

CREATE TABLE show (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    data TIMESTAMPTZ NOT NULL,
    local_id INT NOT NULL,
    genero VARCHAR(50),

    CONSTRAINT show_local_fk
        FOREIGN KEY (local_id)
        REFERENCES local(id),

    CONSTRAINT show_nome_ck
        CHECK (TRIM(nome) <> '')
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    ano_nasc INT NOT NULL,
    gosto VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(80) NOT NULL,

    CONSTRAINT usuario_cpf_uq
        UNIQUE (cpf),

    CONSTRAINT usuario_email_uq
        UNIQUE (email),

    CONSTRAINT usuario_ano_nasc_ck
        CHECK (ano_nasc BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::INT),

    CONSTRAINT usuario_nome_ck
        CHECK (TRIM(nome) <> '')

);

CREATE TABLE ingresso (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    show_id INT NOT NULL,
    tipo VARCHAR(25) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    data_compra TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ingresso_usuario_fk
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),

    CONSTRAINT ingresso_show_fk
        FOREIGN KEY (show_id)
        REFERENCES show(id),

    CONSTRAINT ingresso_preco_ck
        CHECK (preco >= 0),

    CONSTRAINT ingresso_tipo_ck
        CHECK (TRIM(tipo) <> '')
);

CREATE TABLE show_atracao (
    show_id INT NOT NULL,
    atracao_id INT NOT NULL,

    CONSTRAINT show_atracao_pk
        PRIMARY KEY (show_id, atracao_id),

    CONSTRAINT show_atracao_show_fk
        FOREIGN KEY (show_id)
        REFERENCES show(id)
        ON DELETE CASCADE,

    CONSTRAINT show_atracao_atracao_fk
        FOREIGN KEY (atracao_id)
        REFERENCES atracao(id)
        ON DELETE CASCADE
);    