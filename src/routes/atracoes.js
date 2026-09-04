const express = require("express");
const router = express.Router();
const db = require("../db.js");


router.get("/", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM  atracao;");
    if(!r.rowCount){
      throw new Error("Nenhuma atração encontrada!")
    }
    return res.status(200).json(r.rows)
  } catch (error) {
    return res.status(404).json({ msg: error.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    const r = await db.query("SELECT * FROM atracao WHERE id = $1", [id]);
    if (!r.rowCount) {
      throw new Error("Atração não cadastrada");
    } else {
      return res.status(200).json(r.rows[0]);
    }
  } catch (error) {
    return res.status(404).json({ msg: error.message });
  }
})

router.post("/", async (req, res) => {
  try {
    let nome = req.body.nome || {};
    let nacionalidade = req.body.nacionalidade || {};
    let tipo = req.body.tipo || {};
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto");
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta");
    } else if (!tipo || tipo.length < 2){
      throw new Error("Tipo incompleto");
    }else {
      const r = await db.query("INSERT INTO atracao (nome, nacionalidade, tipo) VALUES ($1, $2, $3) RETURNING *", [nome, nacionalidade, tipo]);
      if (!r.rowCount) {
        throw new Error("Atração não adicionada");
      } else {
        return res.status(201).json(r.rows[0]);
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})
router.put("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let nome = req.body.nome || {};
    let nacionalidade = req.body.nacionalidade || {};
    let tipo = req.body.tipo || {};
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto")
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta")
    } else if(!tipo || tipo.length < 2){
      throw new Error("Tipo incompleto")
    }else {
      const r = await db.query("UPDATE atracao SET nome = $1, nacionalidade = $2, tipo = $3 WHERE id = $4 RETURNING *", [nome, nacionalidade, tipo,id]);
      if (!r.rowCount) {
        throw new Error("Atração não editada")
      } else {
        return res.status(200).json(r.rows[0])
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message })
  }
})
module.exports = router;