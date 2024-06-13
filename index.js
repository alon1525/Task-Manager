import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  const result = await db.query(`SELECT * FROM tasks`);
  var tasks = [];
  result.rows.forEach((task) => {
  tasks.push({id: task.id, title: task.description});
  })
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: tasks,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  const result = await db.query(`INSERT INTO tasks(description) VALUES ($1)`,[item]);
  console.log(`${item} has been added`);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const itemID = req.body.updatedItemId
  const itemDescription = req.body.updatedItemTitle
  try {
    const result = await db.query(`UPDATE tasks SET description = $1 WHERE id = $2`,[itemDescription,itemID]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM tasks WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
