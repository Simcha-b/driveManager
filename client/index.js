const formZone = document.querySelector(".formZone");
const loginForm = document.querySelector(".login");
const signupForm = document.querySelector(".signup");
const actions = document.querySelector(".actions");

const path = document.querySelector(".path");
const temp = document.querySelector("template");
const tempDiv = document.querySelector(".tempDiv");
const meinFolder = document.querySelector(".meinFolder");
const content = document.querySelector(".content");

let currentUrl = "/folders";
let currentUser = "";
let selectedItem = null;


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
    console.log(currentUser);
    formZone.style.display = "none";
    meinFolder.style.display = "block";
    const res2 = await fetch(
      `http://localhost:3000/${currentUser}/folder/enter/${currentUser}`
    );
    currentUrl = await res2.text();
    path.textContent = currentUrl;
    updateDisplay(currentUser);
  }
}

async function updateDisplay(dir) {
  document.querySelector(".folder_actions").style.display = "none";
  document.querySelector(".file_actions").style.display = "none";
  document.querySelectorAll(".tempDiv").forEach((el) => el.remove());
  const res = await fetch(
    `http://localhost:3000/${currentUser}/folder/show/${dir}`
  );
  const items = await res.json();
  console.log(items);
  for (let item of items) {
    const element = createElement(item);
    content.appendChild(element);
  }
}

function createElement(item) {
  const clone = temp.content.cloneNode(true);
  const tempDiv = clone.querySelector(".tempDiv");
  const name = clone.querySelector(".name");
  const img = clone.querySelector("img");
  name.textContent = item.name;
  tempDiv.setAttribute("data-url", `${currentUrl}/${item.name}`);
  tempDiv.setAttribute("data-type", item.isFile ? "file" : "folder");
  tempDiv.setAttribute("data-name", item.name);
  img.setAttribute("src", item.isFile ? "./img/file.png" : "./img/folder.png");

  //הצגת תפריטי הפעולות בלחיצה על האלמנטים
  tempDiv.addEventListener("click", (e) => {
    document.querySelector(`.${tempDiv.dataset.type}_actions`).style.display =
      "block";
    selectedItem = tempDiv.dataset.name;
  });
  return tempDiv;
}

const btns = document.querySelectorAll(".action");
btns.forEach((btn) => {
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    if (ev.target.classList.value.includes("file")) {
      switch (btn.textContent) {
        case "info":
          infoFile();
          break;
        case "show":
          showFile();
          break;
        case "copy":
          copyFile();
          break;
        case "rename":
          renameFile();
          break;
        case "move":
          moveFile();
          break;
        case "delete":
          deleteFile();
          break;
      }
    } else if (ev.target.classList.value.includes("folder")) {
      switch (btn.textContent) {
        case "info":
          infoFolder();
          break;
        case "show":
          showFolder();
          break;
        case "rename":
          renameFolder();
          break;
        case "delete":
          deleteFolder();
          break;
      }
    }
  });
});

const popup = document.querySelector(".popup");

async function showFile() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/show/${selectedItem}`
  );
  if (res.ok) popup.textContent = await res.text();
}
async function infoFile() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/info/${selectedItem}`
  );
  if (res.ok) popup.textContent = await res.text();
}
async function copyFile() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/copy/${selectedItem}`
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem.dataset.name);
  }
}
async function renameFile() {
  const newname = prompt("Enter new name: ");
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/rename/${selectedItem}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newname: newname,
      }),
    }
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem.dataset.name);
  }
}
async function moveFile() {
  const newpath = prompt("Enter new name: ");
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/move/${selectedItem}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newpath: newpath,
      }),
    }
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem);
  }
}

async function deleteFile() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/delete/${selectedItem}`,
    { method: "DELETE" }
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem);
  }
}
async function showFolder() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/folder/enter/${selectedItem}`
  );
  currentUrl = await res.text();
  path.textContent = currentUrl;
  updateDisplay(selectedItem);
}
async function infoFolder() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/folder/info/${selectedItem}`
  );
  if (res.ok) popup.textContent = await res.text();
}
async function renameFolder() {
  const newname = prompt("Enter new name: ");
  const res = await fetch(
    `http://localhost:3000/${currentUser}/folder/rename/${selectedItem}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newname: newname,
      }),
    }
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem);
  }
}
async function deleteFolder() {
  const res = await fetch(
    `http://localhost:3000/${currentUser}/file/delete/${selectedItem.dataset.name}`,
    { method: "DELETE" }
  );
  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem.dataset.name);
  }
}

document.querySelector(".uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fileInput = document.querySelector("#fileInput");
  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const res = await fetch(`http://localhost:3000/${currentUser}/file/upload`, {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    popup.textContent = await res.text();
    updateDisplay(selectedItem); // Update display to show the new file
  } else {
    popup.textContent = "File upload failed.";
  }
});

// מאזין אירועים לסגירת תפריטי הפעולות כשלוחצים מחוץ להם
document.body.addEventListener("click", () => {
  popup.textContent = "";
});
document.querySelectorAll(".close").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelector(".file_actions").style.display = "none";
    document.querySelector(".folder_actions").style.display = "none";
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
async function goBack() {
  if (currentUrl === `folders/${currentUser}`) return;
  const res = await fetch(
    `http://localhost:3000/${currentUser}/folder/up/${selectedItem}`
  );
  if (res.ok) {
    currentUrl = await res.text();
    path.textContent = currentUrl;
    updateDisplay(selectedItem);
  }
}
// כפתור ניתוק
document.querySelector("#logoutButton").addEventListener("click", async (e) => {
  const res = await fetch(`http://localhost:3000/${currentUser}/logout`);
  if (res.ok) {
    window.location.reload();
  }
});
