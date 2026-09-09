const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const r = await db.query("SELECT s.id, s.nome, s.data, l.nome AS local FROM show s JOIN local l ON s.local_id = l.id ;");
        if (!r.rowCount) {
            throw new Error("Shows não encontrados")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

//recomendar shows q ocorrerao em tres meses
router.get("/embreve", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM show WHERE data BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + INTERVAL '3 months'")
        if (!r.rowCount) {
            throw new Error("Nenhum show nos próximos três meses")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(400).json({ msg: error.message })
    }
})


//shows mais populares
router.get("/populares", async (req, res) => {
    try {
        const r = await db.query(`
            SELECT s.id, s.nome, s.data, COUNT(i.id) AS total_ingressos
            FROM show s
            JOIN lote_ingresso l ON l.show_id = s.id
            JOIN ingresso i ON i.lote_id = l.id
            GROUP BY s.id, s.nome, s.data
            ORDER BY total_ingressos DESC
        `);
        if (!r.rowCount) {
            throw new Error("Nenhum show com ingressos vendidos ainda")
        }
        return res.status(200).json(r.rows)
    } catch (error) {
        return res.status(404).json({ msg: error.message })
    }
})

//faturamento de um show
router.get("/faturamento/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            throw new Error("ID do show inválido");
        }

        const r1 = await db.query(
            "SELECT nome FROM show WHERE id = $1",
            [id]
        );

        if (!r1.rowCount) {
            throw new Error("Show não encontrado");
        }

        const r2 = await db.query(
            `SELECT COALESCE(SUM(li.preco), 0) AS faturamento
             FROM ingresso i
             JOIN lote_ingresso li ON li.id = i.lote_id
             WHERE li.show_id = $1`,
            [id]
        );

        return res.status(200).json({
            show: r1.rows[0].nome,
            faturamento: r2.rows[0].faturamento
        });

    } catch (error) {
        return res.status(400).json({
            msg: error.message
        });
    }
});



//shows por local
router.get("/local/:id", async (req, res) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id)) {
            throw new Error("ID inválido")
        }
        const r = await db.query("SELECT * FROM show WHERE local_id = $1 ", [id])
        if (!r.rowCount) {
            throw new Error("Nenhum show encontrado nesse local")
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
            throw new Error("ID invalido")
        }
        const r = await db.query("SELECT s.id, s.nome, s.data, l.nome AS local FROM show s JOIN local l ON s.local_id = l.id WHERE s.id = $1", [id])
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
        const { nome, data, horario } = req.body || {}
        if (!nome || !data || !horario) {
            throw new Error("Parâmetros inválidos");
        }
        const [dia, mes, ano] = data.split("/");
        const [hora, minuto] = horario.split(":");
        const dataRecebida = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto)
        );
        if (isNaN(dataRecebida.getTime())) {
            throw new Error("Data ou horário em formato inválido");
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
        }
        const r2 = await db.query("SELECT * FROM show WHERE local_id = $1 AND data = $2", [local_id, dataRecebida.toISOString()]);
        if (r2.rowCount) {
            throw new Error("Um show já acontecerá nesse mesmo local e data.")
        }
        const r3 = await db.query("INSERT INTO show (nome, data, local_id) VALUES ($1, $2, $3) RETURNING *", [nome, dataRecebida.toISOString(), local_id])
        const r4 = await db.query("SELECT s.id, s.nome, s.data, l.nome AS local FROM show s JOIN local l ON s.local_id = l.id WHERE s.id = $1", [r3.rows[0].id])
        return res.status(201).json({ msg: "Show adicionado", show: r4.rows[0] })



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
        if (!nome || !data || !horario) {
            throw new Error("Parâmetros inválidos");
        }
        const [dia, mes, ano] = data.split("/");
        const [hora, minuto] = horario.split(":");
        const dataRecebida = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto)
        );
        if (isNaN(dataRecebida.getTime())) {
            throw new Error("Data ou horário em formato inválido");
        }
        if (dataRecebida <= new Date()) {
            throw new Error("A data e horário devem ser maiores que o momento atual.");
        }
        const r1 = await db.query("SELECT * from local WHERE id = $1;", [local_id]);
        if (!r1.rowCount) {
            throw new Error("Local não existe");
        } 
            const r2 = await db.query("SELECT * FROM show WHERE local_id = $1 AND data = $2 AND id <> $3", [local_id, dataRecebida.toISOString(), id]);
            if (r2.rowCount) {
                throw new Error("Um show já acontecerá nesse mesmo local e data.")
            }
            const r3 = await db.query("UPDATE show SET nome = $1, data = $2, local_id = $3 WHERE id = $4 RETURNING *", [nome, dataRecebida.toISOString(), local_id, id])
            if (!r3.rowCount) {
                throw new Error("Nao foi possivel alterar o show")
            }
            const r4 = await db.query("SELECT s.id, s.nome, s.data, l.nome AS local FROM show s JOIN local l ON s.local_id = l.id WHERE s.id = $1", [r3.rows[0].id])
            return res.status(200).json({ msg: "Show editado", show: r4.rows[0] })
        

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



module.exports = router;

