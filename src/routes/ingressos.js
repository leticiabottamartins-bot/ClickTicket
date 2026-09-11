const express = require('express');
const db = require("../db");
const router = express.Router();

const SELECT_INGRESSO = `SELECT i.id, i.usuario_id, u.nome AS nome_usuario, s.nome AS nome_show, i.lote_id, li.tipo, li.preco
    FROM ingresso i
    JOIN lote_ingresso li ON li.id = i.lote_id
    JOIN show s ON s.id = li.show_id
    JOIN usuario u ON u.id = i.usuario_id`;

//gettar ingresos
router.get("/", async (req, res) => {
    try {
        const r = await db.query(SELECT_INGRESSO);
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
        const r = await db.query(`${SELECT_INGRESSO} WHERE i.id = $1`, [id])
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
        let { usuario_id, lote_id } = req.body || {};
        usuario_id = Number (usuario_id)
        lote_id = Number (lote_id)
        if (
            !Number.isInteger(usuario_id) ||
            !Number.isInteger(lote_id)
        ) {
            throw new Error("Parâmetros inválidos");
        }
        const ingresso = await db.transaction(async (conexao) => {


            const r1 = await conexao.query(
                "SELECT id FROM usuario WHERE id = $1",
                [usuario_id]
            );

            if (!r1.rowCount) {
                throw new Error("Usuário não existe");
            }

            const r2 = await conexao.query(
                `UPDATE lote_ingresso
             SET disponivel = disponivel - 1
             WHERE id = $1
             AND disponivel > 0
             RETURNING *`,
                [lote_id]
            );

            if (!r2.rowCount) {
                throw new Error("Lote não existe ou ingressos esgotados");
            }

            const r3 = await conexao.query(
                `INSERT INTO ingresso (usuario_id, lote_id)
             VALUES ($1, $2)
             RETURNING *`,
                [usuario_id, lote_id]
            );

            if (!r3.rowCount) {
                throw new Error("Não foi possível comprar o ingresso");
            }
            const r4 = await conexao.query(`${SELECT_INGRESSO} WHERE i.id = $1`, [r3.rows[0].id])


            return r4.rows[0]

            
        })
        return res.status(201).json({ msg: "Ingresso vendido com sucesso", ingresso: ingresso })
    } catch (error) {
        return res.status(400).json({
            msg: error.message
        });
    }
});


//editar ingresso
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        let { usuario_id } = req.body || {};
        usuario_id = Number (usuario_id)

        if (
            !Number.isInteger(usuario_id)
        ) {
            throw new Error("Parâmetros inválidos");
        }
        const ingresso = await db.transaction (async (conexao)=> {

        
        const r1 = await conexao.query(
            "SELECT id FROM usuario WHERE id = $1",
            [usuario_id]
        );

        if (!r1.rowCount) {
            throw new Error("Usuário não existe");
        }

        const r2 = await conexao.query(
            `SELECT id FROM ingresso WHERE id = $1 FOR UPDATE`,
            [id]
        );

        if (!r2.rowCount) {
            throw new Error("Ingresso não existe");
        }

        const r3 = await conexao.query("UPDATE ingresso SET usuario_id = $1 WHERE id = $2", [usuario_id, id])
        if (!r3.rowCount) {
            throw new Error("Não foi possível editar o ingresso")
        }
        const r4 = await conexao.query(`${SELECT_INGRESSO} WHERE i.id = $1`,
                [id])
        return r4.rows[0]
        })
        return res.status(200).json({ msg: "Ingresso editado com sucesso", ingresso: ingresso })

    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})


//deletar ingresso
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            throw new Error("ID do ingresso inválido");
        }

        await db.transaction(async (conexao) => {

            
            const r1 = await conexao.query(
                `SELECT lote_id
                 FROM ingresso
                 WHERE id = $1
                 FOR UPDATE`,
                [id]
            );

            if (!r1.rowCount) {
                throw new Error("Ingresso não encontrado");
            }

            const lote_id = r1.rows[0].lote_id;

        
            const r2 = await conexao.query(
                "DELETE FROM ingresso WHERE id = $1",
                [id]
            );

            if (!r2.rowCount) {
                throw new Error(
                    "Não foi possível excluir o ingresso"
                );
            }

    
            const r3 = await conexao.query(
                `UPDATE lote_ingresso
                 SET disponivel = disponivel + 1
                 WHERE id = $1
                 AND disponivel < quantidade
                 RETURNING *`,
                [lote_id]
            );

            if (!r3.rowCount) {
                throw new Error(
                    "Não foi possível atualizar a disponibilidade do lote"
                );
            }
        });

        return res.status(200).json({
            msg: "Ingresso excluído com sucesso"
        });

    } catch (error) {
        return res.status(400).json({
            msg: error.message
        });
    }
});


module.exports = router;