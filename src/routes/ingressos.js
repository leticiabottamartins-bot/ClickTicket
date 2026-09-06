const express = require('express');
const db = require("../db");
const router = express.Router();


//gettar ingresos
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM  ingresso");
        if (!r.rowCount) {
            throw new Error("Ingressos não encontrados");
        }
        return res.status(200).json(r.rows);
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
});


//gettar ingresso por id

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID do ingresso invalido")
        }
        const r = await db.query("SELECT * FROM ingresso WHERE id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Ingresso não encontrado")
        }
        return res.status(200).json(r.rows[0]);
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})
//postar ingresso
router.post("/", async (req, res) => {
    try {
        const { usuario_id, show_id, tipo, preco } = req.body || {};
        if (!Number.isInteger(usuario_id) || !Number.isInteger(show_id) || !tipo) {
            throw new Error("Parametros invalidos")
        }
        if (preco < 0) {
            throw new Error("Preço inválido")
        }
        const r1 = await db.query("SELECT * FROM usuario WHERE id =$1 ", [usuario_id])
        if (!r1.rowCount) {
            throw new Error("Usuário não existe")
        }
        const r2 = await db.query("SELECT * FROM show WHERE id = $1", [show_id])
        if (!r2.rowCount) {
            throw new Error("Show não existe")
        }

        const r3 = await db.query("INSERT INTO ingresso ( usuario_id, show_id, tipo, preco) VALUES($1,$2,$3,$4) RETURNING *", [usuario_id, show_id, tipo, preco])
        if (!r3.rowCount) {
            throw new Error("Não foi possivel criar um ingresso")
        }
        return res.status(201).json({ msg: "Ingresso vendido com sucesso", ingresso: r3.rows[0] })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//editar ingresso 
router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const { usuario_id, show_id, tipo, preco } = req.body || {};
        if (!Number.isInteger(usuario_id) || !Number.isInteger(show_id) || !tipo) {
            throw new Error("Parametros invalidos")
        }
        if (preco < 0) {
            throw new Error("Preço invalido")
        }

        const r1 = await db.query("SELECT * FROM usuario WHERE id =$1 ", [usuario_id])
        if (!r1.rowCount) {
            throw new Error("Usuário não existe")
        }
        const r2 = await db.query("SELECT * FROM show WHERE id = $1", [show_id])
        if (!r2.rowCount) {
            throw new Error("Show não existe")
        }

        const r3 = await db.query("UPDATE ingresso SET usuario_id = $1, show_id = $2, tipo = $3, preco = $4 WHERE id = $5", [usuario_id, show_id, tipo, preco, id])
        if (!r3.rowCount) {
            throw new Error("Não foi possível editar o ingresso")
        } 
        return res.status(200).json({ msg: "Ingresso editado com sucesso" })


    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})


//deletar ingresso
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const r = await db.query("DELETE FROM ingresso WHERE id=$1", [id])
        if (!r.rowCount) {
            throw new Error("Não foi possivel deletar ingresso")
        }
        return res.status(200).json({ msg: "Ingresso deletado com sucesso" })
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
})

module.exports = router;