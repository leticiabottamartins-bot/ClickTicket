const express = require('express');
const db = require("../db");
const router = express.Router();


// gettar usuarios
router.get("/", async (req, res) =>{
    try{    
        const r = await db.query("SELECT id, nome, cpf, ano_nasc, email FROM usuario");
        if (!r.rowCount){
            throw new Error("Usuários não encontrados :(")
        }
        return res.status(200).json(r.rows);

    }catch(error){
        return res.status(404).json({msg:error.message});
    }
});

//gettar usuarios por id
router.get("/:id", async (req, res) =>{
    try{    
        const id = req.params.id;
        if (!id){
            throw new Error("Id inválido")
        }
        const r = await db.query("SELECT nome, cpf, ano_nasc, email FROM usuario WHERE id = $1", [id]);
        if (!r.rowCount){
            throw new Error("Usuário não encontrado :(")
        }
        return res.status(200).json(r.rows[0]);

    }catch(error){
        return res.status(404).json({msg:error.message});
    }
});

//postar usuario
router.post("/", async (req,res) =>{
    try {
        const {nome, cpf, ano_nasc, email, senha} = req.body || {};
        if (!nome || !cpf || !ano_nasc || !email || !senha){
            throw new Error("Parâmetros inválidos")
        }
        if (nome.length < 2){
            throw new Error("Nome inválido")
        }
        if (cpf.length !== 14){
            throw new Error("Cpf inválido")
        }
        if (!Number.isInteger(ano_nasc) || ano_nasc < 1900 || ano_nasc > 2026){
            throw new Error("Ano inválido")
        }
        if (!email.includes("@") || !email.includes(".com")){
            throw new Error("Email inválido")
        }
        
        
        const r = await db.query("INSERT INTO usuario(nome, cpf, ano_nasc, email, senha) VALUES ($1, $2, $3, $4, $5) RETURNING nome, cpf, ano_nasc, email", [nome, cpf, ano_nasc, email, senha ]);
        if (!r.rowCount){
            throw new Error("Erro ao cadastrar usuário")
        }
        return res.status(201).json({msg: "Uhull, bem vindo!", usuario:r.rows[0]});
        
    } catch (error) {
        return res.status(400).json({msg:error.message});
    }
});

//editar usuario
router.put("/:id", async (req,res) =>{
    try {
        const id = req.params.id;
        const {nome, cpf, ano_nasc, email, senha} = req.body || {};
        if (!id){
            throw new Error("Id inválido")
        }
        if (!nome || !cpf || !ano_nasc || !email || !senha){
            throw new Error("Parâmetros inválidos")
        }
        if (nome.length < 2){
            throw new Error("Nome inválido")
        }
        if (cpf.length !== 14){
            throw new Error("Cpf inválido")
        }
        if (!Number.isInteger(ano_nasc) || ano_nasc < 1900 || ano_nasc > 2026){
            throw new Error("Ano inválido")
        }
        if (!email.includes("@") || !email.includes(".com")){
            throw new Error("Email inválido")
        }


        const r = await db.query("UPDATE usuario SET nome=$1, cpf=$2, ano_nasc=$3, email=$4, senha=$5 WHERE id=$6 RETURNING id, nome, cpf, ano_nasc, email", [nome, cpf, ano_nasc, email, senha, id]);
        if (!r.rowCount){
            throw new Error("Não foi possível editar o usuário: ele não existe")
        }
        return res.status(200).json({msg: "Usuário editado com sucesso!", usuario: r.rows[0]});
        
    } catch (error) {
        return res.status(400).json({msg:error.message})
    }
});

//deletar usuario
router.delete("/:id", async (req,res) =>{
    try {
        const id = req.params.id;
        if (!id){
            throw new Error("Id inválido")
        }
        const r1 = await db.query("DELETE FROM ingresso WHERE usuario_id = $1", [id])
        const r2 = await db.query("DELETE FROM usuario WHERE id=$1", [id])
        if(!r2.rowCount){
            throw new Error("Não foi possível deletar o usuário: ele não existe")
        }
        return res.status(200).json({msg:"Usuário deletado com sucesso!"});
        
    } catch (error) {
         return res.status(400).json({msg:error.message});
    }
});


module.exports = router;