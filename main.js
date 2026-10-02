const storageKey = "campo-inspecao-v1";

const sections = [
  {
    title: "Estrutura e ambiente",
    items: [
      ["estrutura", "Conservação da estrutura", "Paredes, pisos, teto e áreas de circulação."],
      ["iluminacao", "Iluminação", "Luminárias funcionando e níveis adequados."],
      ["ventilacao", "Ventilação e climatização", "Fluxo de ar e equipamentos em boas condições."],
      ["limpeza", "Limpeza e organização", "Ambientes limpos, organizados e sem obstruções."],
    ],
  },
  {
    title: "Segurança",
    items: [
      ["sinalizacao", "Sinalização de segurança", "Placas visíveis, legíveis e bem posicionadas."],
      ["extintores", "Extintores e equipamentos", "Acesso livre, validade em dia e inspeção identificada."],
      ["saidas", "Rotas e saídas de emergência", "Desobstruídas, identificadas e acessíveis."],
      ["eletrica", "Instalações elétricas", "Tomadas, cabos e quadros sem danos aparentes."],
    ],
  },
  {
    title: "Equipamentos e documentação",
    items: [
      ["equipamentos", "Condição dos equipamentos", "Equipamentos íntegros e adequados para uso."],
      ["manutencao", "Registros de manutenção", "Manutenções preventivas registradas e atualizadas."],
      ["documentos", "Documentação disponível", "Licenças, certificados e procedimentos acessíveis."],
      ["equipe", "Orientação da equipe", "Responsáveis informados sobre procedimentos aplicáveis."],
    ],
  },
];

const checklistRoot = document.querySelector("#checklist-sections");
const allItems = sections.flatMap((section) => section.items);

function getLocalDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? {};
  } catch {
    return {};
  }
}

function createItemRow([id, title, description], savedItems = {}) {
  const row = document.createElement("article");
  row.className = "check-row";
  row.dataset.itemId = id;

  const text = document.createElement("div");
  const itemTitle = document.createElement("h4");
  itemTitle.className = "item-name";
  itemTitle.textContent = title;
  const itemDescription = document.createElement("p");
  itemDescription.className = "item-description";
  itemDescription.textContent = description;
  text.append(itemTitle, itemDescription);

  const status = document.createElement("select");
  status.className = "status-select";
  status.setAttribute("aria-label", `Status: ${title}`);
  [
    ["pendente", "Pendente"],
    ["conforme", "Conforme"],
    ["atencao", "Atenção"],
    ["nao-conforme", "Não conforme"],
    ["na", "Não se aplica"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    status.append(option);
  });
  status.value = savedItems[id]?.status ?? "pendente";

  const note = document.createElement("input");
  note.className = "note-input";
  note.type = "text";
  note.maxLength = 240;
  note.placeholder = "Observação (opcional)";
  note.setAttribute("aria-label", `Observação: ${title}`);
  note.value = savedItems[id]?.note ?? "";

  row.append(text, status, note);
  updateStatusStyle(status);
  return row;
}

function renderChecklist(savedItems = {}) {
  checklistRoot.replaceChildren();
  sections.forEach((section, index) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "check-section";
    sectionElement.setAttribute("aria-labelledby", `section-title-${index}`);

    const heading = document.createElement("div");
    heading.className = "section-heading";
    const title = document.createElement("h3");
    title.id = `section-title-${index}`;
    title.textContent = section.title;
    const count = document.createElement("span");
    count.className = "section-count";
    count.textContent = `${section.items.length} itens`;
    heading.append(title, count);

    sectionElement.append(heading, ...section.items.map((item) => createItemRow(item, savedItems)));
    checklistRoot.append(sectionElement);
  });
}

function collectState() {
  const items = {};
  checklistRoot.querySelectorAll(".check-row").forEach((row) => {
    items[row.dataset.itemId] = {
      status: row.querySelector(".status-select").value,
      note: row.querySelector(".note-input").value,
    };
  });

  return {
    location: document.querySelector("#location").value,
    inspector: document.querySelector("#inspector").value,
    date: document.querySelector("#inspection-date").value,
    items,
  };
}

function updateProgress() {
  const evaluated = [...checklistRoot.querySelectorAll(".status-select")]
    .filter((select) => select.value !== "pendente").length;
  const percentage = Math.round((evaluated / allItems.length) * 100);
  const progressBar = document.querySelector("#progress-bar");

  document.querySelector("#progress-label").textContent = `${percentage}%`;
  document.querySelector("#progress-detail").textContent = `${evaluated} de ${allItems.length} itens avaliados`;
  document.querySelector("#progress-fill").style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", String(percentage));
}

function updateStatusStyle(select) {
  select.className = `status-select${select.value === "pendente" ? "" : ` status-${select.value}`}`;
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(collectState()));
    document.querySelector("#save-state").textContent = "Salvo neste dispositivo";
  } catch {
    document.querySelector("#save-state").textContent = "Não foi possível salvar";
  }
  updateProgress();
}

const savedState = loadState();
renderChecklist(savedState.items);
document.querySelector("#location").value = savedState.location ?? "";
document.querySelector("#inspector").value = savedState.inspector ?? "";
document.querySelector("#inspection-date").value = savedState.date ?? getLocalDate();
document.querySelector("#today").textContent = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(new Date());
document.querySelector("#footer-year").textContent = String(new Date().getFullYear());
updateProgress();

document.querySelector("#checklist-sections").addEventListener("input", saveState);
document.querySelector("#checklist-sections").addEventListener("change", (event) => {
  if (event.target.matches(".status-select")) updateStatusStyle(event.target);
  saveState();
});
document.querySelector(".details").addEventListener("input", saveState);
document.querySelector("#print-button").addEventListener("click", () => window.print());
document.querySelector("#clear-button").addEventListener("click", () => {
  if (!window.confirm("Limpar os dados e as respostas desta inspeção?")) return;
  localStorage.removeItem(storageKey);
  document.querySelector("#location").value = "";
  document.querySelector("#inspector").value = "";
  document.querySelector("#inspection-date").value = getLocalDate();
  renderChecklist();
  saveState();
});