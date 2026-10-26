import { server } from "./server.mjs";

const PORT = Number(process.env.PORT ?? 8787);
server.listen(PORT, () => console.log(`saju proxy listening on http://localhost:${PORT}`));
