# JS Malware Sandbox

## Overview
Cybersecurity analysts frequently encounter heavily obfuscated JavaScript when investigating phishing campaigns, malware, and web-based attacks. Traditional static deobfuscation methods often fail because modern malware executes dynamically generated payloads at runtime.

This **JS Malware Sandbox** provides a **quick and safe** way to **observe the real behavior of obfuscated JavaScript malware** by executing it in a controlled **Node.js virtual machine (VM) inside a Docker container**. Instead of relying on static deobfuscation, this sandbox **logs all function calls, return values, and attempts to escape the sandbox**, ensuring that analysts can **see exactly what the script does** without risking real execution.

## Features
- 🛡️ **Safe Execution** – Runs inside a secure Node.js VM within Docker
- 🔍 **Function Call & Return Logging** – Captures all function executions, arguments, and results
- 🚫 **Blocks Network Requests** – Prevents external calls while logging attempts
- 🔬 **Intercepts Obfuscation Tricks** – Stops sandbox evasion via `Function()`, `.constructor()`, and `eval()`
- 🔗 **Detects Document Modifications** – Logs `document.write()`, `createElement()`, and DOM interactions
- 📜 **No Need for Static Deobfuscation** – Malware reveals its true behavior during execution

## Installation
Ensure **Docker** and **Node.js** are installed on your system.

1. **Clone the repository:**
   ```sh
   git clone https://github.com/jfstenuit/jssandbox.git
   cd jssandbox
   ```

2. **Make the sandbox script executable:**
   ```sh
   chmod +x sandbox.sh
   ```

## Usage
To analyze an obfuscated JavaScript file:

```sh
./sandbox.sh malicious.js
```

- This will **start a Docker container** and safely execute the script inside a **sandboxed Node.js VM**.
- All **function calls, DOM interactions, and network attempts** will be logged.
- The script will **run normally inside the sandbox**, but **without any real execution risk**.

### Example output
If the malware attempts to access `window`, modify `document`, or make network requests, the sandbox will **capture and log** these actions:

```
[LOG] Function constructor called with: [ 'return (function() {}.constructor("return this")());' ]
[WARNING] Sandbox escape attempt detected! Redirecting to controlled window.
=== Executing JavaScript in a Safe Sandbox ===
[LOG] document.write() -> "Phishing content here"
[LOG] fetch() attempt blocked: [ 'https://stealer.com/data' ]
[LOG] Function call: eval("var x = 5; x + 10;")
[LOG] eval returned: 15
=== Execution Completed ===
```

## How it works
1. **Creates a controlled environment** inside a **Node.js VM** using `vm.createContext()`.
2. **Replaces dangerous functions** (`eval`, `Function`, `XMLHttpRequest`, `fetch`) with logging-safe versions.
3. **Intercepts sandbox evasion tricks**, ensuring malware is trapped inside the fake `window`.
4. **Logs all function executions and their return values**, revealing the malware’s real actions.
5. **Runs inside an isolated Docker container**, preventing accidental system exposure.

## Why this is better than static deobfuscation
- **Many obfuscated scripts generate code dynamically** – our sandbox captures and logs these executions.
- **Static analysis tools struggle with runtime behaviors** – we execute the malware safely and observe real behavior.
- **Logging function calls reveals the attack flow** – giving analysts a full picture of how the script works.

## Future improvements
✅ **Extract malicious URLs and IOCs automatically**  
✅ **Save logs to a file for forensic analysis**  
✅ **Integrate with bulk malware analysis pipelines**  

## Contributing
Pull requests and improvements are welcome! If you have ideas for additional security features, please open an issue.

## License
MIT License. Use this tool responsibly and ethically.

