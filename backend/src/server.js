// kết nối DB
// chạy app

require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./configs/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error);
  }
}

startServer();