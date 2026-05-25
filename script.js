const STORAGE_KEY = "internshipTrackerData";

function loadInternships() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveInternships(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let internships = loadInternships();

const form = document.getElementById("internship-form");
const editIndexInput = document.getElementById("edit-index");
const companyInput = document.getElementById("company");
const roleInput = document.getElementById("role");
const locationInput = document.getElementById("location");
const statusSelect = document.getElementById("status");
const dateAppliedInput = document.getElementById("date-applied");
const jobLinkInput = document.getElementById("job-link");
const notesInput = document.getElementById("notes");
const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const filterStatusSelect = document.getElementById("filter-status");
const searchInput = document.getElementById("search");
const tbody = document.getElementById("internship-tbody");
const emptyState = document.getElementById("empty-state");

function renderTable() {
  tbody.innerHTML = "";

  const searchTerm = searchInput.value.toLowerCase().trim();
  const filterStatus = filterStatusSelect.value;

  const filtered = internships.filter((item) => {
    const matchesStatus = filterStatus ? item.status === filterStatus : true;
    const searchable = (item.company + " " + item.role).toLowerCase();
    const matchesSearch = searchable.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filtered.forEach((item, index) => {
    const tr = document.createElement("tr");

    const statusClass =
      item.status === "Applied"
        ? "status-applied"
        : item.status === "Interviewing"
        ? "status-interviewing"
        : item.status === "Offer"
        ? "status-offer"
        : item.status === "Rejected"
        ? "status-rejected"
        : "status-wishlist";

    tr.innerHTML = `
      <td>${item.company}</td>
      <td>${item.role}</td>
      <td>${item.location || "-"}</td>
      <td><span class="status-pill ${statusClass}">${item.status}</span></td>
      <td>${item.dateApplied || "-"}</td>
      <td>${
        item.jobLink
          ? `<a href="${item.jobLink}" target="_blank" rel="noopener noreferrer">Link</a>`
          : "-"
      }</td>
      <td>
        <button type="button" class="btn btn-small btn-edit edit-btn" data-index="${index}">Edit</button>
        <button type="button" class="btn btn-small btn-delete delete-btn" data-index="${index}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    company: companyInput.value.trim(),
    role: roleInput.value.trim(),
    location: locationInput.value.trim(),
    status: statusSelect.value,
    dateApplied: dateAppliedInput.value,
    jobLink: jobLinkInput.value.trim(),
    notes: notesInput.value.trim(),
    createdAt: new Date().toISOString(),
  };

  const editIndex = editIndexInput.value;

  if (editIndex !== "") {
    internships[Number(editIndex)] = {
      ...internships[Number(editIndex)],
      ...data,
    };
  } else {
    internships.push(data);
  }

  saveInternships(internships);
  resetForm();
  renderTable();
});

function resetForm() {
  form.reset();
  editIndexInput.value = "";
  cancelEditBtn.classList.add("hidden");
  saveBtn.textContent = "Save";
}

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

tbody.addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("edit-btn")) {
    const index = Number(target.dataset.index);
    startEdit(index);
  } else if (target.classList.contains("delete-btn")) {
    const index = Number(target.dataset.index);
    deleteEntry(index);
  }
});

function startEdit(index) {
  const item = internships[index];
  editIndexInput.value = index;
  companyInput.value = item.company;
  roleInput.value = item.role;
  locationInput.value = item.location || "";
  statusSelect.value = item.status;
  dateAppliedInput.value = item.dateApplied || "";
  jobLinkInput.value = item.jobLink || "";
  notesInput.value = item.notes || "";

  saveBtn.textContent = "Update";
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteEntry(index) {
  const confirmDelete = confirm("Delete this internship entry?");
  if (!confirmDelete) return;
  internships.splice(index, 1);
  saveInternships(internships);
  renderTable();
}

filterStatusSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

renderTable();