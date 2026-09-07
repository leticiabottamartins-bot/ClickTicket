CREATE TABLE genero_musical (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    CONSTRAINT genero_musical_nome_uq UNIQUE (nome),
    CONSTRAINT genero_musical_nome_ck CHECK (TRIM(nome) <> '')
);

CREATE TABLE atracao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    nacionalidade VARCHAR(30),
    tipo VARCHAR(30),
    genero_musical_id INT NOT NULL,
    CONSTRAINT atracao_nome_ck CHECK (TRIM(nome) <> ''),
    CONSTRAINT atracao_genero_musical_fk
        FOREIGN KEY (genero_musical_id)
        REFERENCES genero_musical(id)
);

CREATE TABLE local (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    endereco VARCHAR(150) NOT NULL,
    capacidade INT NOT NULL,
    CONSTRAINT local_capacidade_ck CHECK (capacidade > 0),
    CONSTRAINT local_nome_ck CHECK (TRIM(nome) <> ''),
    CONSTRAINT local_endereco_ck CHECK (TRIM(endereco) <> '')
);

CREATE TABLE show (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    data TIMESTAMPTZ NOT NULL,
    local_id INT NOT NULL,
    genero_id INT NOT NULL,
    CONSTRAINT show_local_fk
        FOREIGN KEY (local_id)
        REFERENCES local(id),
    CONSTRAINT show_genero_fk
        FOREIGN KEY (genero_id)
        REFERENCES genero_musical(id),
    CONSTRAINT show_nome_ck CHECK (TRIM(nome) <> '')
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    ano_nasc INT NOT NULL,
    gosto_id INT,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(80) NOT NULL,
    CONSTRAINT usuario_cpf_uq UNIQUE (cpf),
    CONSTRAINT usuario_email_uq UNIQUE (email),
    CONSTRAINT usuario_ano_nasc_ck
        CHECK (ano_nasc BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE)::INT),
    CONSTRAINT usuario_nome_ck CHECK (TRIM(nome) <> ''),
    CONSTRAINT usuario_gosto_id_fk
        FOREIGN KEY (gosto_id)
        REFERENCES genero_musical(id)
);

CREATE TABLE lote_ingresso (
    id SERIAL PRIMARY KEY,
    show_id INT NOT NULL,
    tipo VARCHAR(25) NOT NULL,
    preco NUMERIC(10,2) NOT NULL,
    quantidade INT NOT NULL,
    CONSTRAINT lote_ingresso_show_fk
        FOREIGN KEY (show_id)
        REFERENCES show(id),
    CONSTRAINT lote_ingresso_preco_ck CHECK (preco >= 0),
    CONSTRAINT lote_ingresso_quantidade_ck CHECK (quantidade >= 0),
    CONSTRAINT lote_ingresso_tipo_ck CHECK (TRIM(tipo) <> '')
);

CREATE TABLE ingresso (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    lote_id INT NOT NULL,
    preco_pago NUMERIC(10,2) NOT NULL,
    data_compra TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ingresso_usuario_fk
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),
    CONSTRAINT ingresso_lote_fk
        FOREIGN KEY (lote_id)
        REFERENCES lote_ingresso(id),
    CONSTRAINT ingresso_preco_pago_ck CHECK (preco_pago >= 0)
);

CREATE TABLE show_atracao (
    show_id INT NOT NULL,
    atracao_id INT NOT NULL,
    CONSTRAINT show_atracao_pk PRIMARY KEY (show_id, atracao_id),
    CONSTRAINT show_atracao_show_fk
        FOREIGN KEY (show_id)
        REFERENCES show(id)
        ON DELETE CASCADE,
    CONSTRAINT show_atracao_atracao_fk
        FOREIGN KEY (atracao_id)
        REFERENCES atracao(id)
        ON DELETE CASCADE
);

INSERT INTO genero_musical (nome) VALUES
('Rock'),
('Pop'),
('Sertanejo'),
('Samba'),
('Pagode'),
('Funk'),
('Rap'),
('Trap'),
('MPB'),
('Forró'),
('Piseiro'),
('Axé'),
('Reggae'),
('Eletrônica'),
('Jazz'),
('Blues'),
('R&B'),
('Soul'),
('Gospel'),
('Bossa Nova'),
('Metal'),
('Punk Rock'),
('Indie'),
('K-pop'),
('Reggaeton');

INSERT INTO atracao (nome, nacionalidade, tipo, genero_musical_id) VALUES
('Charlie Brown Jr.', 'Brasileira', 'Banda', 1),
('Anitta', 'Brasileira', 'Cantora', 6),
('Jorge & Mateus', 'Brasileira', 'Dupla', 3);

INSERT INTO local (nome, endereco, capacidade) VALUES
('Arena Music Hall', 'Av. Brasil, 1000, Centro', 5000),
('Estádio Municipal', 'Rua das Palmeiras, 500, Jardim América', 15000),
('Espaço Cultural Central', 'Av. São Carlos, 800, Centro', 3000);

INSERT INTO show (nome, data, local_id, genero_id) VALUES
('Festival Rock Brasil', '2026-11-15 20:00:00-03', 1, 1),
('Noite do Sertanejo', '2026-12-05 21:00:00-03', 2, 3),
('Festival da Música Brasileira', '2027-01-20 19:00:00-03', 3, 2);

INSERT INTO usuario (nome, cpf, ano_nasc, gosto_id, email, senha) VALUES
('João Silva', '123.456.789-00', 2008, 1, 'joao@email.com', '123456'),
('Maria Oliveira', '987.654.321-00', 2007, 2, 'maria@email.com', '123456'),
('Pedro Santos', '456.789.123-00', 2006, 3, 'pedro@email.com', '123456');

INSERT INTO lote_ingresso (show_id, tipo, preco, quantidade) VALUES
(1, 'Pista', 80.00, 2000),
(2, 'Pista', 100.00, 5000),
(3, 'Pista', 60.00, 1500);

INSERT INTO show_atracao (show_id, atracao_id) VALUES
(1, 1),
(2, 3),
(3, 2);

INSERT INTO ingresso (usuario_id, lote_id, preco_pago) VALUES
(1, 1, 80.00),
(2, 2, 100.00),
(3, 3, 60.00);