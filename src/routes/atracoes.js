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
    const { nome, nacionalidade, tipo } = req.body || {};
    const generoMusical = Number(req.body.generoMusical);

    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto");
    }
    if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta");
    }
    if (!tipo || tipo.length < 2) {
      throw new Error("Tipo incompleto");
    }
    if (!Number.isInteger(generoMusical)) {
      throw new Error("ID do Gênero musical inválido");
    }

    const r = await db.query("INSERT INTO atracao (nome, nacionalidade, tipo, genero_musical_id) VALUES ($1, $2, $3, $4) RETURNING *", [nome, nacionalidade, tipo, generoMusical]);
    if (!r.rowCount) {
      throw new Error("Atração não adicionada");
    }
    return res.status(201).json({ msg: "Uhuuul, atração adicionada!", atracao: r.rows[0] });
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      throw new Error("ID inválido!")
    }
    const { nome, nacionalidade, tipo } = req.body || {};
    const generoMusical = Number(req.body.generoMusical);

    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto")
    }
    if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta")
    }
    if (!tipo || tipo.length < 2) {
      throw new Error("Tipo incompleto")
    }
    if (!Number.isInteger(generoMusical)) {
      throw new Error("ID do gênero musical inválido")
    }

    const r = await db.query("UPDATE atracao SET nome = $1, nacionalidade = $2, tipo = $3, genero_musical_id = $4 WHERE id = $5 RETURNING *", [nome, nacionalidade, tipo, generoMusical, id]);
    if (!r.rowCount) {
      throw new Error("Atração não editada")
    }
    return res.status(200).json({ msg: "Uhuul, atração editada!", atracao: r.rows[0] })
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