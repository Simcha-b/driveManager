const express = require("express");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client")));

let localPath = "folders";
let cmd = path.join(__dirname, localPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, localPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// app.get("/login",(req, res)=>{
//   res.redirect("https://drive.google.com/drive/home")
// })
/**---------------------util method--------------------- */
function getUsers() {
  return JSON.parse(fs.readFileSync("users.json", "utf-8"));
}

/**------------------------file rating-------------------- */
//info
app.get("/:user/file/info/:filename", (req, res) => {
  fs.stat(`${localPath}/${req.params.filename}`, (err, info) => {
    if (err) {
      console.error(err);
    }
    res.send(info);
  });
});
//show
app.get("/:user/file/show/:filename", (req, res) => {
  let data = fs.readFileSync(`${localPath}/${req.params.filename}`);
  res.send(data);
});
//rename
app.put("/:user/file/rename/:filename", (req, res) => {
  fs.renameSync(
    `${localPath}/${req.params.filename}`,
    `${localPath}/${req.body.newname}`
  );
  res.send("Rename complete!");
});
//copy
app.get("/:user/file/copy/:filename", (req, res) => {
  fs.copyFileSync(
    `${localPath}/${req.params.filename}`,
    `${localPath}/copy_${req.params.filename}`
  );
  res.send("successful copied!");
});
//move
app.put("/:user/file/move/:filename", (req, res) => {
  fs.renameSync(`${localPath}/${req.params.filename}`, `${req.body.newpath}`);
  res.send("move successful!!");
});
//delete
app.delete("/:user/file/delete/:filename", (req, res) => {
  fs.unlinkSync(`${localPath}/${req.params.filename}`);
  res.send("File deleted successfully");
});

/**------------------folder rating---------------------- */
//enter
app.get("/:user/folder/enter/:folderName", (req, res) => {
  localPath += `/${req.params.folderName}`;
  res.send(localPath);
});
//show
app.get("/:user/folder/show/:folderName", (req, res) => {
  const files = fs.readdirSync(`${localPath}`, "utf-8");
  const d = [];
  files.forEach((element) => {
    let info = fs.statSync(`${localPath}/${element}`);
    let temp = {
      name: element,
      isFile: info.isFile(),
    };
    d.push(temp);
  });
  res.send(JSON.stringify(d));
});
//info
app.get("/:user/folder/info/:folderName", (req, res) => {
  fs.stat(`${localPath}/${req.params.folderName}`, (err, info) => {
    if (err) {
      console.error(err);
    }
    res.send(info);
  });
});
//rename
app.put("/:user/folder/rename/:folderName", (req, res) => {
  fs.renameSync(
    `${localPath}/${req.params.filename}`,
    `${localPath}/${req.body.newname}`
  );
  res.send("Rename complete!");
});
//delet
app.delete("/:user/folder/delete/:folderName", (req, res) => {
  fs.rmdir(`${localPath}/${req.params.folderName}`, (err) => {
    if (err) {
      res.send("cen not delete this folder!!");
    }
    res.send("folder deleted successfully!");
  });
});
//up
app.get("/:user/folder/up/:folderName", (req, res) => {
  localPath = localPath.substring(0, localPath.lastIndexOf("/"));
  res.send(localPath);
});
/**------------------login method------------------------ */
app.post("/login", async (req, res) => {
  const users = await getUsers();
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
app.get("/:user/logout", (req, res) => {
  localPath = "folders";
  res.send("logout successfully!");
});

/**------------------upload----------------------------- */
app.post("/:user/file/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send("File uploaded successfully.");
});

const port = process.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
