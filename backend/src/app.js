const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
// const homeRoutes = require("./routes/home.routes");
// const artistPublicRoutes = require("./routes/artistPublic.routes");
// const artistProfileRoutes = require("./routes/artistProfile.routes");
// const artistOrderRoutes = require("./routes/artistOrder.routes");
// const artistScheduleRoutes = require("./routes/artistSchedule.routes");
// const artistRevenueRoutes = require("./routes/artistRevenue.routes");

// const productRoutes = require("./routes/product.routes");
// const cartRoutes = require("./routes/cart.routes");
// const orderRoutes = require("./routes/order.routes");

// const adminDashboardRoutes = require("./routes/adminDashboard.routes");
// const adminRevenueRoutes = require("./routes/adminRevenue.routes");
// const adminUserRoutes = require("./routes/adminUser.routes");
// const adminArtistRoutes = require("./routes/adminArtist.routes");
// const adminProductRoutes = require("./routes/adminProduct.routes");
// const adminOrderRoutes = require("./routes/adminOrder.routes");
// const userRoutes = require("./routes/user.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
// app.use("/api/home", homeRoutes);

// app.use("/api/artists", artistPublicRoutes);

// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartRoutes);
// app.use("/api/orders", orderRoutes);

// app.use("/api/artist/me", artistProfileRoutes);
// app.use("/api/artist/me/orders", artistOrderRoutes);
// app.use("/api/artist/me/schedules", artistScheduleRoutes);
// app.use("/api/artist/me/revenue", artistRevenueRoutes);

// app.use("/api/admin/dashboard", adminDashboardRoutes);
// app.use("/api/admin/revenue", adminRevenueRoutes);
// app.use("/api/admin/users", adminUserRoutes);
// app.use("/api/admin/artists", adminArtistRoutes);
// app.use("/api/admin/products", adminProductRoutes);
// app.use("/api/admin/orders", adminOrderRoutes);

// app.use("/api/user", userRoutes);

app.use(errorMiddleware);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found. Check if /api/ prefix is included."
  });
});

module.exports = app;