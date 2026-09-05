const express = require("express");
const db = require("../db");
const router = express.Router();
//retorna todos os shows com atrações
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * from show_atracao")
        if (!r.rowCount) {
            throw new Error("Shows com atrações não encontrados")
        }
        return res.status(200).json(r.rows)
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
        const r = await db.query("SELECT * FROM show_atracao WHERE show_id = $1", [id]);
        if (!r.rowCount) {
            throw new Error("Show nao encontrado ou sem atracoes")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//add atracoes a um show
router.post("/", async (req, res) => {
    try {
        const showId = req.body.showId || {};
        const atracaoId = req.body.atracaoId || {};
        if (!Number.isInteger(showId)) {
            throw new Error("ID do show inválido");
        }

        if (!Number.isInteger(atracaoId)) {
            throw new Error("ID da atração inválido");
        }
        if (!showId) {
            throw new Error("Id do show incompleto")
        } else if (!atracaoId) {
            throw new Error("Id da atracao incompleta")
        }
        const r = await db.query("INSERT INTO show_atracao (show_id, atracao_id) VALUES ($1, $2) RETURNING *", [showId, atracaoId]);
        if (!r.rowCount) {
            throw new Error("Atracoes nao adicionadas ao show");
        }
        return res.status(200).json(r.rows);
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//atualiza atracoes de um show
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
            throw new Error("ID invalido")
        }
        const r = await db.query("UPDATE show_atracao SET atracao_id = $1 WHERE show_id = $2 AND atracao_id = $3 RETURNING *",
    [atracaoId, showId, atracaoIdVelha])
        if (!r.rowCount) {
            throw new Error("Nao foi possivel atualizar o show com atracoes")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//deleta atracoes de um show
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const r = await db.query("DELETE FROM show_atracao where show_id = $1 ", [id])
        if (!r.rowCount) {
            throw new Error("Show com atracoes ja nao existe")
        }
        return res.status(200).json("Show com atracoes deletado")

    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

module.exports = router;
