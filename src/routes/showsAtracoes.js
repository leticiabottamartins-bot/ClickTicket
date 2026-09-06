const express = require("express");
const db = require("../db");
const router = express.Router();
//retorna todos os shows com atrações
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT s.id AS show_id, s.nome AS show_nome, a.id AS atracao_id, a.nome AS atracao_nome from show s JOIN show_atracao sa on sa.show_id = s.id JOIN atracao a ON a.id = sa.atracao_id")
        if (!r.rowCount) {
            throw new Error("Show nao encontrado ou sem atracoes")
        }
        const shows = [];
        for (const linha of r.rows) {
            let show = shows.find(s => s.id_show == linha.id_show);
            if (!show) {
                show = {
                    id_show: linha.show_id,
                    nome_show: linha.show_nome,
                    atracoes: []
                }
                shows.push(show)
            }
            show.atracoes.push({
                id: linha.atracao_id,
                nome: linha.atracao_nome
            })
        }
        return res.status(200).json(shows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//retorna todas as atracoes de um show pelo id dele
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        // const r = await db.query("SELECT * FROM show_atracao WHERE show_id = $1", [id]);
        // if (!r.rowCount) {
        //     throw new Error("Show nao encontrado ou sem atracoes")
        // }
        // const nomeShow = await db.query("SELECT nome from show WHERE id = $1 ", [id]);
        // const nomeIDAtracao = await db.query("SELECT id, nome from atracao a JOIN show_atracao sa ON sa.atracao_id = a.id WHERE sa.show_id = $1", [showId]);
        // return res.status(200).json({ID_show: id, nome_show: nomeShow.rows[0], atracoes: nomeIDAtracao.rows })
        const r = await db.query("SELECT s.id AS show_id, s.nome AS show_nome, a.id AS atracao_id, a.nome AS atracao_nome FROM show s JOIN show_atracao sa on sa.show_id = s.id JOIN atracao a ON a.id = sa.atracao_id WHERE s.id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Show nao encontrado ou sem atrações")
        }
        let atracoes = [];
        for (const linha of r.rows) {
            const atracao = {
                id: linha.atracao_id,
                nome: linha.atracao_nome
            }
            atracoes.push(atracao)
        }

        return res.status(200).json({ id: r.rows[0].show_id, nome: r.rows[0].show_nome, atracoes: atracoes })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//add atracoes a um show
router.post("/", async (req, res) => {
    try {
        const { showId, atracaoId } = Number(req.body) || {}

        if (!Number.isInteger(showId)) {
            throw new Error("ID do show inválido");
        }

        if (!Number.isInteger(atracaoId)) {
            throw new Error("ID da atração inválido");
        }
        const r1 = await db.query("SELECT data FROM show WHERE id = $1", [showId])
        if (!r1.rowCount) {
            throw new Error("Show nao encontrado")
        }
        const r2 = await db.query("SELECT show_id FROM show_atracao sa JOIN show s ON s.id = sa.show_id WHERE sa.atracao_id = $1 AND s.data = $2 AND sa.show_id <> $3", [atracaoId, r1.rows[0].data, showId])
        if (r2.rowCount) {
            throw new Error("Atração já está cadastrada em um show nessa mesma data e horário")
        }
        const r3 = await db.query("INSERT INTO show_atracao (show_id, atracao_id) VALUES ($1, $2) RETURNING *", [showId, atracaoId]);
        if (!r3.rowCount) {
            throw new Error("Atracoes nao adicionadas ao show");
        }
        const r4 = await db.query("SELECT s.nome AS show_nome, s.id AS show_id, a.nome AS atracao_nome, a.id AS atracao_id FROM show s JOIN show_atracao sa ON sa.show_id = s.id JOIN atracao a ON sa.atracao_id = a.id WHERE sa.show_id = $1 AND sa.atracao_id = $2", [showId, atracaoId])
        // const nomeShow = await db.query("SELECT nome from show WHERE id = $1 ", [showId]);
        // const nomeAtracao = await db.query("SELECT nome from atracao WHERE id = $1 ", [atracaoId]);
        return res.status(200).json({ msg: "Atrações adicionadas ao show!", ID_show: r4.rows[0].show_id, nome_show: r4.rows[0].show_nome, ID_atracao: r4.rows[0].atracao_id, nome_atracao: r4.rows[0].atracao_nome });
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//atualiza atracao de um show
router.put("/:showId/:atracaoIdVelha", async (req, res) => {
    try {
        const showId = Number(req.params.showId);
        if (!Number.isInteger(showId)) {
            throw new Error("ID do show invalido")
        }
        const atracaoIdVelha = Number(req.params.atracaoIdVelha);
        if (!Number.isInteger(atracaoIdVelha)) {
            throw new Error("ID da atracao invalido")
        }
        const atracaoId = req.body.atracaoId || {};
        if (!Number.isInteger(atracaoId)) {
            throw new Error("ID da atração nova invalido")
        }
        const r1 = await db.query("SELECT data FROM show WHERE id = $1", [showId])
        if (!r1.rowCount) {
            throw new Error("Show nao encontrado")
        }
        const r2 = await db.query("SELECT show_id FROM show_atracao sa JOIN show s ON s.id = sa.show_id WHERE sa.atracao_id = $1 AND s.data = $2 AND sa.show_id <> $3", [atracaoId, r1.rows[0].data, showId])
        if (r2.rowCount) {
            throw new Error("Atração já está cadastrada em um show nessa mesma data e horário")
        }
        const r3 = await db.query("UPDATE show_atracao SET atracao_id = $1 WHERE show_id = $2 AND atracao_id = $3 RETURNING *",
            [atracaoId, showId, atracaoIdVelha])
        if (!r3.rowCount) {
            throw new Error("Nao foi possivel atualizar o show com atracoes")
        }
        const r4 = await db.query("SELECT s.id AS show_id, s.nome AS show_nome, a.id AS atracao.id, a.nome AS atracao.nome FROM show s JOIN show_atracao sa ON s.id = sa.show_id JOIN atracao a ON sa.atracao_id = a.id WHERE sa.show_id = $1 AND sa.atracao_id = $2 ", [showId, atracaoId])
        return res.status(200).json({ msg: "Atração do show editada com sucesso!", ID_show: r4.rows[0].show_id, nome_show: r4.rows[0].show_nome, ID_atracao: r4.rows[0].atracao_id, nome_atracao: r4.rows[0].atracao_nome })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//deleta atracao de um show
router.delete("/:showId/:atracaoId", async (req, res) => {
    try {
        const showId = Number(req.params.showId);
        if (!Number.isInteger(showId)) {
            throw new Error("ID invalido!")
        }
        const atracaoId = Number(req.params.atracaoId);
        if (!Number.isInteger(atracaoId)) {
            throw new Error("ID invalido!")
        }
        const r = await db.query("DELETE FROM show_atracao where show_id = $1 AND atracao_id = $2 ", [showId, atracaoId])
        if (!r.rowCount) {
            throw new Error("Atração já não é vinculada ao show!")
        }
        return res.status(200).json("Atração cancelada no show!")

    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

module.exports = router;
