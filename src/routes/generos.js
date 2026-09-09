const express = require ("express");
const db =  require ("../db");
const router = express.Router();

router.get ("/", async (req, res)=> {
    try {
        const r = await db.query ("SELECT * FROM genero_musical")
        return res.status(200).json(r.rows)
    }catch(error) {
        return res.status(400).json({msg: error.message})
    }
})

router.get ("/:id", async (req,res)=> {
    try {
        const id =  Number(req.params.id)
        if (!Number.isInteger(id)){
            throw new Error ("ID do gênero inválido")
        }
        const r = await db.query ("SELECT * FROM genero_musical WHERE id = $1", [id])
        if (!r.rowCount) {
            throw new Error ("Genero com esse ID nâo encontrado")
        }
        return res.status(200).json(r.rows[0])
    }catch(error) {
        return res.status(400).json({msg: error.message})
    }
})

module.exports = router;