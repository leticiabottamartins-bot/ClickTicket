const express = require("express");
const db = require("../db");
const router = express.Router();

// gettar locais
router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM local")
        if (!r.rowCount) {
            throw new Error("Locais não encontrados :(")
        }
        return res.status(200).json(r.rows);

    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
});



// retorna locais os quais tem shows associados
router.get("/comshow", async (req, res) => {
    try {
        const r = await db.query(`
            SELECT 
                l.id AS local_id,
                l.nome AS local_nome,
                l.endereco AS local_endereco,
                l.capacidade AS local_capacidade,
                s.id AS show_id,
                s.nome AS show_nome,
                s.data AS show_data
            FROM local l
            INNER JOIN show s ON s.local_id = l.id
        `);
        if (!r.rowCount) {
            throw new Error("Nenhum local com show atribuído")
        }
        return res.status(200).json(r.rows);
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
});


// gettar local por id
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID inválido :(")
        }
        const r = await db.query("SELECT * FROM local WHERE id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Local não encontrado")
        }
        return res.status(200).json(r.rows[0]);
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
});

// postar local
router.post("/", async (req, res) => {
    try {
        const { nome, endereco, capacidade } = req.body || {};
        if (!nome || !endereco || !Number.isInteger(capacidade)) {
            throw new Error("Parâmetros inválidos")
        }
        if (nome.length < 2) {
            throw new Error("Nome inválido")
        }
        if (endereco.length < 25) {
            throw new Error("Endereço inválido")
        }
        if (!Number.isInteger(capacidade) || capacidade < 1) {
            throw new Error("Capacidade inválida")
        }

        const r = await db.query("INSERT INTO local (nome, endereco, capacidade) VALUES ($1, $2, $3) RETURNING *", [nome, endereco, capacidade])
        if (!r.rowCount) {
            throw new Error("Local não criado")
        }

        return res.status(201).json({ msg: "Local criado com sucesso :)", local: r.rows[0] });
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
});

// editar local
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome, endereco, capacidade } = req.body || {};
        if (!Number.isInteger(id) || !nome || !endereco || !Number.isInteger(capacidade)) {
            throw new Error("Parâmetros inválidos")
        }
        if (nome.length < 2) {
            throw new Error("Nome inválido")
        }
        if (endereco.length < 25) {
            throw new Error("Endereço inválido")
        }
        if (!Number.isInteger(capacidade) || capacidade < 1) {
            throw new Error("Capacidade inválida")
        }
        const r = await db.query("SELECT l.nome AS local_nome, s.nome AS show_nome FROM local l INNER JOIN show s ON l.id = s.local_id WHERE l.id = $1", [id]);
        if (r.rowCount) {
            throw new Error(`Local não pode ser editado, pois está associado ao show ${r.rows[0].show_nome} do local ${r.rows[0].local_nome}`)
        }
        const r2 = await db.query("UPDATE local SET nome = $1, endereco = $2, capacidade = $3 WHERE id = $4 RETURNING *", [nome, endereco, capacidade, id])
        if (!r2.rowCount) {
            throw new Error("Local não encontrado")
        }
        return res.status(200).json({ msg: "Local atualizado com sucesso :)", local: r2.rows[0] });
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
});




// deletar local
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("Id inválido")
        }

        const r = await db.query("SELECT l.nome AS local_nome, s.nome AS show_nome FROM local l INNER JOIN show s ON l.id = s.local_id WHERE l.id = $1", [id]);
        if (r.rowCount) {
            throw new Error(`Local não pode ser deletado, pois está associado ao show ${r.rows[0].show_nome} do local ${r.rows[0].local_nome}`)
        }

        const r2 = await db.query("DELETE FROM local WHERE id = $1", [id])
        if (!r2.rowCount) {
            throw new Error("Local não encontrado")
        }

        return res.status(200).json({ msg: "Local deletado com sucesso :)" });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }

});





module.exports = router;