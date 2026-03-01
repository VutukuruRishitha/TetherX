// ================= WORKFLOW STEPS =================
let workflowSteps = {
    "General Checkup": ["Reception", "Doctor Consultation", "Pharmacy"],
    "Lab Tests": ["Reception", "Lab Collection", "Report Generation"],
    "Scans": ["Reception", "Radiology", "Report Review"],
    "Appointments": ["Reception", "Doctor Appointment"],
    "Pregnancy": ["Reception", "Specialist Consultation", "Scan Department"],
    "Insurance": ["Reception", "Insurance Verification", "Approval"]
};

// ================= CATEGORY CHANGE =================
function handleCategoryChange() {
    let category = document.getElementById("category").value;
    let subSection = document.getElementById("subSection");
    let subCategory = document.getElementById("subCategory");
    let insurancePriority = document.getElementById("insurancePriority");

    subCategory.innerHTML = "";
    subSection.style.display = "block";
    insurancePriority.style.display = category === "Insurance" ? "block" : "none";

    let options = [];

    if (category === "General Checkup") {
        options = ["Fever", "Heart Problem", "Skin Allergy", "Bone Pain", "Child Health"];
    }
    else if (category === "Lab Tests") {
        options = ["Blood Test", "Urine Test", "Thyroid Test", "Diabetes Test"];
    }
    else if (category === "Scans") {
        options = ["X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG"];
    }
    else if (category === "Appointments") {
        options = ["Emergency", "Online Consultation", "Specialist Visit", "Vaccination", "Surgery"];
    }
    else if (category === "Pregnancy") {
        options = ["Obstetrician", "Gynecologist", "Pediatrician", "Radiologist", "Endocrinologist"];
    }
    else if (category === "Insurance") {
        options = ["Claim Submission", "Policy Verification"];
    }

    options.forEach(opt => {
        let option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        subCategory.appendChild(option);
    });

    setDoctorType();
}

// ================= DOCTOR / DEPARTMENT MAPPING =================
function setDoctorType() {
    let sub = document.getElementById("subCategory").value;
    let doctorField = document.getElementById("doctorType");

    let mapping = {

        // General Checkup
        "Fever": "General Physician",
        "Heart Problem": "Cardiology Department",
        "Skin Allergy": "Dermatology Department",
        "Bone Pain": "Orthopedic Department",
        "Child Health": "Pediatrics Department",

        // Lab Tests
        "Blood Test": "Pathology Department",
        "Urine Test": "Laboratory Department",
        "Thyroid Test": "Endocrinology Lab",
        "Diabetes Test": "Diabetology Lab",

        // Scans
        "X-Ray": "Radiology Department",
        "MRI": "MRI Scan Unit",
        "CT Scan": "CT Scan Unit",
        "Ultrasound": "Ultrasound Unit",
        "ECG": "Cardiology Diagnostics",

        // Appointments
        "Emergency": "Emergency Department",
        "Online Consultation": "Telemedicine Department",
        "Specialist Visit": "Specialist Consultation",
        "Vaccination": "Immunization Department",
        "Surgery": "Surgical Department",

        // Pregnancy
        "Obstetrician": "Obstetrics Department",
        "Gynecologist": "Gynecology Department",
        "Pediatrician": "Neonatal & Child Care",
        "Radiologist": "Pregnancy Scan Unit",
        "Endocrinologist": "Hormone Specialist",

        // Insurance
        "Claim Submission": "Insurance Desk",
        "Policy Verification": "Insurance Verification Unit"
    };

    doctorField.value = mapping[sub] || "Hospital Department";
}

// ================= CREATE REQUEST =================
function createRequest() {

    let patient = document.getElementById("patientName").value.trim();
    let category = document.getElementById("category").value;
    let sub = document.getElementById("subCategory").value;
    let doctor = document.getElementById("doctorType").value;
    let priorityElement = document.getElementById("priority");
    let priority = priorityElement ? priorityElement.value : "N/A";

    if (!patient || !category || !sub) {
        alert("Please fill all required fields!");
        return;
    }

    let requests = JSON.parse(localStorage.getItem("requests")) || [];

    requests.push({
        patient,
        category,
        sub,
        doctor,
        priority: category === "Insurance" ? priority : "N/A",
        step: 0,
        status: "In Progress",
        createdAt: new Date().toLocaleString()
    });

    localStorage.setItem("requests", JSON.stringify(requests));

    document.getElementById("viewDashboard").style.display = "block";

    // Clear form
    document.getElementById("patientName").value = "";
}

// ================= LOAD DASHBOARD =================
function loadDashboard() {

    let requestList = document.getElementById("requestList");
    if (!requestList) return;

    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    requestList.innerHTML = "";

    if (requests.length === 0) {
        requestList.innerHTML = "<h3>No Active Requests</h3>";
        return;
    }

    requests.forEach((req, index) => {

        let steps = workflowSteps[req.category] || [];
        let currentStep = steps[req.step] || "Completed";

        let div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <h3>${req.patient}</h3>
            <p><b>Category:</b> ${req.category}</p>
            <p><b>Sub Category:</b> ${req.sub}</p>
            <p><b>Department:</b> ${req.doctor}</p>
            <p><b>Priority:</b> ${req.priority}</p>
            <p><b>Status:</b> ${req.status}</p>
            <p><b>Current Step:</b> ${currentStep}</p>
            <button onclick="nextStep(${index})">Next</button>
        `;

        requestList.appendChild(div);
    });
}

// ================= NEXT STEP =================
function nextStep(index) {

    let requests = JSON.parse(localStorage.getItem("requests")) || [];
    let req = requests[index];
    let steps = workflowSteps[req.category] || [];

    if (req.step < steps.length - 1) {
        req.step++;
    } else {
        req.status = "Completed";
        req.completedAt = new Date().toLocaleString();

        let completed = JSON.parse(localStorage.getItem("completed")) || [];
        completed.push(req);
        localStorage.setItem("completed", JSON.stringify(completed));

        requests.splice(index, 1);
    }

    localStorage.setItem("requests", JSON.stringify(requests));
    loadDashboard();
}

// ================= DOWNLOAD LINE-BY-LINE RECORDS =================
function downloadRecords() {

    let completed = JSON.parse(localStorage.getItem("completed")) || [];

    if (completed.length === 0) {
        alert("No completed records found!");
        return;
    }

    let formattedData = "";

    completed.forEach((record, index) => {
        formattedData += "====================================\n";
        formattedData += "Patient Record #" + (index + 1) + "\n";
        formattedData += "------------------------------------\n";
        formattedData += "Patient Name      : " + record.patient + "\n";
        formattedData += "Category          : " + record.category + "\n";
        formattedData += "Sub Category      : " + record.sub + "\n";
        formattedData += "Department        : " + record.doctor + "\n";
        formattedData += "Priority          : " + record.priority + "\n";
        formattedData += "Created Time      : " + record.createdAt + "\n";
        formattedData += "Completion Time   : " + record.completedAt + "\n";
        formattedData += "Final Status      : " + record.status + "\n";
        formattedData += "====================================\n\n";
    });

    let blob = new Blob([formattedData], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Patient_Records.txt";
    a.click();
}