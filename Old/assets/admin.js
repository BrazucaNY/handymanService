const customerForm = document.getElementById("customerForm");
const estimatesTable = document.getElementById("estimatesTable");

// Render all estimates from Firestore
function renderEstimates() {
  estimatesTable.innerHTML = "";
  db.collection("estimates").get().then((snapshot) => {
    snapshot.forEach((doc) => {
      const e = doc.data();
      const total = e.hours * 50 + Number(e.materials); // $50/hour as example
      estimatesTable.innerHTML += `
        <tr>
          <td>${e.name}</td>
          <td>${e.phone}</td>
          <td>${e.job}</td>
          <td>${e.hours}</td>
          <td>${e.materials}</td>
          <td>${total}</td>
          <td>
            <button onclick="deleteEstimate('${doc.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });
}

// Add estimate to Firestore
customerForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(customerForm);
  db.collection("estimates").add({
    name: formData.get("name"),
    phone: formData.get("phone"),
    job: formData.get("job"),
    hours: Number(formData.get("hours")),
    materials: Number(formData.get("materials"))
  }).then(() => {
    customerForm.reset();
    renderEstimates();
  });
});

// Delete estimate
function deleteEstimate(id) {
  db.collection("estimates").doc(id).delete().then(() => {
    renderEstimates();
  });
}

// Initial render
renderEs
