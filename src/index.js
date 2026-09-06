const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(express.json());
app.use(cors());


app.use("/hello", require("./routes/rota"));
app.use("/atracoes", require("./routes/atracoes"));
app.use("/usuarios", require("./routes/usuarios"));
app.use("/ingressos", require("./routes/ingressos"));
app.use("/shows", require("./routes/shows"));
app.use("/showsAtracoes", require("./routes/showsAtracoes"));
app.use("/locais", require("./routes/locais"));




app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(3000, () => {
  console.log(`Servidor executando em http://localhost:3000`);
});
