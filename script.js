// CHANGE THESE SETTINGS DURING THE LIVE PRESENTATION

const SETTINGS = {
    actionsPerLock: 2,
    freedomLossPerAction: 20, // 5 adımda tam 0'a düşmesi için ayarlandı (100 / 5 = 20)
    startingFreedom: 100,
    moveStep: 28,
    resizeStep: 12,
    initialShapeSize: 62
};

// GAME STATE

let freedom = SETTINGS.startingFreedom;
let actions = 0;
let selectedShape = null;

let lockedTools = {
    add: false,
    move: false,
    resize: false
};

const canvas = document.getElementById("canvas");
const freedomValue = document.getElementById("freedomValue");
const freedomBar = document.getElementById("freedomBar");
const actionCount = document.getElementById("actionCount");
const message = document.getElementById("message");
const lockedToolsText = document.getElementById("lockedTools");

// BUTTONS

const addButton = document.getElementById("addButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");
const smallerButton = document.getElementById("smallerButton");
const biggerButton = document.getElementById("biggerButton");
const resetButton = document.getElementById("resetButton");

// SELECT A SHAPE

function selectShape(shape) {
    document.querySelectorAll(".shape").forEach(item => {
        item.style.outline = "none";
    });

    selectedShape = shape;
    selectedShape.style.outline = "2px dashed #171717";
}

// MAKE SHAPES CLICKABLE

function makeSelectable(shape) {
    shape.addEventListener("click", () => {
        selectShape(shape);
        message.textContent = "Shape selected. You can now change it.";
    });
}

// INITIAL SHAPES

document.querySelectorAll(".shape").forEach(shape => {
    makeSelectable(shape);
});

selectShape(document.querySelector(".circle"));

// UPDATE THE INTERFACE

function updateUI() {
    freedomValue.textContent = freedom;
    freedomBar.style.width = freedom + "%";
    actionCount.textContent = actions;

    // Eğer freedom 0 olduysa tüm etkileşim butonlarını devre dışı bırak
    const isGameOver = freedom === 0;

    addButton.disabled = lockedTools.add || isGameOver;

    const moveButtons = [
        leftButton,
        rightButton,
        upButton,
        downButton
    ];

    moveButtons.forEach(button => {
        button.disabled = lockedTools.move || isGameOver;
    });

    smallerButton.disabled = lockedTools.resize || isGameOver;
    biggerButton.disabled = lockedTools.resize || isGameOver;

    const locked = Object.keys(lockedTools)
        .filter(tool => lockedTools[tool]);

    if (isGameOver) {
        lockedToolsText.textContent = "EXPERIMENT TERMINATED: ZERO FREEDOM";
    } else {
        lockedToolsText.textContent = locked.length
            ? "LOCKED TOOLS: " + locked.join(", ").toUpperCase()
            : "LOCKED TOOLS: NONE";
    }
}

// RECORD AN ACTION

function recordAction() {
    actions++;

    freedom = Math.max(
        0,
        freedom - SETTINGS.freedomLossPerAction
    );

    if (actions % SETTINGS.actionsPerLock === 0 && freedom > 0) {
        lockRandomTool();
    }

    updateUI();

    if (freedom === 0) {
        message.textContent =
            "Your freedom has reached zero. The experiment is over.";
    }
}

// LOCK A TOOL

function lockRandomTool() {
    const availableTools = Object.keys(lockedTools)
        .filter(tool => !lockedTools[tool]);

    if (availableTools.length === 0) return;

    const randomIndex = Math.floor(
        Math.random() * availableTools.length
    );

    const toolToLock = availableTools[randomIndex];

    lockedTools[toolToLock] = true;

    message.textContent =
        "A consequence of your action: " +
        toolToLock.toUpperCase() +
        " is now locked.";
}

// ADD A SHAPE

addButton.addEventListener("click", () => {
    if (lockedTools.add || freedom === 0) return;

    const shape = document.createElement("div");

    shape.classList.add("shape");

    if (Math.random() > 0.5) {
        shape.classList.add("circle");
    }

    shape.style.left = Math.random() * 75 + "%";
    shape.style.top = Math.random() * 70 + "%";

    canvas.appendChild(shape);

    makeSelectable(shape);
    selectShape(shape);

    recordAction();
});

// MOVE SHAPES

function moveShape(x, y) {
    if (lockedTools.move || freedom === 0) return;

    if (!selectedShape) return;

    const currentLeft = parseFloat(selectedShape.style.left) ||
        selectedShape.offsetLeft / canvas.clientWidth * 100;

    const currentTop = parseFloat(selectedShape.style.top) ||
        selectedShape.offsetTop / canvas.clientHeight * 100;

    selectedShape.style.left = Math.max(
        0,
        Math.min(85, currentLeft + x)
    ) + "%";

    selectedShape.style.top = Math.max(
        0,
        Math.min(80, currentTop + y)
    ) + "%";

    recordAction();
}

// RESIZE SHAPES

function resizeShape(amount) {
    if (lockedTools.resize || freedom === 0) return;

    if (!selectedShape) return;

    const currentSize = selectedShape.offsetWidth;

    const newSize = Math.max(
        20,
        Math.min(160, currentSize + amount)
    );

    selectedShape.style.width = newSize + "px";
    selectedShape.style.height = newSize + "px";

    recordAction();
}

// MOVEMENT BUTTONS

leftButton.addEventListener("click", () => {
    moveShape(-SETTINGS.moveStep / 4, 0);
});

rightButton.addEventListener("click", () => {
    moveShape(SETTINGS.moveStep / 4, 0);
});

upButton.addEventListener("click", () => {
    moveShape(0, -SETTINGS.moveStep / 4);
});

downButton.addEventListener("click", () => {
    moveShape(0, SETTINGS.moveStep / 4);
});

// RESIZE BUTTONS

smallerButton.addEventListener("click", () => {
    resizeShape(-SETTINGS.resizeStep);
});

biggerButton.addEventListener("click", () => {
    resizeShape(SETTINGS.resizeStep);
});

// KEYBOARD ALTERNATIVES

document.addEventListener("keydown", event => {
    if (event.target.tagName === "INPUT" || freedom === 0) return;

    if (event.key.toLowerCase() === "a") {
        addButton.click();
    }

    if (event.key === "ArrowLeft") {
        leftButton.click();
    }

    if (event.key === "ArrowRight") {
        rightButton.click();
    }

    if (event.key === "ArrowUp") {
        upButton.click();
    }

    if (event.key === "ArrowDown") {
        downButton.click();
    }

    if (event.key === "+") {
        biggerButton.click();
    }

    if (event.key === "-") {
        smallerButton.click();
    }
});

// RESET THE EXPERIMENT

resetButton.addEventListener("click", () => {
    freedom = SETTINGS.startingFreedom;
    actions = 0;

    lockedTools = {
        add: false,
        move: false,
        resize: false
    };

    canvas.innerHTML = `
        <div class="shape circle"></div>
        <div class="shape square"></div>
    `;

    document.querySelectorAll(".shape").forEach(shape => {
        makeSelectable(shape);
    });

    selectShape(document.querySelector(".circle"));

    message.textContent =
        "You are free to experiment. Start making changes.";

    updateUI();
});

// INITIAL DISPLAY

updateUI();
