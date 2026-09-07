const express = require('express');
const db = require("../db");
const router = express.Router();


//gettar ingresos
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT i.id, i.usuario_id, u.nome AS nome_usuario, s.nome AS nome_show, i.lote_id, li.tipo, i.preco_pago  FROM  ingresso i JOIN lote_ingresso li ON li.id = i.lote_id JOIN show s ON s.id = li.show_id JOIN usuario ON u.id = i.usuario_id");
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
        const r = await db.query("SELECT i.id, i.usuario_id, u.nome AS nome_usuario, s.nome AS nome_show, i.lote_id, li.tipo, i.preco_pago  FROM  ingresso i JOIN lote_ingresso li ON li.id = i.lote_id JOIN show s ON s.id = li.show_id JOIN usuario ON u.id = i.usuario_id WHERE id = $1", [id])
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
        const { usuario_id, lote_id, preco_pago } = req.body || {};
        if (!Number.isInteger(Number(usuario_id)) || !Number.isInteger(Number(lote_id)) || preco_pago < 0) {
            throw new Error("Parametros invalidos")
        }
        const r1 = await db.query("SELECT * FROM usuario WHERE id =$1 ", [usuario_id])
        if (!r1.rowCount) {
            throw new Error("Usuário não existe")
        }
        const r2 = await db.query("SELECT quantidade FROM lote_ingresso WHERE id = $1", [lote_id])
        if (!r2.rowCount) {
            throw new Error("Lote não existe")
        }
        const quantidade = 0
        for (const linha of r2) {
            quantidade += Number(linha)
        }


        const r6 = await db.query("SELECT * FROM ingresso WHERE lote_id = $1", [lote_id])
        if (quantidade - r6.rowCount < 1) {
            throw new Error("Ingressos esgotados")
        }
        const r3 = await db.query("INSERT INTO ingresso ( usuario_id, lote_id, preco_pago) VALUES($1,$2,$3) RETURNING *", [usuario_id, lote_id, preco_pago])
        if (!r3.rowCount) {
            throw new Error("Não foi possivel comprar o ingresso")
        }
        const r4 = await db.query("SELECT i.id, i.usuario_id, u.nome AS nome_usuario, s.nome AS nome_show, i.lote_id, li.tipo, i.preco_pago  FROM  ingresso i JOIN lote_ingresso li ON li.id = i.lote_id JOIN show s ON s.id = li.show_id JOIN usuario ON u.id = i.usuario_id WHERE id = $1", [r3.rows[0].id])
        return res.status(201).json({ msg: "Ingresso vendido com sucesso", ingresso: r4.rows[0] })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})
//editar ingresso 
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const { usuario_id, lote_id, preco_pago } = req.body || {};
        if (!Number.isInteger(Number(usuario_id)) || !Number.isInteger(Number(lote_id)) || preco_pago < 0) {
            throw new Error("Parametros invalidos")
        }
        const r1 = await db.query("SELECT * FROM usuario WHERE id =$1 ", [usuario_id])
        if (!r1.rowCount) {
            throw new Error("Usuário não existe")
        }
        const r2 = await db.query("SELECT quantidade FROM lote_ingresso WHERE id = $1", [lote_id])
        if (!r2.rowCount) {
            throw new Error("Lote não existe")
        }
        const quantidade = 0
        for (const linha of r2) {
            quantidade += Number(linha)
        }


        const r6 = await db.query("SELECT * FROM ingresso WHERE lote_id = $1", [lote_id])
        if (quantidade - r6.rowCount < 1) {
            throw new Error("Ingressos esgotados")
        }

        const r3 = await db.query("UPDATE ingresso SET usuario_id = $1, lote_id = $2, preco_pago = $3 WHERE id = $5", [usuario_id, lote_id, preco_pago, id])
        if (!r3.rowCount) {
            throw new Error("Não foi possível editar o ingresso")
        }
        const r4 = await db.query("SELECT i.id, i.usuario_id, u.nome AS nome_usuario, s.nome AS nome_show, i.lote_id, li.tipo, i.preco_pago  FROM  ingresso i JOIN lote_ingresso li ON li.id = i.lote_id JOIN show s ON s.id = li.show_id JOIN usuario ON u.id = i.usuario_id WHERE id = $1", [id])
        return res.status(200).json({ msg: "Ingresso editado com sucesso", ingresso: r4.rows[0] })


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