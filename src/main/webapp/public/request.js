let firstDrop = true;
let drop;
let images = [];
let dropContent;
let parts = [];

document.addEventListener("DOMContentLoaded", function () {
    drop = document.querySelector("#image-drop");
    drop.addEventListener("drop", function (e) {
        e.preventDefault();
        if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                let item = e.dataTransfer.items[i];
                if (item.kind === 'file') {
                    item = item.getAsFile();
                    handleFile(item);
                }
            }
        }
    });

    dropContent = drop.innerHTML;

    drop.addEventListener("dragend", function (e) {
        e.preventDefault();
    })

    drop.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    drop.addEventListener("dragenter", function (e) {
        e.preventDefault();
    });

    drop.addEventListener("dragleave", function (e) {
        e.preventDefault();
    });

    let amount = document.querySelector("#amount");
    let select = document.querySelector("#type");
    let rateDiv = document.querySelector("#rate");
    select.addEventListener('change', function (e) {
        if (e.target.value === "miles") {
            let val = amount.querySelector("input").value;
            amount.innerHTML = "<input style=\"flex: 1;\" type=\"number\" value=\"" + val + "\" />";
            let label = document.createElement("label");
            label.classList.add("form-item");
            let span = document.createElement("span");
            span.innerHTML = "Rate";
            let input = document.createElement("input");
            input.type = "number";
            input.id = "rate-input"
            input.value = ".50"
            label.appendChild(span);
            label.appendChild(input);
            rateDiv.appendChild(label);
            rateDiv.classList.remove("hidden");
        } else {
            let val = amount.querySelector("input").value;
            amount.innerHTML = "$<input style=\"flex: 1;\" type=\"number\" value=\"" + val + "\" />";
            let label = rateDiv.querySelector("label");
            if (label) {
                label.remove();
                rateDiv.classList.add("hidden");
            }
        }
    });

    select.value = "select";

    document.querySelector("#desc").value = "";
    document.querySelector("#amount > input").value = "";

    document.querySelector("#add-part").addEventListener('click', function (e) {
        e.stopPropagation();
        toggleModal('add-modal');
    });

    let fileInput = document.querySelector("#file-input");
    fileInput.addEventListener('change', function () {
        let files = fileInput.files;
        for (let i = 0; i < files.length; i++) {
            handleFile(files[i])
        }
    });
});

function handleSubmit() {
    let type = document.querySelector("#type").value;
    let amount = parseFloat(document.querySelector("#amount > input").value);
    let description = document.querySelector("#desc").value;

    if (type === "select" || !description || !amount) {
        let alert = new Alert(AlertType.Failed, "Please enter amount, description and select a type");
        alert.setHeader("Invalid form");
        pushAlert(alert);
        return;
    }

    let rate = document.querySelector("#rate-input");
    let rateVal = null;
    if (rate) {
        rateVal = parseFloat(rate.value);
        if (!rateVal) {
            let alert = new Alert(AlertType.Failed, "Please enter rate");
            alert.setHeader("Invalid form");
            pushAlert(alert);
            return;
        }
    }

    let part = {
        type: type,
        description: description,
        amount: amount,
        images: images
    }

    if (rateVal) {
        part['rate'] = rateVal;
    }

    parts.push(part);
    let alert = new Alert(AlertType.Success, "Succesfully added expense")
    pushAlert(alert);
    clearModal();
    toggleModal('add-modal');
    addPartToTable(part);
}

function addPartToTable(part) {
    let tr = document.createElement("tr");
    let amount = document.createElement("td");
    let desc = document.createElement("td");
    let type = document.createElement("td");

    if (part.type === "miles") {
        amount.innerHTML = part.amount;
    } else {
        amount.innerHTML = '$' + part.amount;
    }

    desc.innerHTML = part.description;
    type.innerHTML = document.querySelector("option[value=" + part.type + "]").innerHTML;

    tr.appendChild(amount)
    tr.appendChild(type)
    tr.appendChild(desc)

    let amountVal = part.amount;
    if (part.rate) {
        amountVal *= parseFloat(part.rate);
    }

    document.querySelector("#expenses > table").appendChild(tr);

    let totalElm = document.querySelector("#total");
    totalElm.innerHTML = parseFloat(totalElm.innerHTML) + amountVal;

    let expensesElm = document.querySelector("#expense-amount");
    expensesElm.innerHTML = parseFloat(expensesElm.innerHTML) + 1;
}

function handleFile(file) {
    let type = file.type;
    let types = type.split('/');
    if (file.size < 1) {
        return;
    }
    if (types[0] !== "image") {
        let alert = new Alert(AlertType.Failed, "File with name " + file.name + " was not an image!");
        alert.setHeader("Failed to upload file");
        pushAlert(alert);
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('loadend', () => {
        if (firstDrop) {
            drop.innerHTML = "";
            drop.classList.remove("drop")
            firstDrop = false;
            document.querySelector("#lower-upload").classList.remove("hidden");
        }
        let div = document.createElement("div");
        let dummy = document.createElement("div");
        dummy.classList.add("dummy");
        let img = document.createElement("img");
        div.classList.add("drop-img");
        let base64 = reader.result;
        img.src = base64;
        images.push(base64);
        div.appendChild(dummy);
        div.appendChild(img);
        drop.appendChild(div);
    });
}

function handleUploadButton() {
    document.querySelector("#file-input").click();
}

function clearModal() {
    drop.innerHTML = dropContent;
    document.querySelector("#type").value = "select";
    document.querySelector("#amount").innerHTML = "<input style=\"flex: 1;\" type=\"number\" value=\"\" />";
    document.querySelector("#desc").value = "";
    let rateDiv = document.querySelector("#rate");
    rateDiv.classList.add('hidden');
    let label = rateDiv.querySelector("label")
    if (label) {
        label.remove();
    }
    images = [];
    firstDrop = true;
    drop.classList.add("drop");
    document.querySelector("#lower-upload").classList.add("hidden");
}

let currentSubmit = false;
async function hanldeFinalSubmit() {
    if (currentSubmit) {
        return;
    }
    if (parts.length === 0) {
        let alert = new Alert(AlertType.Failed, "Please add at least one expense");
        alert.setHeader("Invalid form");
        pushAlert(alert);
        return;
    }

    let res = await fetch("/ers/api/requests", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(parts)
    });

    if (res.status === 200) {
        currentSubmit = true;
        let alert = new Alert(AlertType.Success, "Will redirect you soon");
        alert.setHeader("Submitted request");
        pushAlert(alert);
        window.setTimeout(() => {
            window.location.href = "/ers/";
        }, 5000);
    } else {
        let alert = new Alert(AlertType.Failed, "An error occurred when submitting the request");
        alert.setHeader("Failed to submit request");
        pushAlert(alert);
    }
}