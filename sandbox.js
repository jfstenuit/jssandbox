const vm = require('vm');
const fs = require('fs');

// Create a controlled sandbox global object
const sandboxGlobals = {
    console: console, 
    setTimeout: () => console.log("[LOG] setTimeout() blocked"),
    setInterval: () => console.log("[LOG] setInterval() blocked"),
    
    // Fake "window" and "document"
    window: {
        location: { href: "http://sandbox.local" },
        navigator: { userAgent: "SandboxedBrowser" },
        alert: (msg) => console.log(`[LOG] alert(): ${msg}`),
    },

    document: {
        createElement: (tag) => {
            console.log(`[LOG] document.createElement("${tag}")`);
            return { tagName: tag };
        },
        write: (content) => {
            console.log(`[LOG] document.write() ->`, content);
        },
        body: {
            appendChild: (element) => {
                console.log(`[LOG] document.body.appendChild() ->`, element.tagName);
            },
        },
    },

    fetch: (...args) => {
        console.log("[LOG] fetch() attempt blocked:", args);
        return Promise.resolve({ json: () => ({}), text: () => "" });
    },

    XMLHttpRequest: class {
        open(method, url) {
            console.log(`[LOG] XMLHttpRequest open() - ${method} ${url}`);
        }
        send() {
            console.log("[LOG] XMLHttpRequest send() blocked");
        }
    },

    WebSocket: class {
        constructor(url) {
            console.log(`[LOG] WebSocket blocked: ${url}`);
        }
    },
};

// Restricted Function constructor to prevent sandbox escape
function safeFunction(...args) {
    console.log("[LOG] Function constructor called with:", args);

    // Block attempts to access the global object
    if (args[0] && args[0].includes("return this")) {
        console.log("[WARNING] Sandbox escape attempt detected! Redirecting to safe environment.");
        return () => sandboxGlobals.window; // Instead of real global, return our fake window
    }

    // Run the function safely inside the sandbox
    return new vm.Script(`(function() { return (${args.join(", ")}); })()`).runInContext(sandbox);
}

// Override Function() to prevent sandbox escape
sandboxGlobals.Function = safeFunction;

// Override `.constructor` on all functions to prevent sneaky backdoor escapes
sandboxGlobals.Function.prototype.constructor = safeFunction;

// Ensure 'this' inside the sandbox is our controlled environment
const sandbox = vm.createContext(sandboxGlobals);

// Read and execute the malicious script
const scriptCode = fs.readFileSync("malware.js", "utf-8");

console.log("=== Executing JavaScript in a Safe Sandbox ===");
try {
    const script = new vm.Script(scriptCode);
    script.runInContext(sandbox);
} catch (err) {
    console.log("[ERROR] Execution failed:", err.message);
}

console.log("=== Execution Completed ===");
