const sales = JSON.parse(localStorage.getItem("todaySales") || "[]");

function getPrice(productName) {
  const option = document.querySelector(`#product option[value="${productName}"]`);
  return parseFloat(option.dataset.price);
}

function addSale() {
  const product = document.getElementById("product").value;
  const quantity = parseFloat(document.getElementById("quantity").value);
  const discountInput = document.getElementById("discount").value;
  const discount = discountInput === "" ? 0 : parseFloat(discountInput);
  const price = getPrice(product);

  if (isNaN(quantity) || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const total = price * quantity - discount;

  const sale = {
    product,
    quantity,
    price,
    discount,
    total: parseFloat(total.toFixed(2))
  };

  sales.push(sale);
  localStorage.setItem("todaySales", JSON.stringify(sales));

  renderSales();
}

function renderSales() {
  const tbody = document.getElementById("sales-body");
  tbody.innerHTML = "";
  let totalRevenue = 0;

  sales.forEach(sale => {
    const row = `
      <tr>
        <td>${sale.product}</td>
        <td>${sale.quantity}</td>
        <td>₹${sale.price}</td>
        <td>₹${sale.discount}</td>
        <td>₹${sale.total}</td>
      </tr>
    `;
    tbody.innerHTML += row;
    totalRevenue += sale.total;
  });

  document.getElementById("total-revenue").textContent = totalRevenue.toFixed(2);
}

function disableInputs() {
  document.querySelectorAll("input, select, button").forEach(el => {
    if (el.id !== "new-day-btn") el.disabled = true;
  });
}

function checkIfDayClosed() {
  if (localStorage.getItem("dayClosed") === "true") {
    disableInputs();
  }
}

function startNewDay() {
  if (confirm("Are you sure you want to start a new day? This will clear all today's data.")) {
    localStorage.removeItem("todaySales");
    localStorage.removeItem("dayClosed");
    sales.length = 0;
    renderSales();
    document.querySelectorAll("input, select, button").forEach(el => el.disabled = false);
  }
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("Rice Shop - Daily Sales Report", 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Date: " + new Date().toLocaleDateString(), 20, y);
  y += 10;

  doc.autoTable({
    head: [["Product", "Qty", "Price/kg", "Discount", "Total"]],
    body: sales.map(s => [
      s.product,
      s.quantity,
      "₹" + s.price,
      "₹" + s.discount,
      "₹" + s.total
    ]),
    startY: y
  });

  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 20, y);

  const fileName = `sales-report-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);

  // Lock the day
  localStorage.setItem("dayClosed", "true");
  disableInputs();
}

window.onload = () => {
  renderSales();
  checkIfDayClosed();
};
