const express = require("express");
const router = express.Router();
const db = require("../../db");


router.get("/", async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM  atracoes;");
    return res.status(200).json(r.rows)
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})

router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id
    const r = await db.query("SELECT * FROM atracoes WHERE id = $1", [id])
    if (!r.rowCount) {
      throw new Error("Atracao nao cadastrada")
    } else {
      return res.status(200).json(r.rows)
    }
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})

router.post("/", async (req, res) => {
  try {
    let nome = req.body.nome || {};
    let nacionalidade = req.body.nacionalidade || {};
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto")
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta")
    } else {
      const r = await db.query("INSERT INTO atracoes (nome, nacionalidade) VALUES ($1, $2) RETURNING *", [nome, nacionalidade]);
      if (!r.rowCount) {
        throw new Error("Atração nao adicionada")
      } else {
        return res.status(200).json(r.rows);
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})
router.put("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let nome = req.body.nome || {};
    let nacionalidade = req.body.nacionalidade || {};
    if (!nome || nome.length < 2) {
      throw new Error("Nome incompleto")
    } else if (!nacionalidade || nacionalidade.length < 2) {
      throw new Error("Nacionalidade incompleta")
    } else {
      const r = await db.query("UPDATE atracoes SET nome = $1, nacionalidade = $2 WHERE id = $3 RETURNING *"[nome, nacionalidade, id]);
      if (!r.rowCount) {
        throw new Error("Atracao nao editada")
      } else {
        return res.status(200).json(r.rows)
      }
    }
  } catch (error) {
    return res.status(400).json({ msg: error })
  }
})
module.exports = router;
