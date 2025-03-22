let count = 0;

function watch() {
  let api = "wss://k0s.op.milvzn.com/api/agents/watch";
  let a = new WebSocket(api);
  a.binaryType = "blob";
  a.addEventListener("message", ({ data }: any) => {
    let out = JSON.parse(data);
    count = out.length;
  });
}

export { count, watch };
