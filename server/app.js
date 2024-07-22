const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));


let localPath = "folders";
let cmd = path.join(__dirname, localPath);

// app.get("/favicon.ico", (req, res) => res.status(204));

/**---------------------util method--------------------- */
function getUsers() {
  return JSON.parse(fs.readFileSync("users.json", "utf-8"));
}

/**-------------------get method------------------------- */
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client", "index.html"));
// });
app.get("/enter/:folder", (req, res) => {
  localPath += `/${req.params.folder}`;
  cmd = path.join(__dirname, localPath);

  fs.readdir(`${localPath}`, "utf-8", (err, files) => {
    if (err) {
      console.error("error in read the folder", err);
      return;
    }
    const content = [];
    files.forEach((element) => {
      let info = fs.statSync(`${localPath}/${element}`);
      let temp = {
        name: element,
        isFile: info.isFile(),
      };
      content.push(temp);
    });
    res.send(JSON.stringify(content));
  });
});

app.get("/:user/info/:item", (req, res) => {
  fs.stat(`${localPath}/${req.params.item}`, (err, info) => {
    console.log(info);
    res.send(info);
  });
});

app.get("/:user/show/*", (req, res) => {
  let data = fs.readFileSync(`folders/${req.params.user}/${req.params[0]}`);
  res.send(data);
});

app.get("/:user/:old/:new/rename", (req, res) => {
  fs.renameSync(
    `folders/${req.params.user}/${req.params.old}`,
    `folders/${req.params.user}/${req.params.new}`
  );
  console.log("Rename complete!");
});

app.get("/:user/copy/*", (req, res) => {
  fs.copyFileSync(
    `folders/${req.params.user}/${req.params[0]}`,
    `folders/${req.params.user}/copy_${req.params[0]}`
  );
  res.send("successful copy!");
});

/**------------------post method------------------------ */
app.post("/login", (req, res) => {
  const users = getUsers();
  const user = users.find((u) => {
    return u.username === req.body.username && u.password === req.body.password;
  });
  if (user) {
    res.send(user);
  } else {
    res.status(401).send("user not exist!");
  }
});

app.post("/signup", (req, res) => {
  const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  const user = users.find((u) => {
    return u.username === req.body.username && u.password === req.body.password;
  });
  if (user) {
    res.status(401).send("The user already exists!");
  } else {
    fs.mkdir(`folders/${req.body.username}`, (err) => {
      if (err) console.error(err);
      else {
        console.log(`new folder created successfully`);
      }
    });
    let newUser = {
      username: req.body.username,
      password: req.body.password,
      state: `/folders/${req.body.username}`,
    };
    users.push(newUser);
    fs.writeFile("users.json", JSON.stringify(users), "utf8", (err) => {
      if (err) console.error(err);
      else {
        console.log(`new folder created successfully`);
      }
      res.send(newUser);
    });
  }
});

/**---------------------------------DELETE method---------------------------------- */
app.delete("/:user/delete/:item", (req, res)=>{

})

const port = process.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
