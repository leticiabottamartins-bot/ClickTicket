const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM atracao;");
    if (!r.rowCount) {
      throw new Error("Nenhuma atração encontrada!")
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
      throw new Error("ID inválido!")
    }
    const r = await db.query("SELECT * FROM atracao WHERE id = $1", [id]);
    if (!r.rowCount) {
      throw new Error("Atração não cadastrada");
    }
    return res.status(200).json(r.rows[0]);
  } catch (error) {
    return res.status(404).json({ msg: error.message });
  }
})

router.post("/", async (req, res) => {
  try {
    let { nome, nacionalidade, tipo, genero_musical_id } = req.body || {}
    genero_musical_id = Number(genero_musical_id)
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto");
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta");
    } else if (!Number.isInteger(genero_musical_id)) {
      throw new Error("ID do Gênero musical inválido");
    }
    const tiposValidos = ["banda", "cantor", "cantora", "dj", "dupla", "grupo"];

    if (!tipo || typeof tipo !== "string") {
      throw new Error("Tipo de atração inválido");
    }

    tipo = tipo.trim().toLowerCase();

    if (!tiposValidos.includes(tipo)) {
      throw new Error("Tipo de atração inválido");
    }
    const r1 = await db.query(
      "SELECT * FROM genero_musical WHERE id = $1",
      [genero_musical_id]
    );

    if (!r1.rowCount) {
      throw new Error("Gênero musical não existe");
    }
    else {
      const r = await db.query("INSERT INTO atracao (nome, nacionalidade, tipo, genero_musical_id) VALUES ($1, $2, $3, $4) RETURNING *", [nome, nacionalidade, tipo, genero_musical_id]);
      if (!r.rowCount) {
        throw new Error("Atração não adicionada");
      } else {
        return res.status(201).json({ msg: "Uhuuul, atração adicionada!", atracao: r.rows[0] });
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    let { nome, nacionalidade, tipo, genero_musical_id } = req.body || {}
    genero_musical_id = Number(genero_musical_id)
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto")
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta")
    } else if (!Number.isInteger(genero_musical_id)) {
      throw new Error("ID do gênero musical inválido")
    } else if (!Number.isInteger(id)) {
      throw new Error("ID da atracão inválida")
    }
    const tiposValidos = ["banda", "cantor", "cantora", "dj", "dupla", "grupo"];

    if (!tipo || typeof tipo !== "string") {
      throw new Error("Tipo de atração inválido");
    }

    tipo = tipo.trim().toLowerCase();

    if (!tiposValidos.includes(tipo)) {
      throw new Error("Tipo de atração inválido");
    }
    else {
      const r1 = await db.query(
        "SELECT * FROM genero_musical WHERE id = $1",
        [genero_musical_id]
      );

      if (!r1.rowCount) {
        throw new Error("Gênero musical não existe");
      }
      const r = await db.query("UPDATE atracao SET nome = $1, nacionalidade = $2, tipo = $3, genero_musical_id = $4 WHERE id = $5 RETURNING *", [nome, nacionalidade, tipo, genero_musical_id, id]);
      if (!r.rowCount) {
        throw new Error("Atração não editada")
      } else {
        return res.status(200).json({ msg: "Uhuul, atração editada!", atracao: r.rows[0] })
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new Error("ID da atração inválido")
    }
    const r = await db.query("DELETE FROM atracao WHERE id = $1", [id])
    if (!r.rowCount) {
      throw new Error("Atracao com esse id ja nao existe!")
    }
    return res.status(200).json({ msg: "Atração apagada!" })
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})

module.exports = router;