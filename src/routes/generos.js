const express = require ("express");
const db =  require ("../db");
const router = express.Router();

router.get ("/generos", async (req, res)=> {
    try {
        const r = await db.query ("SELECT * FROM genero_musicai")
        return res.status(200).json(r.rows)
    }catch(error) {

    }
})

router.get ("/:id", async (req,res)=> {
    try {
        const id =  Number(req.params.id)
        if (!Number.isInteger(id)){
            throw new Error ("ID do gênero inválido")
        }
        return res.status(200).json(r.rows[0])
    }catch(error) {
        return res.status(400).json({msg: error.message})
    }
})