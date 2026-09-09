const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT li.show_id, s.id, s.nome AS nome_show, li.tipo, li.preco, li.quantidade, li.disponivel FROM lote_ingresso li JOIN show s ON s.id = li.show_id")
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
        const r = await db.query("SELECT li.show_id, s.id, s.nome AS nome_show, li.tipo, li.preco, li.quantidade, li.disponivel FROM lote_ingresso li JOIN show s ON s.id = li.show_id WHERE id = $1", [id])
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
        let { tipo, preco, quantidade } = req.body || {};
        const show_id = Number(req.body.show_id);
        quantidade = Number(quantidade);
        preco = Number(preco)
        if (!Number.isInteger(show_id) || !Number.isInteger(quantidade) || !tipo || preco < 0 || !Number.isFinite(preco) || quantidade < 0) {
            throw new Error("Parâmetros inválidos")
        }
        const r5 = await db.query("SELECT * FROM show WHERE id = $1", [show_id])
        if (!r5.rowCount) {
            throw new Error("Show não existe")
        }
        let quantidadeTotal = 0;
        const r3 = await db.query("SELECT quantidade FROM lote_ingresso WHERE show_id = $1", [show_id])
        for (const linha of r3.rows) {
            quantidadeTotal += Number(linha.quantidade)
        }
        const r4 = await db.query("SELECT l.capacidade FROM local l JOIN show s ON s.local_id = l.id WHERE s.id = $1", [show_id])
        if ((r4.rows[0].capacidade - quantidadeTotal) < Number(quantidade)) {
            throw new Error("Capacidade do show já foi atingida")
        }
        const r = await db.query("INSERT INTO lote_ingresso (show_id, tipo, preco, quantidade, disponivel) VALUES ($1, $2, $3, $4, $5) RETURNING *", [show_id, tipo, preco, quantidade, quantidade])
        if (!r.rowCount) {
            throw new Error("Lote não pôde ser inserido")
        }

        const r2 = await db.query("SELECT nome FROM show WHERE id = $1", [r.rows[0].show_id])
        return res.status(200).json({ id_lote: r.rows[0].id, id_show: r.rows[0].show_id, nome: r2.rows[0].nome, tipo: r.rows[0].tipo, preco: r.rows[0].preco, quantidade_ingressos: r.rows[0].quantidade, disponiveis: r.rows[0].disponivel })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        let { show_id, tipo, preco, quantidade } = req.body || {};
        show_id = Number(show_id)
        quantidade = Number(quantidade)
        preco = Number(preco)

        if (!Number.isInteger(show_id) || !Number.isInteger(id) || !Number.isInteger(quantidade) || quantidade < 0 || !Number.isFinite(preco) || preco < 0 ||!tipo) {
            throw new Error("Parâmetros inválidos")
        }
        const r5 = await db.query("SELECT * FROM show WHERE id = $1", [show_id])
        if (!r5.rowCount) {
            throw new Error("Show não existe")
        }
        // Verifica se o lote existe e descobre quantos ingressos já foram vendidos
        const r6 = await db.query(
            `SELECT 
                li.quantidade,
                li.disponivel,
                COUNT(i.id) AS vendidos
             FROM lote_ingresso li
             LEFT JOIN ingresso i ON i.lote_id = li.id
             WHERE li.id = $1
             GROUP BY li.id`,
            [id]
        );
        if (!r6.rowCount) {
            throw new Error("Lote não existe")
        }

        const vendidos = Number(r6.rows[0].vendidos);

        // A nova quantidade precisa comportar os ingressos que já foram vendidos
        if (quantidade < vendidos) {
            throw new Error("A quantidade não pode ser menor que os ingressos já vendidos")
        }
        const disponivel = quantidade - vendidos
        let quantidadeTotal = 0;
        const r3 = await db.query("SELECT quantidade FROM lote_ingresso WHERE show_id = $1 AND id <> $2 ", [show_id, id])
        for (const linha of r3.rows) {
            quantidadeTotal += Number(linha.quantidade)
        }
        const r4 = await db.query("SELECT l.capacidade FROM local l JOIN show s ON s.local_id = l.id WHERE s.id = $1", [show_id])
        if ((r4.rows[0].capacidade - quantidadeTotal) < quantidade) {
            throw new Error("Capacidade do show já foi atingida")
        }
        const r = await db.query("UPDATE lote_ingresso SET show_id = $1, tipo = $2, preco = $3, quantidade = $4, disponivel = $5 WHERE id = $6  RETURNING *", [show_id, tipo, preco, quantidade, disponivel, id])
        if (!r.rowCount) {
            throw new Error("Lote não pôde ser inserido")
        }

        const r2 = await db.query("SELECT nome FROM show WHERE id = $1", [r.rows[0].show_id])
        return res.status(200).json({ msg: "Uhull, lote de ingressos atualizado!", id_lote: r.rows[0].id, id_show: r.rows[0].show_id, nome: r2.rows[0].nome, tipo: r.rows[0].tipo, preco: r.rows[0].preco, quantidade_ingressos: r.rows[0].quantidade, disponiveis: r.rows[0].disponivel })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

module.exports = router;