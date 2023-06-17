const CRC32C = require("crc-32/crc32c");

const b = Buffer.allocUnsafe(4);

b.writeUInt32BE(CRC32C.buf(Buffer.from("hello march")))

console.log(b);