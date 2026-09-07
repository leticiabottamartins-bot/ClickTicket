const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM show;");
        if (!r.rowCount) {
            throw new Error("Shows não encontrados")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const r = await db.query("SELECT * FROM show WHERE id = $1", [id])
        if (!r.rowCount) {
            throw new Error("Show com este ID não encontrado")
        }
        return res.status(200).json(r.rows[0])
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

router.post("/", async (req, res) => {
    try {
        const { nome, data, horario} = req.body || {}
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
        const local_id = Number(req.body.local_id);
        if (!Number.isInteger(local_id)) {
            throw new Error("ID do local invalido")
        }

        const r1 = await db.query("SELECT * from local WHERE id = $1;", [local_id]);
        if (!r1.rowCount) {
            throw new Error("Local não existe");
        } else {
            const r2 = await db.query ("SELECT * FROM show WHERE local_id = $1 AND data = $2", [local_id, dataRecebida.toISOString()]);
            if (r2.rowCount) {
                throw new Error ("Um show já acontecerá nessa mesmo local e data.")
            }
            const r3 = await db.query("INSERT INTO show (nome, data, local_id) VALUES ($1, $2, $3) RETURNING *", [nome, dataRecebida.toISOString(), local_id])
            return res.status(200).json({ msg: "Show adicionado", nome: r3.rows[[0]] })
        }


    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const nome = req.body.nome;
        const local_id = Number(req.body.local_id);
        if (!Number.isInteger(local_id)) {
            throw new Error("ID do local invalido")
        }
        const data = req.body.data;
        const horario = req.body.horario;
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
        const r1 = await db.query("SELECT * from local WHERE id = $1;", [local_id]);
        if (!r1.rowCount) {
            throw new Error("Local não existe");
        } else {
            const r2 = await db.query ("SELECT * FROM show WHERE local_id = $1 AND data = $2", [local_id, dataRecebida.toISOString()]);
            if (r2.rowCount) {
                throw new Error ("Um show já acontecerá nessa mesmo local e data.")
            }
            const r3 = await db.query("UPDATE show SET nome = $1, data = $2, local_id = $3 WHERE id = $4", [nome, dataRecebida.toISOString(), local_id, id])
            if (!r3.rowCount) {
                throw new Error ("Nao foi possivel alterar o show")
            }
            return res.status(200).json({ msg: "Show adicionado", show: r3.rows[0] })
        }


    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            throw new Error("ID invalido")
        }
        const r = await db.query("DELETE FROM show WHERE id = $1 ", [id]);
        if (!r.rowCount) {
            throw new Error("Show não existe")
        }
        return res.status(200).json({ msg: "Show deletado!" })
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
});

//recomendar shows q ocorrerao em tres meses
router.get("/embreve", async (req, res)=> {
    try{
        const id= Number(req.params.id)
        if (!Number.isInteger(id)) {
            throw new Error ("ID inválido")
        }
        const r = await db.query ("SELECT * FROM show WHERE data BETWEEN CURRENT TIME_STAMP AND CURRENT TIME_STAMP + INTERVAL '3 months'")
        if (!r.rowCount) {
            throw new Error ("Nenhum show nos próximos três meses")
        }
        return res.status(200).json(r.rows)
    }catch(error) {
        return res.status(400).json({msg: error.message})
    }
})

//shows mais populares

//faturamento de um show
module.exports = router;
