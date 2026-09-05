const express = require("express");
const dayjs = require('dayjs');
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM show;");
        if (!r.rowCount) {
            throw new Error("Shows nao encontrados")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const r = await db.query("SELECT * FROM show WHERE id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Show com este id nao encontrado")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const agora = new Date();
        const nome = req.body.nome || {};
        const data = req.body.data || {};
        const horario = req.body.horario || {};
        const genero = req.body.genero || {};
        const [dia, mes, ano] = data.split("/");
        const [hora, minuto] = horario.split(":");
        const dataRecebida = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto)
        );
        if (nome.length < 2 || !nome) {
            throw new Error("Nome do show invalido");
        }
        if (dataRecebida <= new Date()) {
            throw new Error("A data e horário devem ser maiores que o momento atual.");
        }
        const local_id = req.body.local_id || {};
        const r1 = await db.query("SELECT * from local WHERE id = $1;", [local_id]);
        if (!r1.rowCount) {
            throw new Error("Local não existe");
        } else {
            const r2 = await db.query("INSERT INTO show (nome, data, local_id, genero) VALUES ($1, $2, $3, $4)", [nome, dataRecebida.toISOString(), local_id, genero])
            return res.status(201).json({ msg: "Show adicionado", nome: r2.rows[0] })
        }
       

    } catch (error) {
        return res.status(400).json({msg: error.message})
    }
})

router.put("/:id", async (req, res)=> {
    try {
        const agora = new Date();
        const id = req.params.id;
        const nome = req.body.nome || {};
        const local_id = req.body.local_id || {};
        const data = req.body.data || {};
        const horario = req.body.horario || {};
        const genero = req.body.genero || {};
        const [dia, mes, ano] = data.split("/");
        const [hora, minuto] = horario.split(":");
        const dataRecebida = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto)
        );
        if (nome.length < 2 || !nome) {
            throw new Error("Nome do show invalido");
        }
        if (dataRecebida <= new Date()) {
            throw new Error("A data e horário devem ser maiores que o momento atual.");
        }
        const r1 = await db.query("SELECT * FROM local WHERE id = $1;", [local_id]);
        if (!r1.rowCount) {
            throw new Error("Local não existe");
        } else {
            const r2 = await db.query("UPDATE show SET nome = $1, data = $2, local_id = $3, genero = $4 WHERE id = $5 RETURNING *", [nome, dataRecebida.toISOString(), local_id, genero, id])
            return res.status(200).json({ msg: "Show adicionado", nome: r2.rows[0] })
        }
        

    }catch(error) {
        return res.status(400).json({msg: error.message})
    }
})

router.delete ("/:id", async (req, res)=> {
    try{
        const id = req.params.id;
        const r = await db.query ("DELETE FROM show WHERE id = $1 ", [id]);
        if (!r.rowCount) {
            throw new Error ("Show ja nao existe")
        }
        return res.status(200).json ({msg: "Show deletado!"})
    }catch(error){
        return res.status(400).json({msg: error.message})
    }
});

module.exports = router;