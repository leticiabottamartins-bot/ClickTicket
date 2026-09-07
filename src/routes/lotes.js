const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT li.id, li.show_id, s.nome AS nome_show, li.tipo, li.preco, li.quantidade FROM lote_ingresso li JOIN show s ON s.id = li.show_id")
        if (!r.rowCount) {
            throw new Error("Lotes de ingressos não disponíveis")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

//devolver ingressos por faixa de preço
router.get("/faixadepreco", async (req, res) => {
    try {
        const minimo = Number(req.query.minimo);
        const maximo = Number(req.query.maximo);
        if (!Number.isFinite(minimo) || minimo < 0 || !Number.isFinite(maximo)) {
            throw new Error("Mínimo e máximo inválidos")
        }
        const r = await db.query(
            "SELECT li.id, li.show_id, s.nome AS nome_show, li.tipo, li.preco, li.quantidade FROM lote_ingresso li JOIN show s ON s.id = li.show_id WHERE li.preco >= $1 AND li.preco <= $2",
            [minimo, maximo]
        )
        if (!r.rowCount) {
            throw new Error("Não foi possivel encontrar ingressos nessa faixa de preço")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID do lote inválido")
        }
        const r = await db.query("SELECT li.id, li.show_id, s.nome AS nome_show, li.tipo, li.preco, li.quantidade FROM lote_ingresso li JOIN show s ON s.id = li.show_id WHERE li.id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Lote com esse ID não encontrado")
        }
        return res.status(200).json(r.rows[0])
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const { tipo, preco, quantidade } = req.body || {};
        const show_id = Number(req.body.show_id);
        const quantidadeNum = Number(quantidade);
        if (!Number.isInteger(show_id) || !Number.isInteger(quantidadeNum) || !tipo || !preco) {
            throw new Error("Parâmetros inválidos")
        }

        const rShow = await db.query("SELECT capacidade FROM show s JOIN local l ON l.id = s.local_id WHERE s.id = $1", [show_id])
        if (!rShow.rowCount) {
            throw new Error("Show não encontrado")
        }

        const rExistentes = await db.query("SELECT quantidade FROM lote_ingresso WHERE show_id = $1", [show_id])
        let quantidadeTotal = 0;
        for (const linha of rExistentes.rows) {
            quantidadeTotal += Number(linha.quantidade)
        }
        if (rShow.rows[0].capacidade - quantidadeTotal < quantidadeNum) {
            throw new Error("Capacidade do show já foi atingida")
        }

        const r = await db.query("INSERT INTO lote_ingresso (show_id, tipo, preco, quantidade) VALUES ($1, $2, $3, $4) RETURNING *", [show_id, tipo, preco, quantidadeNum])
        if (!r.rowCount) {
            throw new Error("Lote não pôde ser inserido")
        }
        const rNomeShow = await db.query("SELECT nome FROM show WHERE id = $1", [show_id])
        return res.status(201).json({ id_lote: r.rows[0].id, id_show: r.rows[0].show_id, nome: rNomeShow.rows[0].nome, tipo: r.rows[0].tipo, preco: r.rows[0].preco, quantidade_ingressos: r.rows[0].quantidade })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

module.exports = router;