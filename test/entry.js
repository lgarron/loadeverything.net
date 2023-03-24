async function testLoad(resourceType, loadFn) {
  try {
    if (await loadFn() === true) {
      console.log("✅", resourceType);
    } else {
      console.error("❌", resourceType);
    }
  } catch(e) {
    console.error("❌", resourceType, e.__proto__.name);
  }
}

(async () => {
  await testLoad("JS (sync import.meta.resolve)", async () => {
    const libPath = import.meta.resolve("./indirect-path/code.js");
    return (await import(libPath)).test() == "okay";
  });

  await testLoad("JS (async import.meta.resolve)", async () => {
    const libPath = await import.meta.resolve("./indirect-path/code.js");
    return (await import(libPath)).test() == "okay";
  });

  await testLoad("JS (new URL)", async () => {
    const libPath = new URL("./indirect-path/code.js", import.meta.url);
    return (await import(libPath)).test() == "okay";
  });

  await testLoad("JSON fetch (sync import.meta.resolve)", async () => {
    const jsonPath = import.meta.resolve("./relative-path/data.json");
    const response = await fetch(jsonPath);
    return (await response.json())["value"] == "okay";
  });

  await testLoad("JSON fetch (async import.meta.resolve)", async () => {
    const jsonPath = await import.meta.resolve("./relative-path/data.json");
    const response = await fetch(jsonPath);
    return (await response.json())["value"] == "okay";
  });

  await testLoad("JSON fetch (new URL)", async () => {
    const jsonPath = new URL("./relative-path/data.json", import.meta.url);
    const response = await fetch(jsonPath);
    return (await response.json())["value"] == "okay";
  });

  await testLoad("Web worker (sync import.meta.resolve)", async () => {
    return new Promise((resolve, reject) => {
      const workerPath = import.meta.resolve("./indirect-path/worker.js");
      if (!globalThis.Worker) {
        resolve(false);
        return;
      }
      const worker = new Worker(workerPath, { type: "module" });
      worker.addEventListener("message", (e) => {
        resolve(e.data === "okay")
      });
      worker.postMessage("test");
      setTimeout(() => {
        reject(new Error("worker load timed out"));
      }, 2000);
    });
  });

  await testLoad("Web worker (async import.meta.resolve)", async () => {
    return new Promise(async (resolve, reject) => {
      const workerPath = await import.meta.resolve("./indirect-path/worker.js");
      if (!globalThis.Worker) {
        resolve(false);
        return;
      }
      const worker = new Worker(workerPath, { type: "module" });
      worker.addEventListener("message", (e) => {
        resolve(e.data === "okay")
      });
      worker.postMessage("test");
      setTimeout(() => {
        reject(new Error("worker load timed out"));
      }, 2000);
    });
  });

  await testLoad("Web worker (new URL)", async () => {
    return new Promise((resolve, reject) => {
      const workerPath = new URL("./indirect-path/worker.js", import.meta.url);
      if (!globalThis.Worker) {
        resolve(false);
        return;
      }
      const worker = new Worker(workerPath, { type: "module" });
      worker.addEventListener("message", (e) => {
        resolve(e.data === "okay")
      });
      worker.postMessage("test");
      setTimeout(() => {
        reject(new Error("worker load timed out"));
      }, 2000);
    });
  });

  await testLoad("WASM (sync import.meta.resolve)", async () => {
    const hello_wasm = await import("./indirect-path/hello_wasm_import_meta_resolve.js");
    await hello_wasm.default();
    return hello_wasm.test() == "okay";
  });

  await testLoad("WASM (async import.meta.resolve)", async () => {
    const hello_wasm = await import("./indirect-path/hello_wasm_async_import_meta_resolve.js");
    await hello_wasm.default();
    return hello_wasm.test() == "okay";
  });

  await testLoad("WASM (new URL)", async () => {
    const hello_wasm = await import("./indirect-path/hello_wasm_new_URL.js");
    await hello_wasm.default();
    return hello_wasm.test() == "okay";
  });

  // // Arbitrary resources
  // const resourcePath = import.meta.resolve("./resource");
  // const response = await fetch(resourcePath);
  // // binary
  // console.log(await response.arrayBuffer());
  // // text
  // console.log(await response.text());

})();
