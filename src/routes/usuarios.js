const express = require('express');
const db = require("../db");
const router = express.Router();


// gettar usuarios
router.get("/", async (req, res) =>{
    try{    
        const r = await db.query("SELECT u.id, u.nome, cpf, ano_nasc, g.nome AS gosto, email FROM usuario u LEFT JOIN genero_musical g ON u.gosto_id = g.id");
        if (!r.rowCount){
            throw new Error("Usuários não encontrados")
        }
        return res.status(200).json(r.rows);

    }catch(error){
        return res.status(404).json({msg:error.message});
    }
});

//gettar usuarios por id
router.get("/:id", async (req, res) =>{
    try{    
        const id =  Number(req.params.id);
        if (!Number.isInteger(id)){
            throw new Error("ID inválido")
        }
        const r = await db.query("SELECT u.id, u.nome, cpf, ano_nasc, g.nome AS gosto, email FROM usuario u JOIN genero_musical g ON u.gosto_id = g.id WHERE u.id = $1", [id]);
        if (!r.rowCount){
            throw new Error("Usuário não encontrado")
        }
        return res.status(200).json(r.rows[0]);

    }catch(error){
        return res.status(404).json({msg:error.message});
    }
});

//postar usuario
router.post("/", async (req,res) =>{
    try {
        const {nome, cpf, ano_nasc, gosto, email, senha} = req.body || {};
        gosto = Number (gosto);
        ano_nasc = Number (ano_nasc)
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
        if (!Number.isInteger(gosto)) {
            throw new Error ("ID do genero musical inválido")
        }
        
        
        const r = await db.query("INSERT INTO usuario(nome, cpf, ano_nasc, gosto_id, email, senha) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [nome, cpf, ano_nasc, gosto, email, senha ]);
        if (!r.rowCount){
            throw new Error("Erro ao cadastrar usuário")
        }
        const r2 = await db.query("SELECT u.id, u.nome, cpf, ano_nasc, g.nome AS gosto, email FROM usuario u JOIN genero_musical g ON u.gosto_id = g.id WHERE u.id = $1", [r.rows[0].id]);
        return res.status(201).json({msg: "Uhull, bem vindo!", usuario:r2.rows[0]});
        
    } catch (error) {
        return res.status(400).json({msg:error.message});
    }
});

//editar usuario
router.put("/:id", async (req,res) =>{
    try {
        const id = Number(req.params.id);


        const {nome, cpf, ano_nasc, gosto, email, senha} = req.body || {};
        if (!Number.isInteger(id)){
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
        if (!Number.isInteger(gosto)) {
            throw new Error ("ID do gênero musical inválido")
        }


        const r = await db.query("UPDATE usuario SET nome=$1, cpf=$2, ano_nasc=$3, gosto_id=$4, email=$5, senha=$6 WHERE id=$7 RETURNING id, nome, cpf, ano_nasc, gosto_id, email", [nome, cpf, ano_nasc, gosto, email, senha, id]);
        if (!r.rowCount){
            throw new Error("Não foi possível editar o usuário: ele não existe")
        }
        const r1 = await db.query("SELECT u.id, u.nome, cpf, ano_nasc, g.nome AS gosto, email FROM usuario u JOIN genero_musical g ON u.gosto_id = g.id WHERE u.id = $1", [id]);
        return res.status(200).json({msg: "Usuário editado com sucesso!", usuario: r1.rows[0]});
        
    } catch (error) {
        return res.status(400).json({msg:error.message})
    }
});

//deletar usuario
router.delete("/:id", async (req,res) =>{
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)){
            throw new Error("Id inválido")
        }

        const r2 = await db.query("DELETE FROM usuario WHERE id=$1", [id])
        if(!r2.rowCount){
            throw new Error("Não foi possível deletar o usuário: ele não existe")
        }
        return res.status(200).json({msg:"Usuário deletado com sucesso!"});
        
    } catch (error) {
         return res.status(400).json({msg:error.message});
    }
});

//recomendar shows para o usuario
router.get("/:id/recomendacoes", async (req, res) => {
    try {
        const id = req.params.id;
        if(!id){
            throw new Error("Id inválido")
        }
        const usuario = await db.query("SELECT gosto FROM usuario WHERE id=$1", [id]);
        if (!usuario.rowCount){
            throw new Error("Usuário não encontrado")
        }
        const gosto = usuario.rows[0].gosto;
        if (!gosto){
            throw new Error("Usuário não possui um gosto cadastrado")
        }
        const shows = await db.query("SELECT s.nome, s.data, l.nome, l.endereco FROM show s INNER JOIN local l ON s.local_id = l.id WHERE s.genero = $1", [gosto]);
        if (!shows.rowCount){
            throw new Error("Nenhum show encontrado para esse gosto")
        }
        return res.status(200).json({gosto: gosto, shows: shows.rows});


    } catch (error) {
        return res.status(400).json({msg:error.message});
    }
});




module.exports = router;