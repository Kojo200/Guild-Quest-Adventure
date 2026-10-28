
const MOUSE_ACTIONS = { attack: "Left Click" };

export function createKeyNamer(keyMap) {
    const names = {};
    for (const [name, code] of Object.entries(keyMap)) {
        names[code] ??= /^NUM\d$/.test(name) ? name.slice(3) : name;
    }
    return (keyCode) => names[keyCode] ?? `#${keyCode}`;
}

export function formatHint(text, { bindings = {}, keyName = (code) => `#${code}` } = {}) {
    return text.replace(/\{(\w+)\}/g, (token, action) => {
        if (Object.prototype.hasOwnProperty.call(MOUSE_ACTIONS, action)) {
            return MOUSE_ACTIONS[action];
        }
        const keyCode = Object.prototype.hasOwnProperty.call(bindings, action) ? bindings[action] : undefined;
        return keyCode === undefined ? token : keyName(keyCode);
    });
}

export function trackerSummary(quest, progress) {
    const current = progress.find((objective) => objective.visible && !objective.done);
    if (!current) {
       
        return { title: quest.title, line: "Ready to hand in", hint: "" };
    }
    const count = current.required > 1 ? ` (${current.current}/${current.required})` : "";
    return { title: quest.title, line: `${current.description}${count}`, hint: current.hint };
}
