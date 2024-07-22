
let currentUrl = "";

const formZone = document.querySelector(".formZone");
const loginForm = document.querySelector(".login");
const signupForm = document.querySelector(".signup");
const actions = document.querySelector(".actions");

const path = document.querySelector(".path");
const temp = document.querySelector("template");
const meinFolder = document.querySelector(".meinFolder");

let currentUser = "";
let selectedItem = null;

const tempDiv = document.querySelector(".tempDiv");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;
  login(username, password);
});
async function login(username, password) {
  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });
  if (res.ok) {
    const user = await res.json();
    currentUser = user.username;
    console.log(user);
    currentUrl += user.username;
    formZone.style.display = "none";
    meinFolder.style.display = "block";
    path.textContent = currentUrl;

    // const dir = await fetch(`http://localhost:3000/${user.username}`);
    // const d = await dir.json();
    // console.log(d);
    // actions.style.display = "block";
    // path.textContent = currentUrl;
    // for (let i = 0; i < d.length; i++) {
    //   createFileElement(d[i]);
  }
}
meinFolder.addEventListener("click", ()=>{
  updateDisplay(currentUser);
});

async function updateDisplay(dir) {
  meinFolder.style.display = "none";
  document.querySelectorAll(".tempDiv").forEach((el) => el.remove());
  currentUrl+= `/${dir}`;
  path.textContent = currentUrl;
  const res = await fetch(`http://localhost:3000/enter/${dir}`);
  const items = await res.json();
  for (let item of items) {
    const fileElement = createFileElement(item);
    document.body.appendChild(fileElement);
  }
}

function createFileElement(item) {
  const clon = temp.content.cloneNode(true);
  const tempDiv = clon.querySelector(".tempDiv");
  const name = clon.querySelector(".name");
  const img = clon.querySelector("img");
  const actionsBtn = clon.querySelector(".actionsBtn");
  const actionMenu = clon.querySelector(".actionMenu");

  name.textContent = item.name;
  tempDiv.setAttribute("data-url", `${currentUrl}/${item.name}`);
  tempDiv.setAttribute("data-type", item.isFile ? "file" : "folder");
  tempDiv.setAttribute("data-name", item.name);
  img.setAttribute("src", item.isFile ? "./img/file.png" : "./img/folder.png");

  tempDiv.addEventListener("click", (e) => {
    updateDisplay(item.name);
  });

  actionsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    actionMenu.style.display =
      actionMenu.style.display === "none" ? "block" : "none";
  });

  // הוספת מאזיני אירועים לכפתורי הפעולות
  clon.querySelector(".renameBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    renameItem(tempDiv);
  });

  clon.querySelector(".copyBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    copyItem(tempDiv);
  });

  clon.querySelector(".deleteBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    deleteItem(tempDiv);
  });
  clon.querySelector(".infoBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    infoItem(tempDiv);
  });

  return tempDiv;
}

async function renameItem(tempDiv) {
  const newName = prompt("הזן שם חדש:");
  if (newName) {
    const oldPath = tempDiv.dataset.url;
    const newPath = `${currentUrl}/${newName}`;
    const res = await fetch(
      `http://localhost:3000/${currentUser}/${oldPath}/${newPath}/rename`
    );
    if (res.ok) {
      const info = await res.json();
      console.log(info);
    } else {
      console.log("שגיאה");
    }
  }
}

async function copyItem(tempDiv) {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/copy/${tempDiv.dataset.url}`
  );
  if (res.ok) {
    updateDisplay();
  }
}

async function deleteItem(tempDiv) {
  // const confirmDelete = confirm("האם אתה בטוח שברצונך למחוק פריט זה?");
  // if (confirmDelete) {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/delete/${tempDiv.dataset.name}`,
    {
      method: "DELETE",
    }
  );
  if (res.ok) {
    updateDisplay();
  }
}

async function infoItem(tempDiv) {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/info/${tempDiv.dataset.name}`,
    {
      method: "GET",
    }
  );
  if (res.ok) {
    let d = await res.json();
    console.log(d);
  }
}
async function showItem(tempDiv) {
  if (tempDiv.getAttribute("data-type") === "folder") {

  } else {
    const res = await fetch(
      `http://localhost:3000/${currentUser}/show/${tempDiv.dataset.url}`,
      {
        method: "GET",
      }
    );
    if (res.ok) {
      let data = await res.json();
      
    }
  }
}
// מאזין אירועים לסגירת תפריטי הפעולות כשלוחצים מחוץ להם
document.body.addEventListener("click", () => {
  document.querySelectorAll(".actionMenu").forEach((menu) => {
    menu.style.display = "none";
  });
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#usernameS").value;
  const password = document.querySelector("#passwordS").value;
  signup(username, password);
});
async function signup(username, password) {
  const res = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });
  if (res.ok) {
    const user = await res.json();
    console.log(user);
    currentUrl += `/${user.username}`;
    formZone.style.display = "none";
    const clon = folder.content.cloneNode(true);
    clon.firstChild.textContent = currentUrl;
    document.body.appendChild(clon);
  }
}

// tempDiv.addEventListener("click", (e) => {
//   if (e.target.data - type == "file") {
//      show();
//   } else if (e.target.data - type == "folder") {
//     enter();
//   }
// });

// async function enter() {
//   const res = await fetch(`http://localhost:3000/${e.target.data - url}`);
//   currentUrl = res;
// }
